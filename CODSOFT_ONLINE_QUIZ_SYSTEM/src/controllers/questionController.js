const pool = require('../config/db');
function error(status,message){const e=new Error(message);e.status=status;return e;}

exports.addQuestion = async (req,res,next) => {
  const c=await pool.getConnection();
  try {
    await c.beginTransaction();
    const [quizRows]=await c.execute('SELECT id FROM quizzes WHERE id=? FOR UPDATE',[req.params.id]);
    if(!quizRows.length) throw error(404,'Quiz not found');
    const marks=req.body.marks ?? 1;
    const position=req.body.position ?? 0;
    const [result]=await c.execute(
      'INSERT INTO questions (quiz_id,text,marks,position) VALUES (?,?,?,?)',
      [req.params.id,req.body.text,marks,position]
    );
    await c.commit();
    res.status(201).json({id:result.insertId,quiz_id:Number(req.params.id),text:req.body.text,marks,position});
  }catch(e){await c.rollback();next(e);}finally{c.release();}
};

exports.listQuestions = async (req,res,next) => {
  try {
    const [quizRows]=await pool.execute('SELECT is_published FROM quizzes WHERE id=?',[req.params.id]);
    if(!quizRows.length) throw error(404,'Quiz not found');
    if(!quizRows[0].is_published && req.user?.role !== 'ADMIN') throw error(404,'Quiz not found');
    const [questions]=await pool.execute(
      'SELECT id, quiz_id, text, marks, position FROM questions WHERE quiz_id=? ORDER BY position,id',
      [req.params.id]
    );
    const isAdmin=req.user?.role==='ADMIN';
    for(const question of questions) {
      const [options]=await pool.execute(
        isAdmin
          ? 'SELECT id, text, is_correct, position FROM options WHERE question_id=? ORDER BY position,id'
          : 'SELECT id, text, position FROM options WHERE question_id=? ORDER BY position,id',
        [question.id]
      );
      question.options=options;
    }
    res.json(questions);
  }catch(e){next(e);}
};

exports.updateQuestion=async(req,res,next)=>{
  try {
    const keys=['text','marks','position'].filter(key=>Object.prototype.hasOwnProperty.call(req.body,key));
    if(!keys.length) throw error(400,'No valid fields supplied');
    const [result]=await pool.execute(
      `UPDATE questions SET ${keys.map(key=>`${key}=?`).join(',')} WHERE id=?`,
      [...keys.map(key=>req.body[key]),req.params.id]
    );
    if(!result.affectedRows) throw error(404,'Question not found');
    const [rows]=await pool.execute('SELECT id,quiz_id,text,marks,position FROM questions WHERE id=?',[req.params.id]);
    res.json(rows[0]);
  }catch(e){next(e);}
};

exports.deleteQuestion=async(req,res,next)=>{
  try {
    const [result]=await pool.execute('DELETE FROM questions WHERE id=?',[req.params.id]);
    if(!result.affectedRows) throw error(404,'Question not found');
    res.status(204).send();
  }catch(e){
    if(e.code==='ER_ROW_IS_REFERENCED_2') return next(error(409,'Question cannot be deleted while attempts reference it'));
    next(e);
  }
};

exports.addOption=async(req,res,next)=>{
  try {
    const [questionRows]=await pool.execute('SELECT id FROM questions WHERE id=?',[req.params.id]);
    if(!questionRows.length) throw error(404,'Question not found');
    const isCorrect=req.body.is_correct===true || req.body.is_correct===1 || req.body.is_correct==='true';
    const position=req.body.position ?? 0;
    const [result]=await pool.execute(
      'INSERT INTO options (question_id,text,is_correct,position) VALUES (?,?,?,?)',
      [req.params.id,req.body.text,isCorrect?1:0,position]
    );
    res.status(201).json({id:result.insertId,question_id:Number(req.params.id),text:req.body.text,is_correct:isCorrect,position});
  }catch(e){next(e);}
};

exports.updateOption=async(req,res,next)=>{
  try {
    const keys=['text','is_correct','position'].filter(key=>Object.prototype.hasOwnProperty.call(req.body,key));
    if(!keys.length) throw error(400,'No valid fields supplied');
    const values=keys.map(key=>key==='is_correct'
      ? (req.body[key]===true || req.body[key]===1 || req.body[key]==='true'?1:0)
      : req.body[key]);
    const [result]=await pool.execute(
      `UPDATE options SET ${keys.map(key=>`${key}=?`).join(',')} WHERE id=?`,
      [...values,req.params.id]
    );
    if(!result.affectedRows) throw error(404,'Option not found');
    const [rows]=await pool.execute('SELECT id,question_id,text,is_correct,position FROM options WHERE id=?',[req.params.id]);
    res.json(rows[0]);
  }catch(e){next(e);}
};

exports.deleteOption=async(req,res,next)=>{
  try {
    const [result]=await pool.execute('DELETE FROM options WHERE id=?',[req.params.id]);
    if(!result.affectedRows) throw error(404,'Option not found');
    res.status(204).send();
  }catch(e){
    if(e.code==='ER_ROW_IS_REFERENCED_2') return next(error(409,'Option cannot be deleted while attempts reference it'));
    next(e);
  }
};
