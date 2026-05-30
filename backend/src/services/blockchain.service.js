const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const env = require("../config/env");
const { getDocumentRegistryContract } = require("../config/blockchain");

const mockRegistryPath = path.join(env.UPLOAD_DIR, "mock-blockchain.json");

function ensureValidHash(sha256Hash) {
  if (!/^[a-fA-F0-9]{64}$/.test(sha256Hash)) {
    throw new Error("SHA-256 hash must be 64 hexadecimal characters.");
  }
}

function toBytes32Values(documentId, sha256Hash) {
  ensureValidHash(sha256Hash);

  return {
    documentIdBytes32: ethers.id(documentId),
    documentHashBytes32: `0x${sha256Hash}`
  };
}

function readMockRegistry() {
  if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  }

  if (!fs.existsSync(mockRegistryPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(mockRegistryPath, "utf8"));
  } catch (error) {
    return {};
  }
}

function writeMockRegistry(registry) {
  fs.writeFileSync(mockRegistryPath, JSON.stringify(registry, null, 2));
}

async function registerDocumentHash(documentId, sha256Hash) {
  const { documentIdBytes32, documentHashBytes32 } = toBytes32Values(documentId, sha256Hash);

  // Integration point: in mock mode this simulates the smart contract until DocumentRegistry is deployed.
  if (env.USE_BLOCKCHAIN_MOCK) {
    const registry = readMockRegistry();
    registry[documentId] = {
      documentIdBytes32,
      documentHashBytes32,
      sha256Hash,
      revoked: false,
      registeredAt: new Date().toISOString()
    };
    writeMockRegistry(registry);

    return {
      status: "REGISTERED",
      txHash: `0xmock${Buffer.from(documentId).toString("hex").slice(0, 58).padEnd(58, "0")}`
    };
  }

  const contract = getDocumentRegistryContract();
  const tx = await contract.registerDocument(documentIdBytes32, documentHashBytes32);
  console.log(`registerDocument transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();

  return {
    status: "REGISTERED",
    txHash: tx.hash,
    blockNumber: receipt?.blockNumber
  };
}

async function verifyDocumentHash(documentId, sha256Hash) {
  const { documentIdBytes32, documentHashBytes32 } = toBytes32Values(documentId, sha256Hash);

  if (env.USE_BLOCKCHAIN_MOCK) {
    const registry = readMockRegistry();
    const stored = registry[documentId];
    return Boolean(stored && !stored.revoked && stored.documentHashBytes32 === documentHashBytes32);
  }

  const contract = getDocumentRegistryContract();
  const verificationResult = await contract.verifyDocument(documentIdBytes32, documentHashBytes32);

  if (typeof verificationResult === "boolean") {
    return verificationResult;
  }

  if (Array.isArray(verificationResult)) {
    return Boolean(verificationResult[0] && verificationResult[1]);
  }

  if (
    typeof verificationResult === "object" &&
    verificationResult !== null &&
    "exists" in verificationResult &&
    "isValid" in verificationResult
  ) {
    return Boolean(verificationResult.exists && verificationResult.isValid);
  }

  return Boolean(verificationResult);
}

async function getDocumentHash(documentId) {
  if (env.USE_BLOCKCHAIN_MOCK) {
    const registry = readMockRegistry();
    return registry[documentId]?.documentHashBytes32 || null;
  }

  const documentIdBytes32 = ethers.id(documentId);

  try {
    return await getDocumentRegistryContract().getDocumentHash(documentIdBytes32);
  } catch (error) {
    console.error(`getDocumentHash failed for ${documentId}:`, error.shortMessage || error.message);
    return null;
  }
}

async function documentExists(documentId) {
  if (env.USE_BLOCKCHAIN_MOCK) {
    const registry = readMockRegistry();
    return Boolean(registry[documentId] && !registry[documentId].revoked);
  }

  const documentIdBytes32 = ethers.id(documentId);

  try {
    return Boolean(await getDocumentRegistryContract().documentExists(documentIdBytes32));
  } catch (error) {
    console.error(`documentExists failed for ${documentId}:`, error.shortMessage || error.message);
    return false;
  }
}

async function revokeDocument(documentId) {
  if (env.USE_BLOCKCHAIN_MOCK) {
    const registry = readMockRegistry();
    if (registry[documentId]) {
      registry[documentId].revoked = true;
      registry[documentId].revokedAt = new Date().toISOString();
      writeMockRegistry(registry);
    }
    return {
      status: "REVOKED",
      txHash: `0xmockrevoke${Buffer.from(documentId).toString("hex").slice(0, 52).padEnd(52, "0")}`
    };
  }

  const documentIdBytes32 = ethers.id(documentId);
  const tx = await getDocumentRegistryContract().revokeDocument(documentIdBytes32);
  await tx.wait();

  return {
    status: "REVOKED",
    txHash: tx.hash
  };
}

module.exports = {
  registerDocumentHash,
  verifyDocumentHash,
  getDocumentHash,
  documentExists,
  revokeDocument
};
