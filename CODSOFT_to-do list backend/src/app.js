const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const swaggerSpec = require('./config/swagger');
const documentationRoutes = require('./routes/documentation.routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api-docs', documentationRoutes);
app.get('/api-docs.json', (req, res) => res.status(200).json(swaggerSpec));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'To-Do List API is running'
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
