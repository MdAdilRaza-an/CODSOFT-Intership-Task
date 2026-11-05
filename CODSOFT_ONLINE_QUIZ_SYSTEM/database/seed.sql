USE codsoft_quiz;

-- Intentionally no users or credentials are seeded.
-- This database must not ship default passwords or publicly known admin accounts.
-- Provision an administrator by registering a participant, securely hashing the
-- chosen password through the application's /api/v1/auth/register endpoint, then
-- elevating that specific account in a trusted database session:
--   UPDATE users SET role='ADMIN' WHERE email='trusted-admin@example.com';
