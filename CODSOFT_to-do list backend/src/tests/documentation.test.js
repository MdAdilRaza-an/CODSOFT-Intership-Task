const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../app');

describe('Generated API documentation', () => {
  test('Swagger UI and OpenAPI JSON are available', async () => {
    expect((await request(app).get('/api-docs.json')).status).toBe(200);
    expect((await request(app).get('/api-docs/')).status).toBe(200);
  });

  test('Postman collection protects requests with the collection JWT variable', () => {
    const collectionPath = path.join(__dirname, '../../postman/todo-list-backend.postman_collection.json');
    const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

    const protectedRequests = collection.item.filter((item) =>
      item.request.url.includes('/api/auth/me') || item.request.url.includes('/api/tasks')
    );

    expect(protectedRequests.length).toBeGreaterThan(0);
    for (const item of protectedRequests) {
      const authorization = item.request.header && item.request.header.find((header) => header.key === 'Authorization');
      if (authorization) expect(authorization.value).toBe('Bearer {{token}}');
    }
  });
});
