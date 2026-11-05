const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_USER = process.env.DB_USER || 'api_test';
process.env.DB_NAME = process.env.DB_NAME || 'student_record_db';

const app = require('../src/app');
const pool = require('../src/config/database');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  await pool.end();
});

test('unknown API routes return a consistent 404 response', async () => {
  const response = await fetch(`${baseUrl}/not-a-route`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    success: false,
    error: { message: 'API route not found.' }
  });
});

test('malformed JSON is rejected without exposing parser details', async () => {
  const response = await fetch(`${baseUrl}/api/students`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{'
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: { message: 'Request body must be valid JSON.' }
  });
});

test('invalid IDs, bodies, and list query values are rejected before database access', async () => {
  const cases = [
    { path: '/api/students/not-an-id', status: 400 },
    { path: '/api/courses/0', status: 400 },
    { path: '/api/enrollments/nope', status: 400 },
    { path: '/api/students?limit=101', status: 400 },
    { path: '/api/enrollments?status=pending', status: 400 }
  ];

  for (const { path, status } of cases) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, status, path);
    assert.equal((await response.json()).success, false, path);
  }

  const invalidStudent = await fetch(`${baseUrl}/api/students`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Rahul' })
  });
  assert.equal(invalidStudent.status, 400);
});
