const fs = require("fs");
const { ethers } = require("ethers");
const env = require("./env");

let contract;

function getContractAbi() {
  const abiFile = fs.readFileSync(env.CONTRACT_ABI_PATH, "utf8");
  const artifact = JSON.parse(abiFile);
  const abi = Array.isArray(artifact) ? artifact : artifact.abi;

  if (!Array.isArray(abi)) {
    throw new Error(
      "Invalid contract ABI: expected ABI array or Hardhat artifact with abi field."
    );
  }

  console.log("Blockchain ABI loaded successfully.");
  return abi;
}

function getDocumentRegistryContract() {
  if (contract) {
    return contract;
  }

  if (!env.CONTRACT_ADDRESS || !env.PRIVATE_KEY) {
    throw new Error("Blockchain contract configuration is incomplete.");
  }

  const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
  const abi = getContractAbi();

  console.log(`Blockchain RPC URL: ${env.BLOCKCHAIN_RPC_URL}`);
  console.log(`DocumentRegistry contract address: ${env.CONTRACT_ADDRESS}`);

  contract = new ethers.Contract(env.CONTRACT_ADDRESS, abi, wallet);
  return contract;
}

module.exports = {
  getDocumentRegistryContract
};
