jest.mock('../middleware/auth.middleware', () => (req, res, next) => {
  req.user = { id: 7, name: 'Query Test User', email: 'query@example.com' };
  next();
});

jest.mock('../services/task.service');

const request = require('supertest');
const app = require('../app');
const taskService = require('../services/task.service');

describe('Task search and filtering', () => {
  beforeEach(() => jest.clearAllMocks());

  test('passes search, status, priority, category, sorting, and pagination to the service', async () => {
    taskService.getTasks.mockResolvedValue({ tasks: [], total: 25 });

    const response = await request(app).get(
      '/api/tasks?search=meeting&status=pending&priority=high&category=work&page=2&limit=5&sortBy=due_date&order=ASC'
    );

    expect(response.status).toBe(200);
    expect(taskService.getTasks).toHaveBeenCalledWith(7, expect.objectContaining({
      search: 'meeting',
      status: 'pending',
      priority: 'high',
      category: 'work',
      page: '2',
      limit: '5',
      sortBy: 'due_date',
      order: 'ASC',
      offset: 5
    }));
    expect(response.body.data.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 25,
      totalPages: 5
    });
  });

  test('passes due-date filters to the service', async () => {
    taskService.getTasks.mockResolvedValue({ tasks: [], total: 0 });

    const response = await request(app).get(
      '/api/tasks?due_after=2026-11-01T00:00:00.000Z&due_before=2026-12-01T00:00:00.000Z'
    );

    expect(response.status).toBe(200);
    expect(taskService.getTasks).toHaveBeenCalledWith(7, expect.objectContaining({
      due_after: '2026-11-01T00:00:00.000Z',
      due_before: '2026-12-01T00:00:00.000Z'
    }));
  });
});
