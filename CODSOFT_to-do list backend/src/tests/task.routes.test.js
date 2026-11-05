jest.mock('../middleware/auth.middleware', () => (req, res, next) => {
  req.user = { id: 7, name: 'Route Test User', email: 'routes@example.com' };
  next();
});

jest.mock('../services/task.service');

const request = require('supertest');
const app = require('../app');
const taskService = require('../services/task.service');

describe('Task API routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST /api/tasks creates a task', async () => {
    taskService.createTask.mockResolvedValue({ id: 1, user_id: 7, title: 'Test task', status: 'pending' });

    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test task' });

    expect(response.status).toBe(201);
    expect(response.body.data.task.title).toBe('Test task');
    expect(taskService.createTask).toHaveBeenCalledWith(7, { title: 'Test task' });
  });

  test('GET /api/tasks returns paginated tasks', async () => {
    taskService.getTasks.mockResolvedValue({ tasks: [], total: 0 });

    const response = await request(app)
      .get('/api/tasks?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  test('DELETE /api/tasks/:id deletes the owned task', async () => {
    taskService.deleteTask.mockResolvedValue(undefined);

    const response = await request(app).delete('/api/tasks/42');

    expect(response.status).toBe(200);
    expect(taskService.deleteTask).toHaveBeenCalledWith(7, 42);
  });
});
