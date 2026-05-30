# Secure Document Sharing Frontend

React + Vite frontend for the Secure Document Sharing System.

## Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env`.

The app expects the backend API at:

```env
VITE_API_URL=http://localhost:5000/api
```

## Pages

- Login
- Register
- Dashboard
- Upload Document
- My Documents
- Verify Document
- Shared Documents
- Verification History
- Admin Dashboard

## Demo flow

1. Log in as `user@secure-share.test / User123!`.
2. Upload a PDF, DOCX, or TXT file.
3. Copy the returned document code.
4. Share the document with `verifier@secure-share.test`.
5. Log in as the verifier.
6. Open Shared Documents, download the file, then verify it with the document code.
7. Log in as `admin@secure-share.test / Admin123!` to view users, documents, logs, and categories.
