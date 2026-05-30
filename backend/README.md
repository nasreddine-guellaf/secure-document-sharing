# Secure Document Sharing Backend

Node.js + Express backend for the Secure Document Sharing System.

## What this backend does

- JWT authentication with `USER`, `VERIFIER`, and `ADMIN` roles.
- Document upload with Multer.
- SHA-256 file hashing.
- External AI classification call through `src/services/ai.service.js`.
- Smart contract integration through `src/services/blockchain.service.js`.
- SQLite persistence with Prisma.
- Document sharing, verification history, and admin dashboards APIs.

The blockchain service uses `USE_BLOCKCHAIN_MOCK=true` by default so the app works before the Solidity contract is ready.

## Setup

```bash
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

## Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@secure-share.test | Admin123! |
| USER | user@secure-share.test | User123! |
| VERIFIER | verifier@secure-share.test | Verifier123! |

## Main endpoints

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Documents:

- `POST /api/documents/upload`
- `GET /api/documents/my`
- `GET /api/documents/:id`
- `GET /api/documents/download/:id`
- `DELETE /api/documents/:id`

Verification:

- `POST /api/verifications/verify`
- `GET /api/verifications/history`

Shares:

- `POST /api/shares`
- `GET /api/shares/received`
- `GET /api/shares/sent`
- `DELETE /api/shares/:id`

Admin:

- `GET /api/admin/users`
- `GET /api/admin/documents`
- `GET /api/admin/verifications`
- `GET /api/admin/categories`
- `POST /api/admin/categories`

## Upload example

Send `multipart/form-data`:

- `file`: PDF, DOCX, or TXT

Response:

```json
{
  "success": true,
  "message": "Document uploaded and secured successfully",
  "data": {
    "documentId": "clx123",
    "documentCode": "DOC-2026-0001",
    "originalName": "contract.pdf",
    "sha256Hash": "a3f5...",
    "category": "Contrat",
    "confidence": 0.92,
    "blockchainStatus": "REGISTERED",
    "blockchainTxHash": "0xmock..."
  }
}
```

## AI integration

Configured with:

```env
AI_SERVICE_URL=http://localhost:8001
```

The backend calls:

```http
POST /classify
Content-Type: multipart/form-data
```

If the AI service is offline, the backend stores a safe fallback category:

```json
{
  "category": "Autre",
  "confidence": 0,
  "model": "AI service unavailable",
  "language": "unknown",
  "extracted_text_length": 0
}
```

## Blockchain integration

Mock mode is enabled by default:

```env
USE_BLOCKCHAIN_MOCK=true
```

When your teammate provides the deployed contract:

1. Put the real ABI at `src/config/DocumentRegistry.json`.
2. Set `USE_BLOCKCHAIN_MOCK=false`.
3. Fill in `BLOCKCHAIN_RPC_URL`, `CONTRACT_ADDRESS`, and `PRIVATE_KEY`.

The service converts values as required:

- `documentId` string to `bytes32` with `ethers.id(documentId)`
- SHA-256 hash to `bytes32` with `"0x" + sha256Hash`

## Re-register Documents After Hardhat Restart

Local Hardhat blockchain state is temporary. If you restart `npx hardhat node`, old documents remain in SQLite, but their hashes are no longer registered on the new local blockchain.

Do not reset the database. Do not delete documents. Do not change document codes or hashes.

Use this flow:

```powershell
cd ../smart-contract
npx hardhat node
```

In another terminal:

```powershell
cd ../smart-contract
npx hardhat run .\scripts\deploy.js --network localhost
```

Copy the new deployed address into `backend/.env`:

```env
CONTRACT_ADDRESS=0x...
USE_BLOCKCHAIN_MOCK=false
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ABI_PATH=./src/config/DocumentRegistry.json
```

If needed, copy the latest ABI/artifact:

```powershell
Copy-Item ..\smart-contract\artifacts\contracts\DocumentRegistry.sol\DocumentRegistry.json .\src\config\DocumentRegistry.json -Force
```

Preview what will happen:

```powershell
cd ../backend
npm run blockchain:reregister:dry
```

Register all existing SQLite document hashes on the current blockchain:

```powershell
npm run blockchain:reregister
```

After this, old SQLite documents should be verifiable again on the currently running Hardhat blockchain.
