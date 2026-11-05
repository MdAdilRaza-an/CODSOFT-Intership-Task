jest.mock('../middleware/auth.middleware', () => (req, res, next) => {
  req.user = { id: 7, name: 'Bonus Test User', email: 'bonus@example.com' };
  next();
});

jest.mock('../services/task.service');

const request = require('supertest');
const app = require('../app');
const taskService = require('../services/task.service');

describe('Due date, priority, and category functionality', () => {
  beforeEach(() => jest.clearAllMocks());

  test('accepts valid bonus fields and creates the task', async () => {
    taskService.createTask.mockResolvedValue({
      id: 12,
      title: 'Project deadline',
      due_date: '2026-12-01T10:00:00.000Z',
      priority: 'high',
      category: 'work'
    });

    const response = await request(app).post('/api/tasks').send({
      title: 'Project deadline',
      due_date: '2026-12-01T10:00:00.000Z',
      priority: 'high',
      category: 'work'
    });

    expect(response.status).toBe(201);
    expect(response.body.data.task.priority).toBe('high');
  });

  test('rejects an unsupported priority', async () => {
    const response = await request(app).post('/api/tasks').send({
      title: 'Invalid priority task',
      priority: 'critical'
    });

    expect(response.status).toBe(422);
  });

  test('accepts clearing a due date and category during update', async () => {
    taskService.updateTask.mockResolvedValue({ id: 12, due_date: null, category: null });

    const response = await request(app).patch('/api/tasks/12').send({
      due_date: null,
      category: null
    });

    expect(response.status).toBe(200);
    expect(taskService.updateTask).toHaveBeenCalledWith(7, 12, {
      due_date: null,
      category: null
    });
  });
});
