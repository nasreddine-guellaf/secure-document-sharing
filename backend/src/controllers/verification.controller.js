const prisma = require("../config/database");
const { calculateSHA256 } = require("../services/hash.service");
const {
  documentExists,
  verifyDocumentHash,
  getDocumentHash
} = require("../services/blockchain.service");
const { successResponse, createHttpError } = require("../utils/response");

async function saveVerification({
  document,
  documentCode,
  file,
  calculatedHash,
  blockchainHash,
  result,
  message,
  userId
}) {
  return prisma.verification.create({
    data: {
      documentId: document?.id || null,
      documentCode,
      uploadedFileName: file.originalname,
      calculatedHash,
      blockchainHash,
      result,
      message,
      verifiedById: userId
    }
  });
}

async function verifyDocument(req, res) {
  const { documentCode } = req.body;

  if (!req.file) {
    throw createHttpError(400, "A document file is required for verification.");
  }

  if (!documentCode) {
    throw createHttpError(400, "Document code is required.");
  }

  const normalizedCode = documentCode.trim();
  const calculatedHash = await calculateSHA256(req.file.path);

  const document = await prisma.document.findUnique({
    where: { documentCode: normalizedCode }
  });

  if (!document || document.status !== "ACTIVE") {
    const message = "Document is not registered in the system.";
    await saveVerification({
      document: null,
      documentCode: normalizedCode,
      file: req.file,
      calculatedHash,
      blockchainHash: null,
      result: "UNKNOWN",
      message,
      userId: req.user.id
    });

    return res.json({
      success: true,
      result: "UNKNOWN",
      message
    });
  }

  try {
    const existsOnChain = await documentExists(document.documentCode);

    if (!existsOnChain) {
      const message =
        "Document exists in the database, but it is not registered on the current blockchain.";

      await saveVerification({
        document,
        documentCode: normalizedCode,
        file: req.file,
        calculatedHash,
        blockchainHash: null,
        result: "UNKNOWN",
        message,
        userId: req.user.id
      });

      return res.json({
        success: true,
        result: "UNKNOWN",
        message,
        data: {
          documentCode: normalizedCode,
          calculatedHash,
          blockchainHash: null
        }
      });
    }

    const [blockchainMatches, blockchainHash] = await Promise.all([
      verifyDocumentHash(document.documentCode, calculatedHash),
      getDocumentHash(document.documentCode)
    ]);

    const authentic = blockchainMatches && calculatedHash === document.sha256Hash;
    const result = authentic ? "AUTHENTIC" : "MODIFIED";
    const message = authentic
      ? "Document is authentic and has not been modified."
      : "Document has been modified or falsified.";

    await saveVerification({
      document,
      documentCode: normalizedCode,
      file: req.file,
      calculatedHash,
      blockchainHash,
      result,
      message,
      userId: req.user.id
    });

    return res.json({
      success: true,
      result,
      message,
      data: {
        documentCode: normalizedCode,
        calculatedHash,
        blockchainHash
      }
    });
  } catch (error) {
    const message = "Document verification failed because the blockchain service returned an error.";

    await saveVerification({
      document,
      documentCode: normalizedCode,
      file: req.file,
      calculatedHash,
      blockchainHash: null,
      result: "ERROR",
      message,
      userId: req.user.id
    });

    return res.status(502).json({
      success: false,
      result: "ERROR",
      message,
      details: error.message
    });
  }
}

async function getVerificationHistory(req, res) {
  const where =
    req.user.role === "ADMIN"
      ? {}
      : {
          OR: [
            { verifiedById: req.user.id },
            {
              document: {
                ownerId: req.user.id
              }
            }
          ]
        };

  const verifications = await prisma.verification.findMany({
    where,
    include: {
      document: {
        select: {
          id: true,
          documentCode: true,
          originalName: true,
          ownerId: true
        }
      },
      verifiedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return successResponse(res, "Verification history fetched successfully", verifications);
}

module.exports = {
  verifyDocument,
  getVerificationHistory
};
