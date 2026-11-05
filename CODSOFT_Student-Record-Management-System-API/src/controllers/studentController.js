const HttpError = require('../errors/HttpError');
const studentModel = require('../models/studentModel');
const { validateListQuery } = require('../validation/listQueryValidation');
const { validateStudent, validateStudentId } = require('../validation/studentValidation');

async function create(req, res) {
  const student = await studentModel.create(validateStudent(req.body));
  res.status(201).json({ success: true, data: student });
}

async function list(req, res) {
  const query = validateListQuery(req.query, {
    search: true,
    sortByFields: ['id', 'name', 'email', 'created_at', 'updated_at']
  });
  const result = await studentModel.findAll(query);
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
  const student = await studentModel.findById(validateStudentId(req.params.id));
  if (!student) {
    throw new HttpError(404, 'Student not found.');
  }

  res.status(200).json({ success: true, data: student });
}

async function update(req, res) {
  const id = validateStudentId(req.params.id);
  const student = await studentModel.update(id, validateStudent(req.body));
  if (!student) {
    throw new HttpError(404, 'Student not found.');
  }

  res.status(200).json({ success: true, data: student });
}

async function remove(req, res) {
  const deleted = await studentModel.remove(validateStudentId(req.params.id));
  if (!deleted) {
    throw new HttpError(404, 'Student not found.');
  }

  res.status(204).end();
}

module.exports = { create, list, getById, update, remove };
