const prisma = require("../config/database");
const { successResponse, createHttpError } = require("../utils/response");

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

async function createShare(req, res) {
  const { documentId, receiverEmail } = req.body;
  const normalizedReceiverEmail = normalizeEmail(receiverEmail);

  if (!documentId || !normalizedReceiverEmail) {
    throw createHttpError(400, "Document id and receiver email are required.");
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document || document.status !== "ACTIVE") {
    throw createHttpError(404, "Active document not found.");
  }

  if (document.ownerId !== req.user.id && req.user.role !== "ADMIN") {
    throw createHttpError(403, "Only the document owner can share this document.");
  }

  const receiver = await prisma.user.findUnique({
    where: { email: normalizedReceiverEmail },
    select: { id: true, email: true }
  });

  const existingShare = await prisma.share.findFirst({
    where: {
      documentId,
      receiverEmail: normalizedReceiverEmail,
      active: true
    }
  });

  if (existingShare) {
    throw createHttpError(409, "This document is already shared with that email.");
  }

  const share = await prisma.share.create({
    data: {
      documentId,
      ownerId: document.ownerId,
      receiverEmail: normalizedReceiverEmail,
      receiverId: receiver?.id || null
    },
    include: {
      document: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return successResponse(res, "Document shared successfully", share, 201);
}

async function getReceivedShares(req, res) {
  const shares = await prisma.share.findMany({
    where: {
      active: true,
      OR: [{ receiverId: req.user.id }, { receiverEmail: req.user.email }]
    },
    include: {
      document: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return successResponse(res, "Received shares fetched successfully", shares);
}

async function getSentShares(req, res) {
  const shares = await prisma.share.findMany({
    where: {
      ownerId: req.user.id
    },
    include: {
      document: true,
      receiver: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return successResponse(res, "Sent shares fetched successfully", shares);
}

async function deleteShare(req, res) {
  const { id } = req.params;
  const share = await prisma.share.findUnique({
    where: { id }
  });

  if (!share) {
    throw createHttpError(404, "Share not found.");
  }

  if (share.ownerId !== req.user.id && req.user.role !== "ADMIN") {
    throw createHttpError(403, "Only the share owner or an admin can remove this share.");
  }

  const updatedShare = await prisma.share.update({
    where: { id },
    data: { active: false }
  });

  return successResponse(res, "Share removed successfully", updatedShare);
}

module.exports = {
  createShare,
  getReceivedShares,
  getSentShares,
  deleteShare
};
