const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');

function filesUnder(directory){
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const fullPath=path.join(directory,entry.name);
    return entry.isDirectory()?filesUnder(fullPath):entry.name.endsWith('.js')?[fullPath]:[];
  });
}

let failed=false;
for(const file of filesUnder(path.join(__dirname,'..','src'))){
  const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
  if(result.status!==0)failed=true;
}
if(failed)process.exit(1);
