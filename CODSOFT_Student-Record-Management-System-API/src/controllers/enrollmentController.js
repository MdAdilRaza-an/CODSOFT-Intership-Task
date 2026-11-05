const HttpError = require('../errors/HttpError');
const courseModel = require('../models/courseModel');
const enrollmentModel = require('../models/enrollmentModel');
const studentModel = require('../models/studentModel');
const { parsePositiveInteger, validateListQuery } = require('../validation/listQueryValidation');
const {
  validateEnrollment,
  validateEnrollmentId
} = require('../validation/enrollmentValidation');

async function ensureReferencesExist(studentId, courseId) {
  if (!await studentModel.findById(studentId)) {
    throw new HttpError(404, 'Student not found.');
  }

  if (!await courseModel.findById(courseId)) {
    throw new HttpError(404, 'Course not found.');
  }
}

async function create(req, res) {
  const enrollment = validateEnrollment(req.body);
  await ensureReferencesExist(enrollment.student_id, enrollment.course_id);

  const createdEnrollment = await enrollmentModel.create(enrollment);
  res.status(201).json({ success: true, data: createdEnrollment });
}

async function list(req, res) {
  const query = validateListQuery(req.query, {
    sortByFields: [
      'id',
      'student_id',
      'course_id',
      'enrollment_date',
      'status',
      'created_at',
      'updated_at',
      'student_name',
      'course_name'
    ],
    filterValidators: {
      student_id: (value) => parsePositiveInteger(value, 'Student ID', 4294967295),
      course_id: (value) => parsePositiveInteger(value, 'Course ID', 4294967295),
      status: (value) => {
        if (typeof value !== 'string' || !['enrolled', 'completed', 'dropped'].includes(value)) {
          throw new HttpError(400, 'Status must be enrolled, completed, or dropped.');
        }
        return value;
      }
    }
  });
  const result = await enrollmentModel.findAll(query);
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
  const enrollment = await enrollmentModel.findById(validateEnrollmentId(req.params.id));
  if (!enrollment) {
    throw new HttpError(404, 'Enrollment not found.');
  }

  res.status(200).json({ success: true, data: enrollment });
}

async function update(req, res) {
  const id = validateEnrollmentId(req.params.id);
  const enrollment = validateEnrollment(req.body, { forUpdate: true });
  await ensureReferencesExist(enrollment.student_id, enrollment.course_id);

  const updatedEnrollment = await enrollmentModel.update(id, enrollment);
  if (!updatedEnrollment) {
    throw new HttpError(404, 'Enrollment not found.');
  }

  res.status(200).json({ success: true, data: updatedEnrollment });
}

async function remove(req, res) {
  const deleted = await enrollmentModel.remove(validateEnrollmentId(req.params.id));
  if (!deleted) {
    throw new HttpError(404, 'Enrollment not found.');
  }

  res.status(204).end();
}

module.exports = { create, list, getById, update, remove };
