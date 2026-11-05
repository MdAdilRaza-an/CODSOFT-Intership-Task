const request = require('supertest');
const app = require('../app');

jest.mock('../middleware/auth.middleware', () => (req, res, next) => {
  req.user = { id: 7, name: 'Validator Test', email: 'validator@example.com' };
  next();
});

describe('Task request validation', () => {
  test('rejects an invalid task ID', async () => {
    const response = await request(app).get('/api/tasks/not-a-number');
    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  test('rejects invalid task status', async () => {
    const response = await request(app)
      .patch('/api/tasks/1/status')
      .send({ status: 'unknown' });
    expect(response.status).toBe(422);
  });

  test('rejects invalid pagination values', async () => {
    const response = await request(app).get('/api/tasks?page=0&limit=500');
    expect(response.status).toBe(422);
  });
});
