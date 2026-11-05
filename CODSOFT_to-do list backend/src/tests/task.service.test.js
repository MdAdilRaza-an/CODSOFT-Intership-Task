jest.mock('../models/task.model');

const taskModel = require('../models/task.model');
const taskService = require('../services/task.service');

describe('Task service business logic', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects access to a task outside user ownership', async () => {
    taskModel.findTaskById.mockResolvedValue(null);

    await expect(taskService.getTaskById(7, 42)).rejects.toMatchObject({
      status: 404
    });
  });

  test('returns tasks owned by the authenticated user', async () => {
    const ownedTask = { id: 42, user_id: 7, title: 'Owned task' };
    taskModel.findTaskById.mockResolvedValue(ownedTask);

    await expect(taskService.getTaskById(7, 42)).resolves.toEqual(ownedTask);
  });

  test('delegates task creation to the model', async () => {
    const created = { id: 10, title: 'New task' };
    taskModel.createTask.mockResolvedValue(created);

    await expect(taskService.createTask(7, { title: 'New task' })).resolves.toEqual(created);
    expect(taskModel.createTask).toHaveBeenCalledWith(7, { title: 'New task' });
  });
});
