class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class AIProviderError extends AppError {
  constructor(statusCode, message) {
    super(message, statusCode);
  }
}

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  AIProviderError,
  errorHandler
};
