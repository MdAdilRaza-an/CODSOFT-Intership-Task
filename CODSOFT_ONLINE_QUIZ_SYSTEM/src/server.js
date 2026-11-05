require('dotenv').config();
const {validateEnvironment}=require('./config/env');
const {expireAttempts}=require('./jobs/expireAttempts');

try{validateEnvironment();}catch(error){console.error(error.message);process.exit(1);}
const app=require('./app');
const port=Number(process.env.PORT||3000);
const server=app.listen(port,()=>console.log(`Online Quiz System listening on port ${port}`));
const expiryTimer=setInterval(()=>{expireAttempts().catch(error=>console.error('Attempt expiry job failed:',error.message));},30000);
expiryTimer.unref();
server.on('SIGTERM',()=>server.close(()=>process.exit(0)));
