require('dotenv').config();

const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
