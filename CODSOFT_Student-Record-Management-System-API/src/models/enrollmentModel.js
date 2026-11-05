const pool = require('../config/database');

const enrollmentColumns = [
  'e.id',
  'e.student_id',
  'e.course_id',
  'e.enrollment_date',
  'e.status',
  'e.created_at',
  'e.updated_at',
  's.name AS student_name',
  'c.course_name',
  'c.course_code'
].join(', ');

const enrollmentSortColumns = {
  id: 'e.id',
  student_id: 'e.student_id',
  course_id: 'e.course_id',
  enrollment_date: 'e.enrollment_date',
  status: 'e.status',
  created_at: 'e.created_at',
  updated_at: 'e.updated_at',
  student_name: 's.name',
  course_name: 'c.course_name'
};

const enrollmentFrom = `
  FROM enrollments e
  INNER JOIN students s ON s.id = e.student_id
  INNER JOIN courses c ON c.id = e.course_id
`;

const enrollmentQuery = `SELECT ${enrollmentColumns}${enrollmentFrom}`;

async function create(enrollment) {
  const [result] = await pool.execute(
    'INSERT INTO enrollments (student_id, course_id, enrollment_date, status) VALUES (?, ?, ?, ?)',
    [
      enrollment.student_id,
      enrollment.course_id,
      enrollment.enrollment_date,
      enrollment.status
    ]
  );

  return findById(result.insertId);
}

async function findAll(options) {
  const conditions = [];
  const values = [];

  for (const field of ['student_id', 'course_id', 'status']) {
    if (options[field] !== undefined) {
      conditions.push(`e.${field} = ?`);
      values.push(options[field]);
    }
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total${enrollmentFrom}${where}`,
    values
  );
  const [rows] = await pool.execute(
    `${enrollmentQuery}${where} ORDER BY ${enrollmentSortColumns[options.sortBy]} ${options.order} LIMIT ? OFFSET ?`,
    [...values, options.limit, options.offset]
  );

  return { items: rows, total: Number(countRows[0].total) };
}

async function findById(id) {
  const [rows] = await pool.execute(
    `${enrollmentQuery} WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function update(id, enrollment) {
  await pool.execute(
    'UPDATE enrollments SET student_id = ?, course_id = ?, enrollment_date = ?, status = ? WHERE id = ?',
    [
      enrollment.student_id,
      enrollment.course_id,
      enrollment.enrollment_date,
      enrollment.status,
      id
    ]
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM enrollments WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, findAll, findById, update, remove };
