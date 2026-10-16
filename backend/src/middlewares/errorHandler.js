const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server errorss" : err.message,
  });
};

module.exports = errorHandler;
