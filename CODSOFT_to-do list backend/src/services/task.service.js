const taskModel = require('../models/task.model');

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function requireOwnedTask(userId, taskId) {
  const task = await taskModel.findTaskById(userId, taskId);
  if (!task) {
    throw createError('Task not found or does not belong to the authenticated user', 404);
  }
  return task;
}

async function createTask(userId, task) {
  return taskModel.createTask(userId, task);
}

async function getTasks(userId, filters) {
  return taskModel.findTasks(userId, filters);
}

async function getTaskById(userId, taskId) {
  return requireOwnedTask(userId, taskId);
}

async function updateTask(userId, taskId, changes) {
  await requireOwnedTask(userId, taskId);
  return taskModel.updateTask(userId, taskId, changes);
}

async function changeTaskStatus(userId, taskId, status) {
  await requireOwnedTask(userId, taskId);
  return taskModel.updateTaskStatus(userId, taskId, status);
}

async function deleteTask(userId, taskId) {
  await requireOwnedTask(userId, taskId);
  const deleted = await taskModel.deleteTask(userId, taskId);
  if (!deleted) {
    throw createError('Task could not be deleted', 500);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  changeTaskStatus,
  deleteTask
};
