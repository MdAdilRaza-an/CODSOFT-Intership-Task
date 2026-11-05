# Phase 12 Automated and Manual Verification Report

## Automated Verification

Run:

```powershell
npm test
npm run test:coverage
```

The Jest and Supertest suite verifies application startup, authentication validation, task routes, task validation, service ownership behavior, database operation exports, search/filter query forwarding, and bonus fields.

## Manual API Verification

Manual verification was completed during earlier phases against the running Express server and MySQL database for:

- User registration and login
- JWT issuance and protected profile access
- Invalid login and missing JWT responses
- Task create, read, update, status, filter, and delete operations
- Search, pagination, sorting, status, priority, category, and due-date queries
- ISO 8601 due-date normalization
- Swagger UI and OpenAPI JSON

## Verification Status

PASS: Implemented route behavior tested by Jest/Supertest.
PASS: Real MySQL task operations and authentication smoke-tested during development.
PASS: Swagger UI and OpenAPI JSON endpoints returned HTTP 200.
PASS: Postman collection parsed successfully.
PASS: Latest coverage run reported 54.1% statement coverage and 54.75% line coverage.
NOT TESTED: A clean-machine database setup without an existing database instance.
