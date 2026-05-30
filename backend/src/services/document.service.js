const prisma = require("../config/database");

async function generateDocumentCode() {
  const year = new Date().getFullYear();
  let sequence = (await prisma.document.count()) + 1;
  let documentCode = `DOC-${year}-${String(sequence).padStart(4, "0")}`;

  while (await prisma.document.findUnique({ where: { documentCode } })) {
    sequence += 1;
    documentCode = `DOC-${year}-${String(sequence).padStart(4, "0")}`;
  }

  return documentCode;
}

async function canAccessDocument(user, documentId) {
  if (user.role === "ADMIN") {
    return true;
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true }
  });

  if (!document) {
    return false;
  }

  if (document.ownerId === user.id) {
    return true;
  }

  const activeShare = await prisma.share.findFirst({
    where: {
      documentId,
      active: true,
      OR: [{ receiverId: user.id }, { receiverEmail: user.email }]
    }
  });

  return Boolean(activeShare);
}

function toDocumentResponse(document) {
  return {
    id: document.id,
    documentCode: document.documentCode,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    sha256Hash: document.sha256Hash,
    category: document.category,
    confidence: document.confidence,
    aiModel: document.aiModel,
    language: document.language,
    extractedTextLength: document.extractedTextLength,
    blockchainTxHash: document.blockchainTxHash,
    blockchainStatus: document.blockchainStatus,
    ownerId: document.ownerId,
    owner: document.owner,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    status: document.status
  };
}

module.exports = {
  generateDocumentCode,
  canAccessDocument,
  toDocumentResponse
};
