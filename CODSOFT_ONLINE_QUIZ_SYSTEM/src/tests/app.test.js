process.env.NODE_ENV='test';
process.env.JWT_SECRET='test-secret-that-is-at-least-32-characters-long';
jest.mock('../config/db',()=>({execute:jest.fn(),getConnection:jest.fn()}));
const request=require('supertest');
const app=require('../app');

describe('HTTP API',()=>{
  test('health endpoint is public',async()=>{
    const response=await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
  test('missing token is rejected',async()=>{
    const response=await request(app).get('/api/v1/auth/profile');
    expect(response.status).toBe(401);
  });
  test('Question 4 option route resolves to authentication instead of a 404',async()=>{
    const response=await request(app)
      .post('/api/v1/questions/4/options')
      .send({text:'const',is_correct:true,position:0});
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication token is required');
  });
  test('unknown route returns JSON 404',async()=>{
    const response=await request(app).get('/api/v1/not-found');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Route not found');
  });
  test('Swagger documentation is available',async()=>{
    const response=await request(app).get('/docs/');
    expect([200,301,302]).toContain(response.status);
  });
});
