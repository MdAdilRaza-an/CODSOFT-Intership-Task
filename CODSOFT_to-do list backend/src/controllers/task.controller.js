const taskService = require('../services/task.service');

async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Task created successfully', data: { task } });
  } catch (error) {
    return next(error);
  }
}

async function getTasks(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await taskService.getTasks(req.user.id, {
      ...req.query,
      offset: (page - 1) * limit
    });

    return res.status(200).json({
      success: true,
      data: {
        tasks: result.tasks,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.user.id, Number(req.params.id));
    return res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.user.id, Number(req.params.id), req.body);
    return res.status(200).json({ success: true, message: 'Task updated successfully', data: { task } });
  } catch (error) {
    return next(error);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const task = await taskService.changeTaskStatus(req.user.id, Number(req.params.id), req.body.status);
    return res.status(200).json({ success: true, message: `Task marked as ${task.status}`, data: { task } });
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask(req.user.id, Number(req.params.id));
    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};
