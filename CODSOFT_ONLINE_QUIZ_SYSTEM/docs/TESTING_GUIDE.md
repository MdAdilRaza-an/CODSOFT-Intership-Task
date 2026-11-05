# Testing Guide

Run `npm test` or `npm run test:coverage`.

The automated suite currently includes:
- Correct/incorrect/unanswered scoring
- Negative score prevention
- Random selection permutation
- Public health endpoint
- Missing-token rejection
- Unknown-route handling
- Swagger availability
- Filtered quiz pagination and total count
- Invalid pagination rejection
- Publish/unpublish behavior
- Participant-safe question options
- Participant-only public registration

MySQL integration requires credentials for the local server. Integration tests should use `codsoft_quiz_test`, never the production database.
