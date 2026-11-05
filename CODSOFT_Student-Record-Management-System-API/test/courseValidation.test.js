const assert = require('node:assert/strict');
const test = require('node:test');
const { validateCourse, validateCourseId } = require('../src/validation/courseValidation');

test('validateCourse trims fields and normalizes course codes', () => {
  assert.deepEqual(
    validateCourse({
      course_name: '  Database Systems ',
      course_code: ' cs-101 ',
      description: '  Relational database fundamentals '
    }),
    {
      course_name: 'Database Systems',
      course_code: 'CS-101',
      description: 'Relational database fundamentals'
    }
  );
});

test('validateCourse permits an omitted optional description', () => {
  assert.deepEqual(
    validateCourse({ course_name: 'Databases', course_code: 'DB101' }),
    { course_name: 'Databases', course_code: 'DB101', description: null }
  );
});

test('validateCourse rejects missing fields and overlong values', () => {
  assert.throws(
    () => validateCourse({ course_name: 'Databases' }),
    { status: 400, message: 'Course name and course code are required and must be strings.' }
  );
  assert.throws(
    () => validateCourse({ course_name: 'x'.repeat(151), course_code: 'DB101' }),
    { status: 400, message: 'Course name must contain between 1 and 150 characters.' }
  );
});

test('validateCourse rejects unsupported fields', () => {
  assert.throws(
    () => validateCourse({ course_name: 'Databases', course_code: 'DB101', id: 1 }),
    { status: 400, message: 'Unsupported field: id.' }
  );
});

test('validateCourseId accepts positive IDs and rejects invalid IDs', () => {
  assert.equal(validateCourseId('12'), 12);
  assert.throws(() => validateCourseId('0'), { status: 400 });
  assert.throws(() => validateCourseId('12x'), { status: 400 });
});
