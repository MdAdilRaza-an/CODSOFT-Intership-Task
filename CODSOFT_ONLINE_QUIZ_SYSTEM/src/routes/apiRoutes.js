const express=require('express');
const {body}=require('express-validator');
const validate=require('../middleware/validate');
const {authenticate,authorize}=require('../middleware/auth');
const quiz=require('../controllers/quizController');
const question=require('../controllers/questionController');
const attempt=require('../controllers/attemptController');
const result=require('../controllers/resultController');
const optionalAuth=(req,res,next)=>{if(req.headers.authorization)return authenticate(req,res,next);next();};
const router=express.Router();

router.post('/quizzes',authenticate,authorize('ADMIN'),[
 body('title').trim().isLength({min:3,max:180}),body('duration_seconds').optional().isInt({min:1}),body('total_marks').optional().isFloat({min:0}),body('passing_marks').optional().isFloat({min:0}),body('negative_marks').optional().isFloat({min:0}),body('max_attempts').optional().isInt({min:1}),body('random_question_count').optional().isInt({min:0}),body('certificate_threshold').optional().isFloat({min:0,max:100})
 ,body('allow_negative_score').optional().isBoolean()
],validate,quiz.create);
router.get('/quizzes',optionalAuth,quiz.list);
router.get('/quizzes/:id',optionalAuth,quiz.get);
router.patch('/quizzes/:id',authenticate,authorize('ADMIN'),[
 body('title').optional().trim().isLength({min:3,max:180}),
 body('duration_seconds').optional().isInt({min:1}),
 body('total_marks').optional().isFloat({min:0}),
 body('passing_marks').optional().isFloat({min:0}),
 body('negative_marks').optional().isFloat({min:0}),
 body('allow_negative_score').optional().isBoolean(),
 body('max_attempts').optional().isInt({min:1}),
 body('random_question_count').optional().isInt({min:0}),
 body('certificate_threshold').optional().isFloat({min:0,max:100})
],validate,quiz.update);
router.delete('/quizzes/:id',authenticate,authorize('ADMIN'),quiz.remove);
router.patch('/quizzes/:id/publish',authenticate,authorize('ADMIN'),[body('published').isBoolean()],validate,quiz.setPublished);
router.post('/quizzes/:id/questions',authenticate,authorize('ADMIN'),[body('text').trim().isLength({min:1}),body('marks').optional().isFloat({min:0}),body('position').optional().isInt({min:0})],validate,question.addQuestion);
router.get('/quizzes/:id/questions',optionalAuth,question.listQuestions);
router.patch('/questions/:id',authenticate,authorize('ADMIN'),[
 body('text').optional().trim().isLength({min:1}),
 body('marks').optional().isFloat({min:0}),
 body('position').optional().isInt({min:0})
],validate,question.updateQuestion);
router.delete('/questions/:id',authenticate,authorize('ADMIN'),question.deleteQuestion);
router.post('/questions/:id/options',authenticate,authorize('ADMIN'),[
 body('text').trim().isLength({min:1}),
 body('is_correct').optional().isBoolean(),
 body('position').optional().isInt({min:0})
],validate,question.addOption);
router.patch('/options/:id',authenticate,authorize('ADMIN'),[
 body('text').optional().trim().isLength({min:1}),
 body('is_correct').optional().isBoolean(),
 body('position').optional().isInt({min:0})
],validate,question.updateOption);
router.delete('/options/:id',authenticate,authorize('ADMIN'),question.deleteOption);
router.post('/quizzes/:id/attempts',authenticate,authorize('PARTICIPANT','ADMIN'),attempt.start);
router.get('/attempts/:id',authenticate,attempt.getAttempt);
router.get('/attempts/:id/questions',authenticate,attempt.getQuestions);
router.post('/attempts/:id/submit',authenticate,authorize('PARTICIPANT','ADMIN'),[
 body('answers').isArray(),
 body('answers.*.question_id').isInt({min:1}),
 body('answers.*.option_id').isInt({min:1})
],validate,attempt.submit);
router.get('/results/:id',authenticate,result.getResult);
router.get('/users/me/results',authenticate,result.myResults);
router.get('/users/me/statistics',authenticate,result.myStatistics);
router.get('/quizzes/:id/statistics',authenticate,authorize('ADMIN'),result.quizStatistics);
router.get('/leaderboard',optionalAuth,result.globalLeaderboard);
router.get('/quizzes/:id/leaderboard',optionalAuth,result.quizLeaderboard);
router.get('/results/:id/certificate-eligibility',authenticate,result.certificateEligibility);
module.exports=router;
