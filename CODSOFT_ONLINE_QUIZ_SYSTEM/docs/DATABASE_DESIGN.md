# Database Design

The schema uses `users`, `quizzes`, `questions`, `options`, `quiz_attempts`, `submitted_answers`, and `quiz_results`.

- One user creates many quizzes and has many attempts/results.
- One quiz has many questions and attempts.
- One question has many options.
- Each attempt stores its fixed selected question IDs as a JSON snapshot.
- Submitted answers reference one attempt, question, and option.
- One completed attempt has one unique result.
- Cascades remove dependent questions/options/answers where appropriate.
- Foreign keys and unique constraints preserve referential and submission integrity.
- Decimal columns prevent floating-point score corruption.
