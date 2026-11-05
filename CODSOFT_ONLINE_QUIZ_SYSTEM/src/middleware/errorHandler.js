module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  const body = { error: status === 500 ? 'Internal server error' : error.message };
  if (process.env.NODE_ENV !== 'production' && status !== 500) body.details = error.details;
  res.status(status).json(body);
};
