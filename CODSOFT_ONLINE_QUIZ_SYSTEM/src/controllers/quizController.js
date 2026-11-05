const pool = require('../config/db');

function error(status, message) { const e = new Error(message); e.status = status; return e; }

exports.create = async (req, res, next) => {
  try {
    const b = req.body;
    const allowNegativeScore=b.allow_negative_score===true || b.allow_negative_score===1 || b.allow_negative_score==='true';
    const [r] = await pool.execute(`INSERT INTO quizzes
      (title,description,category,duration_seconds,total_marks,passing_marks,negative_marks,allow_negative_score,max_attempts,random_question_count,certificate_threshold,start_at,end_at,is_published,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [b.title,b.description||null,b.category||null,b.duration_seconds||600,b.total_marks||0,b.passing_marks||0,b.negative_marks||0,allowNegativeScore?1:0,b.max_attempts||1,b.random_question_count||0,b.certificate_threshold||80,b.start_at||null,b.end_at||null,false,req.user.id]);
    res.status(201).json({ id: r.insertId, ...b, is_published:false });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const pageValue = req.query.page ?? 1;
    const limitValue = req.query.limit ?? 10;
    if (!/^\d+$/.test(String(pageValue)) || !/^\d+$/.test(String(limitValue))) throw error(400, 'page and limit must be positive integers');
    const page = Number(pageValue);
    const limit = Number(limitValue);
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw error(400, 'Invalid pagination');
    const offset = (page-1)*limit;
    const participant = req.user?.role !== 'ADMIN';
    const category = typeof req.query.category === 'string' && req.query.category.trim() ? req.query.category.trim() : null;
    let sql = 'SELECT id,title,description,category,duration_seconds,total_marks,passing_marks,max_attempts,random_question_count,certificate_threshold,start_at,end_at,is_published,created_at FROM quizzes';
    const params=[]; const conditions=[];
    if (participant) conditions.push('is_published = TRUE');
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (conditions.length) sql += ' WHERE '+conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit,offset);
    const [rows] = await pool.execute(sql,params);
    const countParams=[];
    const countConditions=[];
    if (participant) countConditions.push('is_published = TRUE');
    if (category) { countConditions.push('category = ?'); countParams.push(category); }
    let countSql='SELECT COUNT(*) AS count FROM quizzes';
    if (countConditions.length) countSql += ' WHERE '+countConditions.join(' AND ');
    const [countRows] = await pool.execute(countSql,countParams);
    res.json({ items:rows, pagination:{page,limit,total:Number(countRows[0].count)} });
  } catch (e) { next(e); }
};

exports.get = async (req,res,next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM quizzes WHERE id=?',[req.params.id]);
    if (!rows.length) throw error(404,'Quiz not found');
    if (!rows[0].is_published && req.user?.role !== 'ADMIN') throw error(404,'Quiz not found');
    res.json(rows[0]);
  } catch(e){next(e);}
};

exports.update = async (req,res,next) => {
  try {
    const allowed=['title','description','category','duration_seconds','total_marks','passing_marks','negative_marks','allow_negative_score','max_attempts','random_question_count','certificate_threshold','start_at','end_at'];
    const keys=allowed.filter(k=>Object.prototype.hasOwnProperty.call(req.body,k));
    if (!keys.length) throw error(400,'No valid fields supplied');
    const [existing]=await pool.execute('SELECT id FROM quizzes WHERE id=?',[req.params.id]);
    if(!existing.length) throw error(404,'Quiz not found');
    const sql=`UPDATE quizzes SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=?`;
    const values=keys.map(k=>k==='allow_negative_score'
      ? (req.body[k]===true || req.body[k]===1 || req.body[k]==='true'?1:0)
      : req.body[k]);
    await pool.execute(sql,[...values,req.params.id]);
    return exports.get(req,res,next);
  } catch(e){next(e);}
};

exports.remove = async (req,res,next) => {
  try {
    const [r]=await pool.execute('DELETE FROM quizzes WHERE id=?',[req.params.id]);
    if (!r.affectedRows) throw error(404,'Quiz not found');
    res.status(204).send();
  } catch(e){
    if(e.code==='ER_ROW_IS_REFERENCED_2') return next(error(409,'Quiz cannot be deleted while attempts or results reference it'));
    next(e);
  }
};

exports.setPublished = async (req,res,next) => {
  try {
    const value=req.body.published;
    const published=value===true || value==='true' || value===1 || value==='1';
    if (!published && value!==false && value!== 'false' && value!==0 && value!=='0') throw error(400,'Invalid published value');
    const [existing]=await pool.execute('SELECT id FROM quizzes WHERE id=?',[req.params.id]);
    if(!existing.length) throw error(404,'Quiz not found');
    await pool.execute('UPDATE quizzes SET is_published=? WHERE id=?',[published,req.params.id]);
    res.json({ id:Number(req.params.id), is_published:published });
  } catch(e){next(e);}
};
