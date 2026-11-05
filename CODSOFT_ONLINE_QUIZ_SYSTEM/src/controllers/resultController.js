const pool = require('../config/db');
function error(status,message){const e=new Error(message);e.status=status;return e;}

function pagination(query){
  const pageValue=query.page??1;
  const limitValue=query.limit??10;
  if(!/^\d+$/.test(String(pageValue))||!/^\d+$/.test(String(limitValue)))throw error(400,'page and limit must be positive integers');
  const page=Number(pageValue);
  const limit=Number(limitValue);
  if(!Number.isSafeInteger(page)||page<1||!Number.isSafeInteger(limit)||limit<1||limit>100)throw error(400,'Invalid pagination');
  return {page,limit,offset:(page-1)*limit};
}

exports.getResult=async(req,res,next)=>{try{const[rows]=await pool.execute(`SELECT r.*,u.name,u.email,a.status,a.started_at,a.submitted_at FROM quiz_results r JOIN users u ON u.id=r.user_id JOIN quiz_attempts a ON a.id=r.attempt_id WHERE r.id=?`,[req.params.id]);if(!rows.length)throw error(404,'Result not found');if(req.user.role!=='ADMIN'&&Number(rows[0].user_id)!==Number(req.user.id))throw error(403,'Access denied');res.json(rows[0]);}catch(e){next(e);} };
exports.myResults=async(req,res,next)=>{
  try{
    const {page,limit,offset}=pagination(req.query);
    const[rows]=await pool.execute(
      `SELECT r.*,q.title AS quiz_title FROM quiz_results r JOIN quizzes q ON q.id=r.quiz_id WHERE r.user_id=? ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id,limit,offset]
    );
    const[countRows]=await pool.execute('SELECT COUNT(*) AS count FROM quiz_results WHERE user_id=?',[req.user.id]);
    res.json({items:rows,pagination:{page,limit,total:Number(countRows[0].count)}});
  }catch(e){next(e);}
};
exports.myStatistics=async(req,res,next)=>{try{const[rows]=await pool.execute(`SELECT COUNT(*) total_attempts,SUM(status='COMPLETED') completed_attempts,AVG((SELECT percentage FROM quiz_results WHERE attempt_id=quiz_attempts.id)) average_score,MAX((SELECT obtained_marks FROM quiz_results WHERE attempt_id=quiz_attempts.id)) highest_score,SUM((SELECT passed FROM quiz_results WHERE attempt_id=quiz_attempts.id)=1) passed_quizzes,SUM((SELECT passed FROM quiz_results WHERE attempt_id=quiz_attempts.id)=0) failed_quizzes FROM quiz_attempts WHERE user_id=?`,[req.user.id]);const[trend]=await pool.execute(`SELECT DATE(created_at) date,AVG(percentage) score FROM quiz_results WHERE user_id=? GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30`,[req.user.id]);res.json({...rows[0],performance_trend:trend});}catch(e){next(e);} };
exports.quizStatistics=async(req,res,next)=>{try{const[rows]=await pool.execute(`SELECT COUNT(DISTINCT r.user_id) total_participants,COUNT(r.id) completed_attempts,AVG(r.percentage) average_score,MAX(r.percentage) highest_score,MIN(r.percentage) lowest_score,(SUM(r.passed)/NULLIF(COUNT(r.id),0))*100 pass_percentage FROM quiz_results r WHERE r.quiz_id=?`,[req.params.id]);res.json(rows[0]);}catch(e){next(e);} };
exports.globalLeaderboard=async(req,res,next)=>{try{
  const limitValue=req.query.limit??50;
  if(!/^\d+$/.test(String(limitValue)))throw error(400,'limit must be a positive integer');
  const limit=Number(limitValue);
  if(!Number.isSafeInteger(limit)||limit<1||limit>100)throw error(400,'Invalid limit');
  const[rows]=await pool.execute(`SELECT u.id,u.name,r.best_score,r.attempts FROM users u JOIN (SELECT user_id,MAX(obtained_marks) best_score,COUNT(*) attempts FROM quiz_results GROUP BY user_id) r ON r.user_id=u.id WHERE u.role='PARTICIPANT' ORDER BY r.best_score DESC,r.attempts ASC,u.id ASC LIMIT ?`,[limit]);
  res.json(rows.map((r,i)=>({rank:i+1,...r})));
}catch(e){next(e);} };
exports.quizLeaderboard=async(req,res,next)=>{try{
  const limitValue=req.query.limit??50;
  if(!/^\d+$/.test(String(limitValue)))throw error(400,'limit must be a positive integer');
  const limit=Number(limitValue);
  if(!Number.isSafeInteger(limit)||limit<1||limit>100)throw error(400,'Invalid limit');
  const[rows]=await pool.execute(`SELECT u.id,u.name,MAX(r.obtained_marks) best_score,COUNT(r.id) completed_attempts FROM quiz_results r JOIN users u ON u.id=r.user_id WHERE r.quiz_id=? GROUP BY u.id,u.name ORDER BY best_score DESC,completed_attempts ASC,u.id ASC LIMIT ?`,[req.params.id,limit]);
  res.json(rows.map((r,i)=>({rank:i+1,...r})));
}catch(e){next(e);} };
exports.certificateEligibility=async(req,res,next)=>{try{const[rows]=await pool.execute('SELECT attempt_id,user_id,certificate_eligible,percentage,obtained_marks,total_marks FROM quiz_results WHERE id=?',[req.params.id]);if(!rows.length)throw error(404,'Result not found');if(req.user.role!=='ADMIN'&&Number(rows[0].user_id)!==Number(req.user.id))throw error(403,'Access denied');res.json(rows[0]);}catch(e){next(e);} };
