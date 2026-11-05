const HttpError = require('../errors/HttpError');

const allowedFields = new Set(['course_name', 'course_code', 'description']);

function validateCourseId(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, 'Course ID must be a positive integer.');
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 4294967295) {
    throw new HttpError(400, 'Course ID is outside the supported range.');
  }

  return id;
}

function validateCourse(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  const unexpectedFields = Object.keys(body).filter((field) => !allowedFields.has(field));
  if (unexpectedFields.length > 0) {
    throw new HttpError(400, `Unsupported field: ${unexpectedFields[0]}.`);
  }

  if (typeof body.course_name !== 'string' || typeof body.course_code !== 'string') {
    throw new HttpError(400, 'Course name and course code are required and must be strings.');
  }

  const courseName = body.course_name.trim();
  const courseCode = body.course_code.trim().toUpperCase();

  if (!courseName || courseName.length > 150) {
    throw new HttpError(400, 'Course name must contain between 1 and 150 characters.');
  }

  if (!courseCode || courseCode.length > 30) {
    throw new HttpError(400, 'Course code must contain between 1 and 30 characters.');
  }

  let description = null;
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      throw new HttpError(400, 'Description must be a string or null.');
    }

    description = body.description.trim() || null;
    if (description && description.length > 65535) {
      throw new HttpError(400, 'Description is too long.');
    }
  }

  return { course_name: courseName, course_code: courseCode, description };
}

module.exports = { validateCourse, validateCourseId };
