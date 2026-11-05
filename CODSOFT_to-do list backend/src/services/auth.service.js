const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function register({ name, email, password }) {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await userModel.findByEmail(normalizedEmail);

  if (existingUser) {
    throw createError('Email address is already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await userModel.createUser(name, normalizedEmail, passwordHash);
    return { user, token: createToken(user.id) };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw createError('Email address is already registered', 409);
    }
    throw error;
  }
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase();
  const userWithPassword = await userModel.findByEmail(normalizedEmail);

  if (!userWithPassword || !(await bcrypt.compare(password, userWithPassword.password_hash))) {
    throw createError('Invalid email or password', 401);
  }

  const user = await userModel.findById(userWithPassword.id);
  return { user, token: createToken(user.id) };
}

function createToken(userId) {
  return jwt.sign(
    { sub: String(userId) },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

module.exports = { register, login, createToken };
