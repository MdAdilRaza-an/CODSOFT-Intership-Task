const express = require('express');
const HttpError = require('./errors/HttpError');
const errorHandler = require('./middleware/errorHandler');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.use((_req, _res, next) => {
  next(new HttpError(404, 'API route not found.'));
});

app.use(errorHandler);

module.exports = app;
