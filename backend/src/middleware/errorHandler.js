export default function errorHandler(err, req, res, next) {
  console.error(err);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate key error: A record with that value already exists.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token.';
  } else if (err.message) {
    statusCode = err.statusCode || 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}
