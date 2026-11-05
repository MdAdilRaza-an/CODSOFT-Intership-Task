# Final Audit Report

## Current checkpoint verification

| Area | Result | Evidence |
|---|---|---|
| Question 4 option route | PASS | Live server now returns `401 Authentication token is required`, proving `POST /api/v1/questions/4/options` resolves to the registered route rather than the generic 404 handler |
| Question 4 options | PASS | `const`, `let`, `var`, and `static` are present; `const` is correct |
| Question 5 | PASS | Added push/pop/shift/unshift options; `push()` is correct; marks 2, position 5 |
| Question 1 wording | PASS | Updated to block-scoped/reassignable wording; `let` remains correct |
| Quiz total marks | PASS | Database verification reports five questions totaling 10 marks |
| Published quiz workflow | PASS | Quiz 1 is published and participant endpoints were exercised |
| Correct-answer hiding | PASS | Attempt question options contained no `is_correct` field |
| Valid submission and score | PASS | 5 correct answers scored 10/10, 100%, passed, certificate eligible |
| Negative marking | PASS | An all-wrong submission returned 0/10 after the negative-score policy clamp |
| Invalid submissions | PASS | Duplicate question answers and invalid option/question pairs returned 400 |
| History and statistics | PASS | Two completed results, history count 2, average score 50%, highest score 10 |
| Leaderboards | PASS | Quiz and global leaderboards returned the tested participant |
| Certificate eligibility | PASS | `100%` result returned `certificate_eligible: 1` through the result eligibility endpoint |
| Unauthorized admin operation | PASS | Participant received 403 for the publish-admin route |
| Automated tests | PASS | `npm test`: 3 suites, 15 tests passed |
| Lint | PASS | `npm run lint` completed successfully |
| Live MySQL integration | PASS | Live Express HTTP workflow and database verification used `codsoft_quiz` |

## Question 4 route root cause

The route is registered correctly in `src/routes/apiRoutes.js` as `POST /questions/:id/options` and mounted at `/api/v1` in `src/app.js`. The question ID does not alter route matching: the route is `:id` and Question 4 existed before this test. The reported 404 therefore was not reproducible in the current source/server state after the server was restarted. An authenticated request would reach controller code, while an unauthenticated request reaches the auth middleware and returns 401.

The likely checkpoint failure was a stale or mismatched running application instance and/or a request URL resolved outside the mounted `/api/v1` path. The live process was stopped and restarted from the current project entrypoint, then `POST /api/v1/questions/4/options` was reproduced safely and returned 401 instead of 404. No database question or option was duplicated by the diagnosis.

`src/routes/apiRoutes.js` also now explicitly validates option `position` values as non-negative integers. This prevents malformed option payloads and does not change the route shape.

## Files changed

- `src/routes/apiRoutes.js` - added option position validation.
- `src/tests/app.test.js` - added a route-resolution regression test for Question 4 options.
- `FINAL_AUDIT.md` - recorded the live route diagnosis, database verification, workflow evidence, and automated-test results.

## Fixes completed

- Restarted the existing server process from the current project source and verified `/api/health`.
- Confirmed the live `POST /api/v1/questions/4/options` route is registered and returns authentication middleware behavior rather than generic 404 behavior.
- Added all four options for Question 4 without duplicate creation.
- Added and verified Question 5 with 2 marks and position 5.
- Updated Question 1 wording and retained `let` as the correct answer.
- Verified the five question marks sum to 10.
- Published Quiz 1 and completed participant attempt, result, leaderboard, statistics, certificate, invalid-submission, and authorization checks.

## Test command evidence

- `npm test`: PASS, 3 suites passed, 15 tests passed.
- `npm run lint`: PASS, no lint failures reported.
- Live MySQL/API integration: PASS in the existing development database. No destructive database operation or existing-record deletion was performed.

## Remaining issues

- Automated Jest coverage uses unit/controller mocks; it does not currently run against a separate `TEST_DB_NAME` integration database.
- The dependency audit finding recorded during the earlier checkpoint remains: an `npm audit` report contained 20 vulnerabilities, and the suggested forced Jest downgrade was not compatible and was not applied.
- A separate integration test database is recommended before destructive or migration-heavy database testing, but no such cleanup is needed for the current checkpoint.
