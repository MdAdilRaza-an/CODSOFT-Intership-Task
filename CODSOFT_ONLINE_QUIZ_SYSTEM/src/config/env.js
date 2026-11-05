function validateEnvironment() {
  const required = process.env.NODE_ENV === 'test' ? ['JWT_SECRET'] : ['JWT_SECRET','DB_HOST','DB_USER','DB_NAME'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  if (String(process.env.JWT_SECRET).length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  if (process.env.BCRYPT_SALT_ROUNDS) {
    const rounds=Number(process.env.BCRYPT_SALT_ROUNDS);
    if (!Number.isInteger(rounds) || rounds < 4 || rounds > 14) throw new Error('BCRYPT_SALT_ROUNDS must be an integer from 4 to 14');
  }
}
module.exports = { validateEnvironment };
