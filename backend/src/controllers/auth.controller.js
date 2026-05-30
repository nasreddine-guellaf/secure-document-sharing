const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const env = require("../config/env");
const { successResponse, createHttpError } = require("../utils/response");

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true
};

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function register(req, res) {
  const { name, email, password, role = "USER" } = req.body;

  if (!name || !email || !password) {
    throw createHttpError(400, "Name, email, and password are required.");
  }

  if (!["USER", "VERIFIER"].includes(role)) {
    throw createHttpError(400, "Role must be USER or VERIFIER.");
  }

  if (password.length < 6) {
    throw createHttpError(400, "Password must contain at least 6 characters.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw createHttpError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role
    },
    select: publicUserSelect
  });

  return successResponse(
    res,
    "Account created successfully",
    {
      user,
      token: signToken(user)
    },
    201
  );
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createHttpError(400, "Email and password are required.");
  }

  const userWithPassword = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!userWithPassword) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!passwordMatches) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const user = {
    id: userWithPassword.id,
    name: userWithPassword.name,
    email: userWithPassword.email,
    role: userWithPassword.role,
    createdAt: userWithPassword.createdAt
  };

  return successResponse(res, "Logged in successfully", {
    user,
    token: signToken(user)
  });
}

async function me(req, res) {
  return successResponse(res, "Authenticated user", {
    user: req.user
  });
}

module.exports = {
  register,
  login,
  me
};
