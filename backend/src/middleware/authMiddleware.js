const jwt = require("jsonwebtoken");
const env = require("../config/env");
const prisma = require("../config/database");
const { createHttpError } = require("../utils/response");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw createHttpError(401, "Authentication token is required.");
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw createHttpError(401, "Authenticated user no longer exists.");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Invalid or expired authentication token.";
    }
    return next(error);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(createHttpError(403, "You do not have permission to access this resource."));
    }

    return next();
  };
}

module.exports = {
  authMiddleware,
  requireRole
};
