const HttpError = require('../errors/HttpError');

const allowedFields = new Set(['name', 'email', 'phone']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudentId(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, 'Student ID must be a positive integer.');
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 4294967295) {
    throw new HttpError(400, 'Student ID is outside the supported range.');
  }

  return id;
}

function validateStudent(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  const unexpectedFields = Object.keys(body).filter((field) => !allowedFields.has(field));
  if (unexpectedFields.length > 0) {
    throw new HttpError(400, `Unsupported field: ${unexpectedFields[0]}.`);
  }

  if (typeof body.name !== 'string' || typeof body.email !== 'string') {
    throw new HttpError(400, 'Name and email are required and must be strings.');
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();

  if (!name || name.length > 100) {
    throw new HttpError(400, 'Name must contain between 1 and 100 characters.');
  }

  if (email.length > 254 || !emailPattern.test(email)) {
    throw new HttpError(400, 'Email must be a valid email address.');
  }

  let phone = null;
  if (body.phone !== undefined && body.phone !== null) {
    if (typeof body.phone !== 'string') {
      throw new HttpError(400, 'Phone must be a string or null.');
    }

    phone = body.phone.trim() || null;
    if (phone && phone.length > 20) {
      throw new HttpError(400, 'Phone must not exceed 20 characters.');
    }
  }

  return { name, email, phone };
}

module.exports = { validateStudent, validateStudentId };
