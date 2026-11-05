const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), passwordHash, 'PARTICIPANT']
      );
      res.status(201).json({ id: result.insertId, name: name.trim(), email: email.toLowerCase().trim(), role: 'PARTICIPANT' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw httpError(409, 'Email is already registered');
      throw error;
    }
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!rows.length || !rows[0].is_active) throw httpError(401, 'Invalid email or password');
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) throw httpError(401, 'Invalid email or password');
    const token = jwt.sign({ role: rows[0].role }, process.env.JWT_SECRET, {
      subject: String(rows[0].id),
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
    res.json({ token, user: { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role } });
  } catch (error) { next(error); }
};

exports.profile = async (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role });
};
