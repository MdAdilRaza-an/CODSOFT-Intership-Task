const app = require('./app');
const pool = require('./config/database');

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

async function startServer() {
  try {
    const connection = await pool.getConnection();
    connection.release();

    app.listen(port, () => {
      console.log(`Student Record Management API listening on port ${port}.`);
    });
  } catch (error) {
    console.error('Could not connect to the configured MySQL database:', error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

startServer();
