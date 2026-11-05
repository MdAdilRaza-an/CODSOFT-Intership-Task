const pool = require('../config/database');

const studentColumns = 'id, name, email, phone, created_at, updated_at';
const studentSortColumns = {
  id: 'id',
  name: 'name',
  email: 'email',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

async function create(student) {
  const [result] = await pool.execute(
    'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
    [student.name, student.email, student.phone]
  );

  return findById(result.insertId);
}

async function findAll(options) {
  const where = options.search ? ' WHERE name LIKE ? OR email LIKE ?' : '';
  const searchPattern = `%${options.search}%`;
  const searchValues = options.search ? [searchPattern, searchPattern] : [];
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM students${where}`,
    searchValues
  );
  const [rows] = await pool.execute(
    `SELECT ${studentColumns} FROM students${where} ORDER BY ${studentSortColumns[options.sortBy]} ${options.order} LIMIT ? OFFSET ?`,
    [...searchValues, options.limit, options.offset]
  );

  return { items: rows, total: Number(countRows[0].total) };
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${studentColumns} FROM students WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function update(id, student) {
  await pool.execute(
    'UPDATE students SET name = ?, email = ?, phone = ? WHERE id = ?',
    [student.name, student.email, student.phone, id]
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, findAll, findById, update, remove };
