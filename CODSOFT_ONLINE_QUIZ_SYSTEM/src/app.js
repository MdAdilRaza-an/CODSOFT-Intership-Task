const express=require('express');
const helmet=require('helmet');
const cors=require('cors');
const rateLimit=require('express-rate-limit');
const swaggerUi=require('swagger-ui-express');
const authRoutes=require('./routes/authRoutes');
const apiRoutes=require('./routes/apiRoutes');
const errorHandler=require('./middleware/errorHandler');

const app=express();
app.use(helmet());
app.use(cors({origin:process.env.CORS_ORIGIN||'*',methods:['GET','POST','PATCH','DELETE']}));
app.use(express.json({limit:'1mb'}));
app.use('/api',rateLimit({windowMs:Number(process.env.RATE_LIMIT_WINDOW_MS||900000),max:Number(process.env.RATE_LIMIT_MAX||100),standardHeaders:true,legacyHeaders:false}));
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'codsoft-online-quiz-system',timestamp:new Date().toISOString()}));
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1',apiRoutes);

const swagger={
  openapi:'3.0.3',info:{title:'CODSOFT Online Quiz System API',version:'1.0.0'},
  servers:[{url:'http://localhost:3000/api/v1'}],
  components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'}}},
  security:[{bearerAuth:[]}],
  paths:{
    '/auth/register':{post:{summary:'Register participant',requestBody:{required:true},responses:{201:{description:'Registered'}}}},
    '/auth/login':{post:{summary:'Login',responses:{200:{description:'JWT token'}}}},
    '/auth/profile':{get:{security:[{bearerAuth:[]}],responses:{200:{description:'Current user'}}}},
    '/quizzes':{get:{summary:'List published quizzes for participants'},post:{summary:'Create quiz (ADMIN)',responses:{201:{description:'Created'}}}},
    '/quizzes/{id}/attempts':{post:{summary:'Start attempt (PARTICIPANT)',parameters:[{name:'id',in:'path',required:true,schema:{type:'integer'}}],responses:{201:{description:'Attempt started'}}}},
    '/attempts/{id}/submit':{post:{summary:'Submit answers',parameters:[{name:'id',in:'path',required:true,schema:{type:'integer'}}],responses:{200:{description:'Result generated'}}}},
    '/leaderboard':{get:{summary:'Global leaderboard',responses:{200:{description:'Ranked users'}}}}
  }
};
app.use('/docs',swaggerUi.serve,swaggerUi.setup(swagger));
app.use((req,res)=>res.status(404).json({error:'Route not found'}));
app.use(errorHandler);
module.exports=app;
