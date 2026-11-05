const assert = require('node:assert/strict');
const test = require('node:test');
const {
  validateEnrollment,
  validateEnrollmentId
} = require('../src/validation/enrollmentValidation');

test('validateEnrollment applies the selected date and status defaults', () => {
  const enrollment = validateEnrollment({ student_id: 1, course_id: 2 });

  assert.equal(enrollment.student_id, 1);
  assert.equal(enrollment.course_id, 2);
  assert.match(enrollment.enrollment_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(enrollment.status, 'enrolled');
});

test('validateEnrollment accepts a valid explicit date and status', () => {
  assert.deepEqual(
    validateEnrollment({
      student_id: 8,
      course_id: 4,
      enrollment_date: '2026-02-28',
      status: 'completed'
    }),
    {
      student_id: 8,
      course_id: 4,
      enrollment_date: '2026-02-28',
      status: 'completed'
    }
  );
});

test('validateEnrollment rejects missing references and invalid IDs', () => {
  assert.throws(
    () => validateEnrollment({ student_id: 1 }),
    { status: 400, message: 'Student ID and course ID are required.' }
  );
  assert.throws(
    () => validateEnrollment({ student_id: 0, course_id: 2 }),
    { status: 400, message: 'Student ID must be a positive integer.' }
  );
});

test('validateEnrollment rejects invalid dates and statuses', () => {
  assert.throws(
    () => validateEnrollment({
      student_id: 1,
      course_id: 2,
      enrollment_date: '2026-02-30'
    }),
    { status: 400, message: 'Enrollment date must be a valid calendar date.' }
  );
  assert.throws(
    () => validateEnrollment({ student_id: 1, course_id: 2, status: 'pending' }),
    { status: 400, message: 'Status must be enrolled, completed, or dropped.' }
  );
});

test('validateEnrollment requires full fields on update', () => {
  assert.throws(
    () => validateEnrollment(
      { student_id: 1, course_id: 2, status: 'enrolled' },
      { forUpdate: true }
    ),
    { status: 400, message: 'Enrollment date is required when updating an enrollment.' }
  );
});

test('validateEnrollmentId accepts positive IDs and rejects invalid IDs', () => {
  assert.equal(validateEnrollmentId('9'), 9);
  assert.throws(() => validateEnrollmentId('-1'), { status: 400 });
  assert.throws(() => validateEnrollmentId('nope'), { status: 400 });
});
