const mysql = require('mysql2/promise');

function dbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'quiz_app',
    password: process.env.DB_PASSWORD || '',
    database: process.env.NODE_ENV === 'test' ? (process.env.TEST_DB_NAME || 'codsoft_quiz_test') : (process.env.DB_NAME || 'codsoft_quiz'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  };
}

const pool = mysql.createPool(dbConfig());
module.exports = pool;
