jest.mock('../services/auth.service');

const request = require('supertest');
const app = require('../app');
const authService = require('../services/auth.service');

describe('Authentication API routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST /api/auth/register accepts valid input and returns 201', async () => {
    const user = { id: 1, name: 'Test User', email: 'test@example.com' };
    authService.register.mockResolvedValue({ user, token: 'test-token' });

    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!'
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.token).toBe('test-token');
  });

  test('POST /api/auth/register rejects invalid input', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A', email: 'invalid', password: 'short'
    });
    expect(response.status).toBe(422);
  });

  test('POST /api/auth/login returns a token for valid credentials', async () => {
    authService.login.mockResolvedValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      token: 'test-token'
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!'
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBe('test-token');
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    const error = new Error('Invalid email or password');
    error.status = 401;
    authService.login.mockRejectedValue(error);

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'WrongPassword!'
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
