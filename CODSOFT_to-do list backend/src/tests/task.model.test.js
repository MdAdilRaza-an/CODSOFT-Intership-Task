describe('Task model module', () => {
  test('exports task database operations', () => {
    const taskModel = require('../models/task.model');

    expect(taskModel).toEqual(expect.objectContaining({
      createTask: expect.any(Function),
      findTaskById: expect.any(Function),
      findTasks: expect.any(Function),
      updateTask: expect.any(Function),
      updateTaskStatus: expect.any(Function),
      deleteTask: expect.any(Function)
    }));
  });
});
