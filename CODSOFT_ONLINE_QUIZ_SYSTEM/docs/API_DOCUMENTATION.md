# API Documentation

Base URL: `/api/v1`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register participant |
| POST | `/auth/login` | Public | Obtain JWT |
| GET | `/auth/profile` | Authenticated | Current profile |
| POST | `/quizzes` | ADMIN | Create quiz |
| GET | `/quizzes` | Public/participant | List quizzes |
| GET | `/quizzes/:id` | Public/participant | Retrieve quiz |
| PATCH | `/quizzes/:id` | ADMIN | Update quiz |
| DELETE | `/quizzes/:id` | ADMIN | Delete quiz |
| PATCH | `/quizzes/:id/publish` | ADMIN | Publish/unpublish |
| POST | `/quizzes/:id/questions` | ADMIN | Add question |
| GET | `/quizzes/:id/questions` | Public/ADMIN | Participant-safe or admin questions |
| PATCH | `/questions/:id` | ADMIN | Update question |
| DELETE | `/questions/:id` | ADMIN | Delete question |
| POST | `/questions/:id/options` | ADMIN | Add option |
| PATCH | `/options/:id` | ADMIN | Update option |
| DELETE | `/options/:id` | ADMIN | Delete option |
| POST | `/quizzes/:id/attempts` | Participant | Start attempt |
| GET | `/attempts/:id` | Owner/ADMIN | Attempt metadata |
| GET | `/attempts/:id/questions` | Owner/ADMIN | Attempt questions |
| POST | `/attempts/:id/submit` | Owner/participant | Submit answers |
| GET | `/results/:id` | Owner/ADMIN | Result details |
| GET | `/users/me/results` | Authenticated | Result history |
| GET | `/users/me/statistics` | Authenticated | Personal statistics |
| GET | `/quizzes/:id/statistics` | ADMIN | Quiz statistics |
| GET | `/leaderboard` | Public | Global leaderboard |
| GET | `/quizzes/:id/leaderboard` | Public | Quiz leaderboard |
| GET | `/results/:id/certificate-eligibility` | Owner/ADMIN | Certificate eligibility |

Send `Authorization: Bearer <JWT>` to authenticated endpoints. Validation errors return `400`; authorization failures return `403`; missing resources return `404`.
