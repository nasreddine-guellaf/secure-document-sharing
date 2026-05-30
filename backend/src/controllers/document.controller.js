const prisma = require("../config/database");
const { calculateSHA256 } = require("../services/hash.service");
const { classifyDocument } = require("../services/ai.service");
const {
  registerDocumentHash,
  revokeDocument
} = require("../services/blockchain.service");
const {
  generateDocumentCode,
  canAccessDocument,
  toDocumentResponse
} = require("../services/document.service");
const { successResponse, createHttpError } = require("../utils/response");

async function uploadDocument(req, res) {
  if (!req.file) {
    throw createHttpError(400, "A document file is required.");
  }

  const documentCode = await generateDocumentCode();
  const sha256Hash = await calculateSHA256(req.file.path);

  // Integration point: the backend sends the off-chain file to the external AI classifier.
  const aiResult = await classifyDocument(req.file.path);
  console.log("[AI] Final classification used for document:", aiResult);

  let blockchainStatus = "FAILED";
  let blockchainTxHash = null;

  try {
    // Integration point: only the SHA-256 hash is registered in the smart contract.
    const blockchainResult = await registerDocumentHash(documentCode, sha256Hash);
    blockchainStatus = blockchainResult.status || "REGISTERED";
    blockchainTxHash = blockchainResult.txHash || null;
  } catch (error) {
    console.error("Blockchain registration failed:", error.message);
  }

  const document = await prisma.document.create({
    data: {
      documentCode,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storagePath: req.file.path,
      sha256Hash,
      category: aiResult.category,
      confidence: aiResult.confidence,
      aiModel: aiResult.model,
      language: aiResult.language,
      extractedTextLength: aiResult.extracted_text_length,
      blockchainTxHash,
      blockchainStatus,
      ownerId: req.user.id
    }
  });

  return successResponse(
    res,
    "Document uploaded and secured successfully",
    {
      documentId: document.id,
      documentCode: document.documentCode,
      originalName: document.originalName,
      sha256Hash: document.sha256Hash,
      category: document.category,
      confidence: document.confidence,
      blockchainStatus: document.blockchainStatus,
      blockchainTxHash: document.blockchainTxHash
    },
    201
  );
}

async function getMyDocuments(req, res) {
  const documents = await prisma.document.findMany({
    where: {
      ownerId: req.user.id
    },
    orderBy: { createdAt: "desc" }
  });

  return successResponse(
    res,
    "Documents fetched successfully",
    documents.map(toDocumentResponse)
  );
}

async function getDocumentById(req, res) {
  const { id } = req.params;

  if (!(await canAccessDocument(req.user, id))) {
    throw createHttpError(404, "Document not found or not accessible.");
  }

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!document) {
    throw createHttpError(404, "Document not found.");
  }

  return successResponse(res, "Document fetched successfully", toDocumentResponse(document));
}

async function downloadDocument(req, res) {
  const { id } = req.params;

  if (!(await canAccessDocument(req.user, id))) {
    throw createHttpError(404, "Document not found or not accessible.");
  }

  const document = await prisma.document.findUnique({
    where: { id }
  });

  if (!document) {
    throw createHttpError(404, "Document not found.");
  }

  return res.download(document.storagePath, document.originalName);
}

async function deleteDocument(req, res) {
  const { id } = req.params;
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) {
    throw createHttpError(404, "Document not found.");
  }

  if (document.ownerId !== req.user.id && req.user.role !== "ADMIN") {
    throw createHttpError(403, "Only the owner or an admin can revoke this document.");
  }

  let blockchainTxHash = document.blockchainTxHash;

  try {
    const blockchainResult = await revokeDocument(document.documentCode);
    blockchainTxHash = blockchainResult.txHash || blockchainTxHash;
  } catch (error) {
    console.error("Blockchain revoke failed:", error.message);
  }

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: {
      status: "REVOKED",
      blockchainStatus: "REVOKED",
      blockchainTxHash
    }
  });

  await prisma.share.updateMany({
    where: { documentId: id },
    data: { active: false }
  });

  return successResponse(res, "Document revoked successfully", toDocumentResponse(updatedDocument));
}

module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument
};
