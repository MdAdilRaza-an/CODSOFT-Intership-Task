const assert = require('node:assert/strict');
const test = require('node:test');
const {
  parsePositiveInteger,
  validateListQuery
} = require('../src/validation/listQueryValidation');

const studentOptions = {
  search: true,
  sortByFields: ['id', 'name', 'email']
};

test('validateListQuery supplies safe pagination and sorting defaults', () => {
  assert.deepEqual(validateListQuery({}, studentOptions), {
    page: 1,
    limit: 10,
    offset: 0,
    sortBy: 'id',
    order: 'ASC',
    search: undefined
  });
});

test('validateListQuery accepts search, pagination, sorting, and direction', () => {
  assert.deepEqual(
    validateListQuery(
      { search: '  Rahul ', page: '2', limit: '25', sortBy: 'name', order: 'desc' },
      studentOptions
    ),
    {
      page: 2,
      limit: 25,
      offset: 25,
      sortBy: 'name',
      order: 'DESC',
      search: 'Rahul'
    }
  );
});

test('validateListQuery rejects unsupported and invalid pagination values', () => {
  assert.throws(() => validateListQuery({ page: '0' }, studentOptions), { status: 400 });
  assert.throws(() => validateListQuery({ limit: '101' }, studentOptions), { status: 400 });
  assert.throws(() => validateListQuery({ order: 'sideways' }, studentOptions), { status: 400 });
  assert.throws(() => validateListQuery({ unexpected: 'x' }, studentOptions), { status: 400 });
});

test('validateListQuery rejects unsafe sort columns and repeated values', () => {
  assert.throws(() => validateListQuery({ sortBy: 'name; DROP TABLE students' }, studentOptions), {
    status: 400
  });
  assert.throws(() => validateListQuery({ search: ['Rahul', 'Asha'] }, studentOptions), {
    status: 400
  });
});

test('validateListQuery validates enrollment filters', () => {
  const options = validateListQuery(
    { student_id: '4', course_id: '9', status: 'completed' },
    {
      sortByFields: ['id', 'status'],
      filterValidators: {
        student_id: (value) => parsePositiveInteger(value, 'Student ID', 4294967295),
        course_id: (value) => parsePositiveInteger(value, 'Course ID', 4294967295),
        status: (value) => {
          if (!['enrolled', 'completed', 'dropped'].includes(value)) {
            throw new Error('invalid status');
          }
          return value;
        }
      }
    }
  );

  assert.equal(options.student_id, 4);
  assert.equal(options.course_id, 9);
  assert.equal(options.status, 'completed');
});

test('parsePositiveInteger rejects values outside the allowed range', () => {
  assert.throws(() => parsePositiveInteger('-1', 'Page'), { status: 400 });
  assert.throws(() => parsePositiveInteger('4294967296', 'Student ID', 4294967295), {
    status: 400
  });
});
