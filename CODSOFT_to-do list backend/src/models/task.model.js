const pool = require('../config/database');

function toMySqlDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function createTask(userId, task) {
  const [result] = await pool.execute(
    `INSERT INTO tasks (user_id, title, description, due_date, priority, category, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [
      userId,
      task.title,
      task.description || null,
      toMySqlDateTime(task.due_date),
      task.priority || 'medium',
      task.category || null
    ]
  );

  return findTaskById(userId, result.insertId);
}

async function findTaskById(userId, taskId) {
  const [rows] = await pool.execute(
    `SELECT id, user_id, title, description, status, due_date, priority, category,
            completed_at, created_at, updated_at
     FROM tasks WHERE id = ? AND user_id = ? LIMIT 1`,
    [taskId, userId]
  );
  return rows[0] || null;
}

async function findTasks(userId, filters = {}) {
  const clauses = ['user_id = ?'];
  const values = [userId];

  if (filters.status) {
    clauses.push('status = ?');
    values.push(filters.status);
  }
  if (filters.priority) {
    clauses.push('priority = ?');
    values.push(filters.priority);
  }
  if (filters.category) {
    clauses.push('category = ?');
    values.push(filters.category);
  }
  if (filters.search) {
    clauses.push('(title LIKE ? OR description LIKE ?)');
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.due_before) {
    clauses.push('due_date <= ?');
    values.push(toMySqlDateTime(filters.due_before));
  }
  if (filters.due_after) {
    clauses.push('due_date >= ?');
    values.push(toMySqlDateTime(filters.due_after));
  }

  const whereClause = clauses.join(' AND ');
  const sortableColumns = {
    created_at: 'created_at',
    updated_at: 'updated_at',
    due_date: 'due_date',
    title: 'title',
    priority: 'priority'
  };
  const sortColumn = sortableColumns[filters.sortBy] || 'created_at';
  const sortOrder = String(filters.order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const limit = Number(filters.limit) || 10;
  const offset = Number(filters.offset) || 0;

  const [tasks] = await pool.execute(
    `SELECT id, user_id, title, description, status, due_date, priority, category,
            completed_at, created_at, updated_at
     FROM tasks WHERE ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}, id DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM tasks WHERE ${whereClause}`,
    values
  );

  return { tasks, total: Number(countRows[0].total) };
}

async function updateTask(userId, taskId, task) {
  const allowedFields = {
    title: task.title,
    description: task.description,
    due_date: task.due_date,
    priority: task.priority,
    category: task.category
  };
  const assignments = [];
  const values = [];

  for (const [column, value] of Object.entries(allowedFields)) {
    if (value !== undefined) {
      assignments.push(`${column} = ?`);
      values.push(column === 'due_date' ? toMySqlDateTime(value) : (value === '' ? null : value));
    }
  }

  if (assignments.length === 0) {
    return findTaskById(userId, taskId);
  }

  values.push(taskId, userId);
  await pool.execute(
    `UPDATE tasks SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    values
  );

  return findTaskById(userId, taskId);
}

async function updateTaskStatus(userId, taskId, status) {
  await pool.execute(
    `UPDATE tasks
     SET status = ?,
         completed_at = CASE
           WHEN ? = 'completed' THEN COALESCE(completed_at, UTC_TIMESTAMP())
           ELSE NULL
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [status, status, taskId, userId]
  );
  return findTaskById(userId, taskId);
}

async function deleteTask(userId, taskId) {
  const [result] = await pool.execute(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [taskId, userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createTask,
  findTaskById,
  findTasks,
  updateTask,
  updateTaskStatus,
  deleteTask
};
