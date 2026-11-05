const HttpError = require('../errors/HttpError');

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;

function parsePositiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, `${label} must be a positive integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new HttpError(400, `${label} is outside the supported range.`);
  }

  return parsed;
}

function validateListQuery(query, {
  search = false,
  sortByFields,
  filterValidators = {}
}) {
  const allowedFields = new Set(['page', 'limit', 'sortBy', 'order']);
  if (search) {
    allowedFields.add('search');
  }
  for (const field of Object.keys(filterValidators)) {
    allowedFields.add(field);
  }

  const unexpectedFields = Object.keys(query).filter((field) => !allowedFields.has(field));
  if (unexpectedFields.length > 0) {
    throw new HttpError(400, `Unsupported query parameter: ${unexpectedFields[0]}.`);
  }

  const page = query.page === undefined
    ? 1
    : parsePositiveInteger(query.page, 'Page');
  const limit = query.limit === undefined
    ? DEFAULT_PAGE_SIZE
    : parsePositiveInteger(query.limit, 'Limit', MAX_PAGE_SIZE);
  const offset = (page - 1) * limit;

  if (!Number.isSafeInteger(offset)) {
    throw new HttpError(400, 'Page is outside the supported range.');
  }

  let sortBy = 'id';
  if (query.sortBy !== undefined) {
    if (typeof query.sortBy !== 'string' || !sortByFields.includes(query.sortBy)) {
      throw new HttpError(400, 'sortBy must be an allowed column.');
    }
    sortBy = query.sortBy;
  }

  let order = 'ASC';
  if (query.order !== undefined) {
    if (typeof query.order !== 'string' || !['asc', 'desc'].includes(query.order.toLowerCase())) {
      throw new HttpError(400, 'Order must be asc or desc.');
    }
    order = query.order.toUpperCase();
  }

  let searchTerm;
  if (search && query.search !== undefined) {
    if (typeof query.search !== 'string') {
      throw new HttpError(400, 'Search must be a single text value.');
    }
    searchTerm = query.search.trim();
    if (searchTerm.length > MAX_SEARCH_LENGTH) {
      throw new HttpError(400, `Search must not exceed ${MAX_SEARCH_LENGTH} characters.`);
    }
  }

  const filters = {};
  for (const [field, validator] of Object.entries(filterValidators)) {
    if (query[field] !== undefined) {
      filters[field] = validator(query[field]);
    }
  }

  return {
    page,
    limit,
    offset,
    sortBy,
    order,
    ...(search ? { search: searchTerm } : {}),
    ...filters
  };
}

module.exports = { parsePositiveInteger, validateListQuery };
