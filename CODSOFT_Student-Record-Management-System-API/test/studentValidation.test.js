const assert = require('node:assert/strict');
const test = require('node:test');
const { validateStudent, validateStudentId } = require('../src/validation/studentValidation');

test('validateStudent trims values and normalizes email', () => {
  assert.deepEqual(
    validateStudent({
      name: '  Rahul Kumar ',
      email: ' RAHUL@example.com ',
      phone: ' 555-0100 '
    }),
    {
      name: 'Rahul Kumar',
      email: 'rahul@example.com',
      phone: '555-0100'
    }
  );
});

test('validateStudent permits an omitted optional phone number', () => {
  assert.deepEqual(
    validateStudent({ name: 'Rahul', email: 'rahul@example.com' }),
    { name: 'Rahul', email: 'rahul@example.com', phone: null }
  );
});

test('validateStudent rejects missing fields and invalid email addresses', () => {
  assert.throws(
    () => validateStudent({ name: 'Rahul' }),
    { status: 400, message: 'Name and email are required and must be strings.' }
  );
  assert.throws(
    () => validateStudent({ name: 'Rahul', email: 'not-an-email' }),
    { status: 400, message: 'Email must be a valid email address.' }
  );
});

test('validateStudent rejects unsupported fields', () => {
  assert.throws(
    () => validateStudent({ name: 'Rahul', email: 'rahul@example.com', role: 'admin' }),
    { status: 400, message: 'Unsupported field: role.' }
  );
});

test('validateStudentId accepts positive IDs and rejects invalid IDs', () => {
  assert.equal(validateStudentId('42'), 42);
  assert.throws(() => validateStudentId('0'), { status: 400 });
  assert.throws(() => validateStudentId('abc'), { status: 400 });
});
