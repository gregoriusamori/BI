const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message || err);

  const status = err.status || 500;
  const message = err.message || err.error || 'Internal Server Error';

  res.status(status).json({
    error: message,
  });
};

module.exports = errorHandler;
