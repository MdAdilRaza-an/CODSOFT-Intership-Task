USE todo_list_db;

-- Demo credentials: demo@example.com / Password123!
INSERT IGNORE INTO users (name, email, password_hash)
VALUES ('Demo User', 'demo@example.com', '$2b$12$dP/TI/tQ8Ivktg1azfGbN.GJxGNnIfm73v68hngc7QX99F67tRjte');

SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com' LIMIT 1);

INSERT INTO tasks (user_id, title, description, status, priority, category, due_date)
VALUES
  (@demo_user_id, 'Review project requirements', 'Review CODSOFT backend requirements', 'pending', 'high', 'work', '2026-12-01 10:00:00'),
  (@demo_user_id, 'Exercise', 'Complete a 30-minute workout', 'pending', 'medium', 'personal', NULL);
