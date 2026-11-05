const HttpError = require('../errors/HttpError');
const courseModel = require('../models/courseModel');
const { validateListQuery } = require('../validation/listQueryValidation');
const { validateCourse, validateCourseId } = require('../validation/courseValidation');

async function create(req, res) {
  const course = await courseModel.create(validateCourse(req.body));
  res.status(201).json({ success: true, data: course });
}

async function list(req, res) {
  const query = validateListQuery(req.query, {
    search: true,
    sortByFields: ['id', 'course_name', 'course_code', 'created_at', 'updated_at']
  });
  const result = await courseModel.findAll(query);
  res.status(200).json({
    success: true,
    data: result.items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit)
    }
  });
}

async function getById(req, res) {
  const course = await courseModel.findById(validateCourseId(req.params.id));
  if (!course) {
    throw new HttpError(404, 'Course not found.');
  }

  res.status(200).json({ success: true, data: course });
}

async function update(req, res) {
  const id = validateCourseId(req.params.id);
  const course = await courseModel.update(id, validateCourse(req.body));
  if (!course) {
    throw new HttpError(404, 'Course not found.');
  }

  res.status(200).json({ success: true, data: course });
}

async function remove(req, res) {
  const deleted = await courseModel.remove(validateCourseId(req.params.id));
  if (!deleted) {
    throw new HttpError(404, 'Course not found.');
  }

  res.status(204).end();
}

module.exports = { create, list, getById, update, remove };
