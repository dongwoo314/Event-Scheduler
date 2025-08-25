const errorHandler = (error, req, res, next) => {
  console.error('Error Stack:', error.stack);
  
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = null;

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  }
  
  // Sequelize unique constraint errors
  else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    errors = error.errors.map(err => ({
      field: err.path,
      message: `${err.path} must be unique`,
      value: err.value
    }));
  }
  
  // Sequelize foreign key constraint errors
  else if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }
  
  // Sequelize database connection errors
  else if (error.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database connection error';
  }
  
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Joi validation errors
  else if (error.isJoi) {
    statusCode = 400;
    message = 'Validation error';
    errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
  }
  
  // Custom application errors
  else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }
  
  // Multer file upload errors
  else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
  }
  
  else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }
  
  // Handle specific PostgreSQL errors
  else if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Invalid reference to related resource';
        break;
      case '23502': // not_null_violation
        statusCode = 400;
        message = 'Required field is missing';
        break;
      case '22001': // string_data_right_truncation
        statusCode = 400;
        message = 'Data too long for field';
        break;
      case '08006': // connection_failure
        statusCode = 503;
        message = 'Database connection failed';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
    }
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      message = 'Internal server error';
      errors = null;
    }
  }

  // Log errors for monitoring
  if (statusCode >= 500) {
    console.error('Server Error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }

  // Send error response
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  // Include request ID if available (for tracking)
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  // Include additional context in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

// Async error wrapper to catch async errors in route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};
