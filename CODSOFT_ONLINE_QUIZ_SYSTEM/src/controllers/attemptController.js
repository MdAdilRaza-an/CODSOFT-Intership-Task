const pool = require('../config/db');
const { shuffle, scoreAttempt } = require('../services/scoringService');

function error(status,message){const e=new Error(message);e.status=status;return e;}
function parseJson(value) { return typeof value === 'string' ? JSON.parse(value) : value; }

exports.start = async (req,res,next) => {
  const c=await pool.getConnection();
  try {
    await c.beginTransaction();
    const [quizRows]=await c.execute('SELECT * FROM quizzes WHERE id=? FOR UPDATE',[req.params.id]);
    if(!quizRows.length) throw error(404,'Quiz not found');
    const quiz=quizRows[0];
    if(!quiz.is_published) throw error(404,'Quiz not published');
    const now=new Date();
    if(quiz.start_at && now < new Date(quiz.start_at)) throw error(400,'Quiz has not started');
    if(quiz.end_at && now > new Date(quiz.end_at)) throw error(400,'Quiz has ended');
    const [attemptRows]=await c.execute('SELECT COUNT(*) count FROM quiz_attempts WHERE user_id=? AND quiz_id=? AND status<>?',[req.user.id,quiz.id,'CANCELLED']);
    if(Number(attemptRows[0].count)>=Number(quiz.max_attempts)) throw error(409,'Maximum attempts reached');
    const [questionRows]=await c.execute('SELECT id FROM questions WHERE quiz_id=? ORDER BY position,id',[quiz.id]);
    let selected=questionRows.map(q=>q.id);
    const count=Number(quiz.random_question_count||0);
    if(count>0 && count<selected.length) selected=shuffle(selected).slice(0,count);
    if(!selected.length) throw error(400,'Quiz has no questions');
    const expires=new Date(now.getTime()+Number(quiz.duration_seconds)*1000);
    const [attempt]=await c.execute('INSERT INTO quiz_attempts (user_id,quiz_id,status,started_at,expires_at,selected_question_ids) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id,quiz.id,'IN_PROGRESS',now,expires,JSON.stringify(selected)]);
    await c.commit();
    const placeholders=selected.map(()=>'?').join(',');
    const [questions]=await pool.execute(`SELECT id,text,marks,position FROM questions WHERE id IN (${placeholders}) ORDER BY FIELD(id,${selected.map(()=>'?').join(',')})`,[...selected,...selected]);
    for(const q of questions){const[options]=await pool.execute('SELECT id,text,position FROM options WHERE question_id=? ORDER BY position,id',[q.id]);q.options=options;}
    res.status(201).json({attempt_id:attempt.insertId,status:'IN_PROGRESS',started_at:now,expires_at:expires,questions});
  }catch(e){await c.rollback();next(e);}finally{c.release();}
};

exports.getAttempt=async(req,res,next)=>{try{const[rows]=await pool.execute('SELECT * FROM quiz_attempts WHERE id=?',[req.params.id]);if(!rows.length)throw error(404,'Attempt not found');if(req.user.role!=='ADMIN'&&Number(rows[0].user_id)!==Number(req.user.id))throw error(403,'Access denied');res.json(rows[0]);}catch(e){next(e);} };

exports.getQuestions=async(req,res,next)=>{
  try{
    const[attempts]=await pool.execute('SELECT * FROM quiz_attempts WHERE id=?',[req.params.id]);if(!attempts.length)throw error(404,'Attempt not found');
    const a=attempts[0];if(req.user.role!=='ADMIN'&&Number(a.user_id)!==Number(req.user.id))throw error(403,'Access denied');
    if(new Date(a.expires_at)<=new Date()&&a.status==='IN_PROGRESS')throw error(410,'Attempt has expired');
    const ids=parseJson(a.selected_question_ids);if(!ids.length)return res.json([]);
    const placeholders=ids.map(()=>'?').join(',');
    const[questions]=await pool.execute(`SELECT id,text,marks,position FROM questions WHERE id IN (${placeholders}) ORDER BY FIELD(id,${ids.map(()=>'?').join(',')})`,[...ids,...ids]);
    for(const q of questions){const[options]=await pool.execute('SELECT id,text,position FROM options WHERE question_id=? ORDER BY position,id',[q.id]);q.options=options;}
    res.json(questions);
  }catch(e){next(e);}
};

async function finalizeAttempt(c,attemptId,userId,quizId,expired=false){
  await c.execute('SELECT id FROM quiz_attempts WHERE id=? FOR UPDATE',[attemptId]);
  const[attempts]=await c.execute('SELECT * FROM quiz_attempts WHERE id=?',[attemptId]);
  const a=attempts[0];
  if(a.status==='COMPLETED'||a.status==='EXPIRED') return null;
  const[quizzes]=await c.execute('SELECT * FROM quizzes WHERE id=?',[quizId]);
  const quiz=quizzes[0];
  const ids=parseJson(a.selected_question_ids);
  const placeholders=ids.map(()=>'?').join(',');
  const[questions]=await c.execute(`SELECT id,text,marks,position FROM questions WHERE id IN (${placeholders})`,ids.length?[...ids]:[]);
  for(const q of questions){const[options]=await c.execute('SELECT id,text,is_correct,position FROM options WHERE question_id=?',[q.id]);q.options=options;}
  const[answers]=await c.execute('SELECT question_id,option_id FROM submitted_answers WHERE attempt_id=?',[attemptId]);
  const result=scoreAttempt({questions,answers,quiz});
  const completionSeconds=Math.max(0,Math.floor(((expired?new Date(a.expires_at):new Date())-new Date(a.started_at))/1000));
  await c.execute(`INSERT INTO quiz_results (attempt_id,user_id,quiz_id,total_marks,obtained_marks,percentage,passed,certificate_eligible,completion_seconds)
    VALUES (?,?,?,?,?,?,?,?,?)`,[attemptId,userId,quizId,result.totalMarks,result.obtainedMarks,result.percentage,result.passed?1:0,result.certificateEligible?1:0,completionSeconds]);
  await c.execute('UPDATE quiz_attempts SET status=?,submitted_at=? WHERE id=?',[expired?'EXPIRED':'COMPLETED',new Date(),attemptId]);
  return result;
}

exports.submit=async(req,res,next)=>{
  const c=await pool.getConnection();
  try{
    await c.beginTransaction();
    const[attempts]=await c.execute('SELECT * FROM quiz_attempts WHERE id=? FOR UPDATE',[req.params.id]);if(!attempts.length)throw error(404,'Attempt not found');
    const a=attempts[0];if(req.user.role!=='ADMIN'&&Number(a.user_id)!==Number(req.user.id))throw error(403,'Access denied');
    if(a.status==='COMPLETED'||a.status==='EXPIRED')throw error(409,'Attempt has already been finalized');
    if(new Date(a.expires_at)<=new Date()){await finalizeAttempt(c,a.id,a.user_id,a.quiz_id,true);await c.commit();throw error(410,'Attempt has expired');}
    const submitted=req.body.answers||[];
    const selected=parseJson(a.selected_question_ids).map(String);const seen=new Set();
    for(const answer of submitted){
      const q=String(answer.question_id),o=String(answer.option_id);
      if(seen.has(q))throw error(400,'Duplicate answer for a question');
      if(!selected.includes(q))throw error(400,'Question does not belong to this attempt');
      seen.add(q);
      const[options]=await c.execute('SELECT id FROM options WHERE id=? AND question_id=?',[answer.option_id,answer.question_id]);
      if(!options.length)throw error(400,'Invalid option for the question');
    }
    await c.execute('DELETE FROM submitted_answers WHERE attempt_id=?',[a.id]);
    for(const answer of submitted)await c.execute('INSERT INTO submitted_answers (attempt_id,question_id,option_id) VALUES (?,?,?)',[a.id,answer.question_id,answer.option_id]);
    const result=await finalizeAttempt(c,a.id,a.user_id,a.quiz_id,false);
    await c.commit();
    res.json({attempt_id:a.id,status:'COMPLETED',result});
  }catch(e){await c.rollback();next(e);}finally{c.release();}
};
