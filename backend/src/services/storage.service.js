const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../config/env");
const { createHttpError } = require("../utils/response");

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

const allowedExtensions = new Set([".pdf", ".docx", ".txt"]);

function ensureUploadDirectory() {
  if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  }
}

function fileFilter(req, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
    return callback(createHttpError(400, "Only PDF, DOCX, and TXT files are allowed."));
  }

  return callback(null, true);
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    ensureUploadDirectory();
    callback(null, env.UPLOAD_DIR);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    callback(null, safeName);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

function deleteFileIfExists(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  upload,
  ensureUploadDirectory,
  deleteFileIfExists
};
