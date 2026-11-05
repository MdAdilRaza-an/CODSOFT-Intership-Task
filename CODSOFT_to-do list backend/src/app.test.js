const request = require('supertest');
const app = require('./app');

describe('Express application', () => {
  test('GET /health returns a successful response', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'To-Do List API is running'
    });
  });
});
