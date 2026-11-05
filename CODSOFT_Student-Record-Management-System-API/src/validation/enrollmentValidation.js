const HttpError = require('../errors/HttpError');

const allowedStatuses = new Set(['enrolled', 'completed', 'dropped']);
const allowedFields = new Set(['student_id', 'course_id', 'enrollment_date', 'status']);

function validateEnrollmentId(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, 'Enrollment ID must be a positive integer.');
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 4294967295) {
    throw new HttpError(400, 'Enrollment ID is outside the supported range.');
  }

  return id;
}

function validateReferenceId(value, field) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 4294967295) {
    throw new HttpError(400, `${field} must be a positive integer.`);
  }

  return value;
}

function validateDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, 'Enrollment date must use YYYY-MM-DD format.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const daysInMonth = month >= 1 && month <= 12
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : 0;

  if (year < 1000 || day < 1 || day > daysInMonth) {
    throw new HttpError(400, 'Enrollment date must be a valid calendar date.');
  }

  return value;
}

function validateEnrollment(body, { forUpdate = false } = {}) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  const unexpectedFields = Object.keys(body).filter((field) => !allowedFields.has(field));
  if (unexpectedFields.length > 0) {
    throw new HttpError(400, `Unsupported field: ${unexpectedFields[0]}.`);
  }

  if (body.student_id === undefined || body.course_id === undefined) {
    throw new HttpError(400, 'Student ID and course ID are required.');
  }

  const studentId = validateReferenceId(body.student_id, 'Student ID');
  const courseId = validateReferenceId(body.course_id, 'Course ID');

  let enrollmentDate;
  if (body.enrollment_date === undefined) {
    if (forUpdate) {
      throw new HttpError(400, 'Enrollment date is required when updating an enrollment.');
    }
    enrollmentDate = new Date().toISOString().slice(0, 10);
  } else {
    enrollmentDate = validateDate(body.enrollment_date);
  }

  let status = body.status;
  if (status === undefined && !forUpdate) {
    status = 'enrolled';
  }
  if (typeof status !== 'string' || !allowedStatuses.has(status)) {
    throw new HttpError(400, 'Status must be enrolled, completed, or dropped.');
  }

  return {
    student_id: studentId,
    course_id: courseId,
    enrollment_date: enrollmentDate,
    status
  };
}

module.exports = { validateEnrollment, validateEnrollmentId };
