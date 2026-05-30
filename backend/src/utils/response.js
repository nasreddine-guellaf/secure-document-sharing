function successResponse(res, message, data = null, statusCode = 200, extra = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra
  });
}

function errorResponse(res, message, statusCode = 500, details = null) {
  const payload = {
    success: false,
    message
  };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  successResponse,
  errorResponse,
  createHttpError
};
