const HttpError = require('../errors/HttpError');

function errorHandler(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let status = 500;
  let message = 'An unexpected server error occurred.';

  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must be valid JSON.';
  } else if (error.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'A record with the same unique value already exists.';
  } else if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    status = 409;
    message = 'This record is still referenced by another record.';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 404;
    message = 'A referenced student or course was not found.';
  } else {
    console.error(error);
  }

  res.status(status).json({ success: false, error: { message } });
}

module.exports = errorHandler;
