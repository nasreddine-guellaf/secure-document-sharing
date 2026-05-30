const multer = require("multer");
const { errorResponse } = require("../utils/response");

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFoundHandler(req, res) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file is too large. Maximum size is 10 MB."
        : error.message;
    return errorResponse(res, message, 400);
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  return errorResponse(res, message, statusCode);
}

module.exports = {
  asyncHandler,
  notFoundHandler,
  errorMiddleware
};
