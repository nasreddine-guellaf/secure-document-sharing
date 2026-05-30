const prisma = require("../config/database");
const { successResponse, createHttpError } = require("../utils/response");

async function getUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          documents: true,
          verifications: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return successResponse(res, "Users fetched successfully", users);
}

async function getDocuments(req, res) {
  const documents = await prisma.document.findMany({
    include: {
      owner: {
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

  return successResponse(res, "Documents fetched successfully", documents);
}

async function getVerifications(req, res) {
  const verifications = await prisma.verification.findMany({
    include: {
      document: {
        select: {
          id: true,
          documentCode: true,
          originalName: true
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

  return successResponse(res, "Verification logs fetched successfully", verifications);
}

async function getCategories(req, res) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return successResponse(res, "Categories fetched successfully", categories);
}

async function createCategory(req, res) {
  const { name, description } = req.body;

  if (!name) {
    throw createHttpError(400, "Category name is required.");
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null
    }
  });

  return successResponse(res, "Category created successfully", category, 201);
}

module.exports = {
  getUsers,
  getDocuments,
  getVerifications,
  getCategories,
  createCategory
};
