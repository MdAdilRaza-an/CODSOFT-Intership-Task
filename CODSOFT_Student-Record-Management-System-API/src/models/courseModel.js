const pool = require('../config/database');

const courseColumns = 'id, course_name, course_code, description, created_at, updated_at';
const courseSortColumns = {
  id: 'id',
  course_name: 'course_name',
  course_code: 'course_code',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

async function create(course) {
  const [result] = await pool.execute(
    'INSERT INTO courses (course_name, course_code, description) VALUES (?, ?, ?)',
    [course.course_name, course.course_code, course.description]
  );

  return findById(result.insertId);
}

async function findAll(options) {
  const where = options.search ? ' WHERE course_name LIKE ? OR course_code LIKE ?' : '';
  const searchPattern = `%${options.search}%`;
  const searchValues = options.search ? [searchPattern, searchPattern] : [];
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM courses${where}`,
    searchValues
  );
  const [rows] = await pool.execute(
    `SELECT ${courseColumns} FROM courses${where} ORDER BY ${courseSortColumns[options.sortBy]} ${options.order} LIMIT ? OFFSET ?`,
    [...searchValues, options.limit, options.offset]
  );

  return { items: rows, total: Number(countRows[0].total) };
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${courseColumns} FROM courses WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function update(id, course) {
  await pool.execute(
    'UPDATE courses SET course_name = ?, course_code = ?, description = ? WHERE id = ?',
    [course.course_name, course.course_code, course.description, id]
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, findAll, findById, update, remove };
