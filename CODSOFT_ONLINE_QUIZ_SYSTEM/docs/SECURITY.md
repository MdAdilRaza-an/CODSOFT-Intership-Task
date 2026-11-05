# Security

- Passwords use bcrypt with configurable salt rounds.
- JWT access tokens use a required long secret and configurable expiry.
- Public registration always creates PARTICIPANT; ADMIN must be provisioned directly.
- Ownership checks prevent users from reading other users' private attempts/results.
- SQL queries use placeholders and parameterized values.
- Helmet adds security headers; CORS is configurable.
- Express validation blocks malformed fields.
- Rate limiting protects public API traffic.
- Internal database and stack details are not returned.
- Scoring uses server-side quiz and option data.
- Correct option flags are omitted from participant quiz and attempt responses.

## Administrator provisioning

There are intentionally no default administrator credentials. To provision a trusted administrator:

1. Use `POST /api/v1/auth/register` to create the account as a `PARTICIPANT`.
2. On the MySQL server, in an approved administrative session, run:
   ```sql
   UPDATE users SET role='ADMIN' WHERE email='trusted-admin@example.com';
   ```
3. The user must log in again to receive a JWT containing fresh application authorization.
4. Never place an administrator password, token, or password hash in SQL seed files or source control.
