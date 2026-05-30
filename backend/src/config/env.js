const path = require("path");

const backendRoot = path.resolve(__dirname, "..", "..");
require("dotenv").config({
  path: path.join(backendRoot, ".env")
});

function parseBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

function resolveFromBackendRoot(value) {
  if (!value) {
    return value;
  }

  return path.isAbsolute(value) ? value : path.resolve(backendRoot, value);
}

module.exports = {
  BACKEND_ROOT: backendRoot,
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  JWT_SECRET: process.env.JWT_SECRET || "change_this_secret",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8001",
  AI_SERVICE_TIMEOUT_MS: Number(process.env.AI_SERVICE_TIMEOUT_MS || 600000),
  USE_BLOCKCHAIN_MOCK: parseBoolean(process.env.USE_BLOCKCHAIN_MOCK, true),
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  CONTRACT_ABI_PATH: resolveFromBackendRoot(
    process.env.CONTRACT_ABI_PATH || "./src/config/DocumentRegistry.json"
  ),
  UPLOAD_DIR: resolveFromBackendRoot(process.env.UPLOAD_DIR || "src/uploads")
};
