const pool=require('../config/db');
const {scoreAttempt}=require('../services/scoringService');
function parseJson(v){return typeof v==='string'?JSON.parse(v):v;}

async function expireAttempts(){
  const connection=await pool.getConnection();
  try{
    await connection.beginTransaction();
    const[attempts]=await connection.execute("SELECT * FROM quiz_attempts WHERE status='IN_PROGRESS' AND expires_at<=NOW() FOR UPDATE");
    for(const a of attempts){
      const existing=await connection.execute('SELECT id FROM quiz_results WHERE attempt_id=?',[a.id]);
      if(existing[0].length){
        await connection.execute("UPDATE quiz_attempts SET status='EXPIRED',submitted_at=? WHERE id=?",[new Date(),a.id]);
        continue;
      }
      const[quizRows]=await connection.execute('SELECT * FROM quizzes WHERE id=?',[a.quiz_id]);const quiz=quizRows[0];
      const ids=parseJson(a.selected_question_ids);if(!ids.length)continue;
      const placeholders=ids.map(()=>'?').join(',');
      const[questions]=await connection.execute(`SELECT id,text,marks,position FROM questions WHERE id IN (${placeholders})`,ids);
      for(const q of questions){const[options]=await connection.execute('SELECT id,text,is_correct FROM options WHERE question_id=?',[q.id]);q.options=options;}
      const[answers]=await connection.execute('SELECT question_id,option_id FROM submitted_answers WHERE attempt_id=?',[a.id]);
      const result=scoreAttempt({questions,answers,quiz});
      const seconds=Math.max(0,Math.floor((new Date(a.expires_at)-new Date(a.started_at))/1000));
      await connection.execute(`INSERT INTO quiz_results (attempt_id,user_id,quiz_id,total_marks,obtained_marks,percentage,passed,certificate_eligible,completion_seconds) VALUES (?,?,?,?,?,?,?,?,?)`,
        [a.id,a.user_id,a.quiz_id,result.totalMarks,result.obtainedMarks,result.percentage,result.passed?1:0,result.certificateEligible?1:0,seconds]);
      await connection.execute("UPDATE quiz_attempts SET status='EXPIRED',submitted_at=? WHERE id=?",[new Date(),a.id]);
    }
    await connection.commit();return attempts.length;
  }catch(e){await connection.rollback();throw e;}finally{connection.release();}
}
module.exports={expireAttempts};
