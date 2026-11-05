# CODSOFT Online Quiz System Backend

A secure Node.js, Express, and MySQL REST API for quiz administration and participant scoring.

## Features
- JWT registration/login and role-based ADMIN/PARTICIPANT access
- Quiz, question, and option CRUD
- Timed attempts, random question selection, attempt limits
- Server-side scoring with negative marks and certificate thresholds
- Results, history, leaderboards, and statistics
- Automatic expiry finalization
- Helmet, CORS, validation, bcrypt, rate limiting

## Stack
Node.js, Express.js, MySQL 8, mysql2, JWT, bcryptjs, Jest, Supertest, Swagger UI.

## Setup
1. Install Node.js 18+ and MySQL 8.
2. Copy `.env.example` to `.env` and enter database credentials.
3. Run `npm install`.
4. Run `mysql -u root -p < database/schema.sql`.
5. Start with `npm start`.

The API base URL is `http://localhost:3000/api/v1`; health is `/api/health`; Swagger is `/docs`.

## Example requests
```powershell
curl.exe -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Demo User\",\"email\":\"demo@example.com\",\"password\":\"StrongPass123\"}"
curl.exe http://localhost:3000/api/health
```

## Tests
Run `npm test`. Unit tests cover scoring and edge cases; Supertest verifies public HTTP behavior.

## Database setup
Create a dedicated MySQL user and grant it access to the application database:
```sql
CREATE USER 'quiz_app'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON codsoft_quiz.* TO 'quiz_app'@'localhost';
FLUSH PRIVILEGES;
```

## Administrator provisioning
No default administrator account or password is shipped. Register the intended
administrator through the public registration endpoint, then elevate only that
specific, verified account from a trusted MySQL session:

```sql
UPDATE users SET role='ADMIN' WHERE email='trusted-admin@example.com';
```

## GitHub
The project initializes as a local Git repository on branch `main`. No remote is configured. Push only after the repository URL is confirmed by the project owner.
