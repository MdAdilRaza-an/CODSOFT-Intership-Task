function notFound(req, res) {
  return res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(error, req, res, next) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body must be valid JSON' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }

  const status = Number(error.status) >= 400 && Number(error.status) <= 599
    ? Number(error.status)
    : 500;

  if (status === 500 && process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  return res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : error.message,
    ...(error.code ? { code: error.code } : {})
  });
}

module.exports = { notFound, errorHandler };
