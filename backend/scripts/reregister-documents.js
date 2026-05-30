const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { ethers } = require("ethers");
const { PrismaClient } = require("@prisma/client");

const backendRoot = path.resolve(__dirname, "..");
const envPath = path.join(backendRoot, ".env");
dotenv.config({ path: envPath });

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function parseBoolean(value) {
  return ["true", "1", "yes", "on"].includes(String(value || "").toLowerCase());
}

function resolveFromBackendRoot(value) {
  if (!value) {
    return value;
  }

  return path.isAbsolute(value) ? value : path.resolve(backendRoot, value);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function loadContractAbi(abiPath) {
  if (!fs.existsSync(abiPath)) {
    fail(`ABI file is missing: ${abiPath}`);
  }

  let artifact;

  try {
    artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  } catch (error) {
    fail(`ABI file is not valid JSON: ${abiPath}. ${error.message}`);
  }

  const abi = Array.isArray(artifact) ? artifact : artifact.abi;

  if (!Array.isArray(abi)) {
    fail("Invalid contract ABI: expected ABI array or Hardhat artifact with abi field.");
  }

  return abi;
}

function validateSha256Hash(hash) {
  return /^[a-fA-F0-9]{64}$/.test(hash || "");
}

function validateEnvironment() {
  if (parseBoolean(process.env.USE_BLOCKCHAIN_MOCK)) {
    fail("USE_BLOCKCHAIN_MOCK is true. Re-registration requires real blockchain mode.");
  }

  if (!process.env.BLOCKCHAIN_RPC_URL) {
    fail("BLOCKCHAIN_RPC_URL is missing in backend/.env.");
  }

  if (!process.env.CONTRACT_ADDRESS) {
    fail("CONTRACT_ADDRESS is missing in backend/.env.");
  }

  if (!process.env.PRIVATE_KEY) {
    fail("PRIVATE_KEY is missing in backend/.env.");
  }

  if (!process.env.CONTRACT_ABI_PATH) {
    fail("CONTRACT_ABI_PATH is missing in backend/.env.");
  }
}

async function updateDocumentBlockchainFields(documentId, data) {
  if (dryRun) {
    return;
  }

  await prisma.document.update({
    where: { id: documentId },
    data,
  });
}

async function main() {
  validateEnvironment();

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const abiPath = resolveFromBackendRoot(process.env.CONTRACT_ABI_PATH);
  const abi = loadContractAbi(abiPath);

  console.log("Re-registering documents on blockchain...");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`RPC URL: ${rpcUrl}`);
  console.log(`Contract: ${contractAddress}`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    await provider.getBlockNumber();
  } catch (error) {
    fail(`Hardhat node is not reachable at ${rpcUrl}. ${error.message}`);
  }

  const contractCode = await provider.getCode(contractAddress);
  if (!contractCode || contractCode === "0x") {
    fail(`No contract code found at ${contractAddress}. Deploy the contract and update backend/.env.`);
  }

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const documents = await prisma.document.findMany({
    where: {
      documentCode: { not: "" },
      sha256Hash: { not: "" },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      documentCode: true,
      sha256Hash: true,
      blockchainStatus: true,
    },
  });

  console.log(`Documents found: ${documents.length}`);
  console.log("");

  const summary = {
    processed: 0,
    registered: 0,
    skipped: 0,
    failed: 0,
  };

  for (const document of documents) {
    summary.processed += 1;
    const prefix = `[${document.documentCode}]`;

    try {
      if (!document.documentCode || !validateSha256Hash(document.sha256Hash)) {
        throw new Error("Missing documentCode or invalid SHA-256 hash.");
      }

      const documentIdBytes32 = ethers.id(document.documentCode);
      const documentHashBytes32 = `0x${document.sha256Hash}`;
      const exists = await contract.documentExists(documentIdBytes32);

      if (exists) {
        console.log(`${prefix} Already registered. Skipping.`);
        await updateDocumentBlockchainFields(document.id, {
          blockchainStatus: "REGISTERED",
        });
        summary.skipped += 1;
        continue;
      }

      if (dryRun) {
        console.log(`${prefix} Would register hash ${documentHashBytes32}.`);
        summary.registered += 1;
        continue;
      }

      console.log(`${prefix} Registering...`);
      const tx = await contract.registerDocument(documentIdBytes32, documentHashBytes32);
      console.log(`${prefix} Transaction sent: ${tx.hash}`);
      await tx.wait();

      await updateDocumentBlockchainFields(document.id, {
        blockchainStatus: "REGISTERED",
        blockchainTxHash: tx.hash,
      });

      console.log(`${prefix} Success. Tx: ${tx.hash}`);
      summary.registered += 1;
    } catch (error) {
      const message = error.shortMessage || error.reason || error.message || "Unknown error";
      console.error(`${prefix} Failed: ${message}`);
      summary.failed += 1;

      await updateDocumentBlockchainFields(document.id, {
        blockchainStatus: "FAILED",
      });
    }

    console.log("");
  }

  console.log("Summary:");
  console.log(`Processed: ${summary.processed}`);
  console.log(`${dryRun ? "Would register" : "Registered"}: ${summary.registered}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);
}

main()
  .catch((error) => {
    console.error("Fatal error:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
