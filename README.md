# Secure Document Sharing System

Student blockchain security project for secure document upload, off-chain storage, AI-based classification, blockchain hash registration, document sharing, and integrity verification.

## Responsibilities covered in this project

This repository contains the main application:

- Backend API
- Frontend UI
- SQLite database with Prisma
- AI service integration layer
- Smart contract integration layer
- Upload, share, verify, history, and admin dashboard flows

It does not implement the AI model or the Solidity smart contract. Those are external services/modules connected through clean service files.

## Tech stack

Backend:

- Node.js
- Express.js
- Multer
- SQLite
- Prisma ORM
- JWT
- bcrypt
- ethers.js
- axios + form-data

Frontend:

- React.js with Vite
- Axios
- React Router
- Simple CSS

## Project structure

```text
secure-document-sharing/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   └── uploads/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── smart-contract/
│   └── README.md
├── ai-service/
│   └── README.md
├── scripts/
│   ├── start-dev.ps1
│   └── stop-dev.ps1
└── README.md
```

## Backend setup

```bash
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

On macOS/Linux, use `cp .env.example .env`.

Backend URL:

```text
http://localhost:5000
```

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Start and Stop Commands

From the `secure-document-sharing` project root, start the full development environment with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1
```

This script automatically starts:

- the local Hardhat blockchain node;
- the `DocumentRegistry` smart contract deployment;
- the `backend/.env` update with the deployed contract address;
- the ABI copy into the backend;
- the backend API;
- the frontend app;
- the AI classification service;
- Prisma Studio if you answer yes when prompted.

To stop the development environment:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-dev.ps1
```

The stop script stops services listening on the usual local development ports:

- `5000` for the backend;
- `5173` for the frontend;
- `8001` for the AI service;
- `8545` for Hardhat;
- `5555` for Prisma Studio.

## Seeded demo accounts

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@secure-share.test | Admin123! |
| USER | user@secure-share.test | User123! |
| VERIFIER | verifier@secure-share.test | Verifier123! |

## AI service integration

The backend expects the AI service at:

```env
AI_SERVICE_URL=http://localhost:8001
```

Endpoint:

```http
POST /classify
Content-Type: multipart/form-data
```

Input field:

```text
file
```

If the AI service is unavailable, the backend stores:

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

The backend uses mock blockchain mode by default:

```env
USE_BLOCKCHAIN_MOCK=true
```

When the smart contract is ready:

```env
USE_BLOCKCHAIN_MOCK=false
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=...
CONTRACT_ABI_PATH=./src/config/DocumentRegistry.json
```

The backend registers only the hash on-chain. Documents stay off-chain in `backend/src/uploads`.

## Main API routes

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

## Upload response example

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
    "blockchainTxHash": "0xabc..."
  }
}
```

## Verification response examples

Authentic:

```json
{
  "success": true,
  "result": "AUTHENTIC",
  "message": "Document is authentic and has not been modified."
}
```

Modified:

```json
{
  "success": true,
  "result": "MODIFIED",
  "message": "Document has been modified or falsified."
}
```

Unknown:

```json
{
  "success": true,
  "result": "UNKNOWN",
  "message": "Document is not registered in the system."
}
```
