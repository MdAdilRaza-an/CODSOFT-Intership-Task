# To-Do List Backend

A secure, modular RESTful API for user-specific task management built with Node.js, Express.js, MySQL 8, JWT, and bcrypt.

## Features

- User registration and login
- bcrypt password hashing
- JWT authentication and protected routes
- User-specific task CRUD operations
- Completed and pending task statuses
- Task search, filtering, sorting, pagination, and due-date filtering
- Priority and category support
- Helmet, CORS, rate limiting, and request-size protection
- Swagger UI and Postman collection
- Jest and Supertest automated testing

## Technology Stack

- Node.js 22
- Express.js 5
- MySQL 8
- mysql2
- JWT and bcryptjs
- express-validator
- Helmet and CORS
- Express Rate Limit
- Swagger UI and swagger-jsdoc
- Jest and Supertest
- Nodemon

## Project Structure

```text
src/
  config/        Database and Swagger configuration
  controllers/   HTTP request/response handling
  services/      Business and authorization logic
  models/        Parameterized MySQL operations
  routes/        Express route definitions
  middleware/    Authentication and centralized error handling
  validators/    Request validation
  tests/         Jest and Supertest suites
 database/       MySQL schema
 documentation/  API, testing, and security documentation
 postman/        Postman collection
```

## Installation

```powershell
cd "D:\CODSOFT_to-do list backend"
npm install
```

Copy `.env.example` to `.env`, then replace the placeholders:

```powershell
Copy-Item .env.example .env
```

Required environment values:

```dotenv
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_list_db
DB_USER=todo_app
DB_PASSWORD=your_database_password
JWT_SECRET=a-random-secret-containing-at-least-32-characters
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000
```

## Database Setup

Start MySQL 8, then run:

```powershell
Get-Content .\database\schema.sql | mysql -uroot -p
```

The schema creates:

- `todo_list_db`
- `users`
- `tasks`
- Indexes and foreign-key ownership constraints

Use a dedicated database account rather than MySQL root for the application.

## Running the API

```powershell
npm start
```

Development mode with automatic restart:

```powershell
npm run dev
```

Health check:

```text
GET http://localhost:3000/health
```

## Authentication

Register or log in, then send the returned JWT as a bearer token:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Authorization: Bearer <token>
```

Registration example:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123!"
}
```

The API uses stateless JWT logout: a client removes its token. Immediate server-side revocation requires a token blacklist or shorter-lived token strategy.

## Task Endpoints

```text
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id
```

All task endpoints require authentication.

Create task example:

```json
{
  "title": "Complete project",
  "description": "Finish backend implementation",
  "due_date": "2026-12-01T10:00:00.000Z",
  "priority": "high",
  "category": "work"
}
```

Status example:

```json
{
  "status": "completed"
}
```

## Search, Filters, Sorting, and Pagination

```text
GET /api/tasks?search=meeting
GET /api/tasks?status=pending
GET /api/tasks?status=completed
GET /api/tasks?priority=high
GET /api/tasks?category=work
GET /api/tasks?due_after=2026-11-01T00:00:00.000Z
GET /api/tasks?due_before=2026-12-31T23:59:59.000Z
GET /api/tasks?page=1&limit=10
GET /api/tasks?sortBy=created_at&order=DESC
```

Supported sort fields:

```text
created_at, updated_at, due_date, title, priority
```

## API Documentation

Swagger UI:

```text
http://localhost:3000/api-docs
```

OpenAPI JSON:

```text
http://localhost:3000/api-docs.json
```

Postman collection:

```text
postman/todo-list-backend.postman_collection.json
```

## Testing

```powershell
npm test
npm run test:coverage
npm run test:watch
```

The test suite uses Jest and Supertest. It covers authentication routes, task routes, validation, business logic, query forwarding, and bonus fields.

## Security

- Passwords are bcrypt-hashed
- JWT secrets must come from environment variables
- Task operations are scoped to the authenticated user
- SQL values use parameterized queries
- Authentication endpoints are rate-limited
- Helmet provides security headers
- Request bodies are limited
- Unexpected errors are not exposed to API clients

Do not commit `.env`, real database passwords, JWT secrets, logs, or coverage output.

Task due dates are normalized to UTC before storage in MySQL `DATETIME` columns; clients should send ISO 8601 date-time strings and treat returned `DATETIME` values as UTC.

The optional seed account uses `demo@example.com` with password `Password123!`; change or remove these credentials before deployment.

## Requirements Checklist

- Database schema and task/user models: PASS
- Authentication and JWT protection: PASS
- User-specific CRUD operations: PASS
- Completed and pending status: PASS
- Search, filtering, sorting, pagination: PASS
- Priority, category, and due-date support: PASS
- Swagger UI and Postman collection: PASS
- Automated Jest/Supertest coverage: PASS
- Manual MySQL API verification: PASS
- README and GitHub preparation: PASS
- Clean-machine setup verification: NOT TESTED

## Future Improvements

- Refresh-token or token-revocation support
- Database migrations
- Docker Compose deployment
- CI/CD pipeline
- Expanded integration and clean-database test coverage
- Dependency vulnerability remediation after Swagger compatibility testing
