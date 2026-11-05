process.env.JWT_SECRET='test-secret-that-is-at-least-32-characters-long';
jest.mock('../config/db',()=>({execute:jest.fn(),getConnection:jest.fn()}));
jest.mock('bcryptjs',()=>({hash:jest.fn(async()=>'$2b$12$hashed'),compare:jest.fn()}));

const pool=require('../config/db');
const quiz=require('../controllers/quizController');
const question=require('../controllers/questionController');
const auth=require('../controllers/authController');
const result=require('../controllers/resultController');

function response(){
  return {
    status:jest.fn().mockReturnThis(),
    json:jest.fn().mockReturnThis(),
    send:jest.fn().mockReturnThis()
  };
}

describe('focused controller audit',()=>{
  beforeEach(()=>jest.clearAllMocks());

  test('quiz pagination filters both rows and total count by category',async()=>{
    pool.execute
      .mockResolvedValueOnce([[{id:1,title:'Category quiz'}]])
      .mockResolvedValueOnce([[{count:1}]]);
    const req={query:{page:'2',limit:'5',category:'Science'},user:{role:'PARTICIPANT'}};
    const res=response();
    const next=jest.fn();
    await quiz.list(req,res,next);
    expect(pool.execute).toHaveBeenNthCalledWith(1,expect.stringContaining('category = ?'),['Science',5,5]);
    expect(pool.execute).toHaveBeenNthCalledWith(2,expect.stringContaining('is_published = TRUE AND category = ?'),['Science']);
    expect(res.json).toHaveBeenCalledWith({items:[{id:1,title:'Category quiz'}],pagination:{page:2,limit:5,total:1}});
  });

  test('quiz pagination rejects invalid page and limit',async()=>{
    const next=jest.fn();
    await quiz.list({query:{page:'abc',limit:'0'},user:{role:'ADMIN'}},response(),next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({status:400}));
    expect(pool.execute).not.toHaveBeenCalled();
  });

  test('publish operation accepts false and does not depend on changed-row count',async()=>{
    pool.execute
      .mockResolvedValueOnce([[{id:7}]])
      .mockResolvedValueOnce([{affectedRows:0}]);
    const res=response();
    const next=jest.fn();
    await quiz.setPublished({body:{published:false},params:{id:'7'}},res,next);
    expect(pool.execute).toHaveBeenNthCalledWith(2,'UPDATE quizzes SET is_published=? WHERE id=?',[false,'7']);
    expect(res.json).toHaveBeenCalledWith({id:7,is_published:false});
  });

  test('participant question listing omits is_correct from SQL and response options',async()=>{
    pool.execute
      .mockResolvedValueOnce([[{is_published:1}]])
      .mockResolvedValueOnce([[{id:3,quiz_id:7,text:'Question?',marks:1,position:0}]])
      .mockResolvedValueOnce([[{id:8,text:'Answer',position:0}]]);
    const res=response();
    await question.listQuestions({params:{id:'7'},user:{role:'PARTICIPANT'}},res,jest.fn());
    const optionSql=pool.execute.mock.calls[2][0];
    expect(optionSql).not.toContain('is_correct');
    expect(res.json.mock.calls[0][0][0].options[0]).not.toHaveProperty('is_correct');
  });

  test('public registration always persists the PARTICIPANT role even if role is submitted',async()=>{
    pool.execute.mockResolvedValueOnce([{insertId:44}]);
    const res=response();
    await auth.register({body:{name:'Test User',email:'USER@example.com',password:'StrongPass123',role:'ADMIN'}},res,jest.fn());
    expect(pool.execute).toHaveBeenCalledWith(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Test User','user@example.com','$2b$12$hashed','PARTICIPANT']
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('my results validates pagination and returns total count',async()=>{
    pool.execute
      .mockResolvedValueOnce([[{id:1,quiz_title:'Quiz'}]])
      .mockResolvedValueOnce([[{count:1}]]);
    const res=response();
    await result.myResults({query:{page:'1',limit:'10'},user:{id:9}},res,jest.fn());
    expect(res.json).toHaveBeenCalledWith({
      items:[{id:1,quiz_title:'Quiz'}],
      pagination:{page:1,limit:10,total:1}
    });
  });
});
