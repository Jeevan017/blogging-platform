import multer from 'multer';

const isProduction = process.env.NODE_ENV === 'production';

export const notFound = (req, res, next) => {
  const error = new Error('Route not found');
  res.status(404);
  next(error);
};

export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid Database ID format';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = isProduction
      ? 'A duplicate value was submitted. Please use a different value.'
      : `Duplicate field value entered: ${field}. Please use another value.`;
  }

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 5MB.';
    } else {
      message = isProduction ? 'Image upload failed.' : `Upload error: ${err.message}`;
    }
  }

  if (
    err.message &&
    (err.message.includes('Invalid file type') ||
      err.message.includes('file size') ||
      err.message.includes('file extension'))
  ) {
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 403;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 403;
    message = 'Token expired';
  }

  if (err.message?.includes('not allowed by CORS')) {
    statusCode = 403;
    message = isProduction ? 'Request blocked.' : err.message;
  }

  if (statusCode === 500 && isProduction) {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    message,
    stack: isProduction ? null : err.stack,
  });
};
