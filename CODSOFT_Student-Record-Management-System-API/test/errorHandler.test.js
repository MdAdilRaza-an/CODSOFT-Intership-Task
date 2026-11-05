const assert = require('node:assert/strict');
const test = require('node:test');
const errorHandler = require('../src/middleware/errorHandler');

function handleError(error) {
  const response = {
    headersSent: false,
    status(status) {
      this.statusCode = status;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };

  errorHandler(error, {}, response, () => {
    throw new Error('Unexpected error forwarding.');
  });
  return response;
}

test('duplicate and foreign-key conflicts have safe client messages', () => {
  const duplicate = handleError({ code: 'ER_DUP_ENTRY', sqlMessage: 'private SQL detail' });
  assert.equal(duplicate.statusCode, 409);
  assert.deepEqual(duplicate.body, {
    success: false,
    error: { message: 'A record with the same unique value already exists.' }
  });

  const foreignKey = handleError({ code: 'ER_NO_REFERENCED_ROW_2', sqlMessage: 'private SQL detail' });
  assert.equal(foreignKey.statusCode, 404);
  assert.deepEqual(foreignKey.body, {
    success: false,
    error: { message: 'A referenced student or course was not found.' }
  });
});

test('unexpected errors do not expose internal details to clients', () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const response = handleError(new Error('private database connection detail'));
    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, {
      success: false,
      error: { message: 'An unexpected server error occurred.' }
    });
  } finally {
    console.error = originalConsoleError;
  }
});
