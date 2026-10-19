import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {REPO_ROOT} from './lib/db.mjs';
const dir=mkdtempSync(path.join(os.tmpdir(),'documentation-demo-'));
const env={...process.env,DATABASE_URL:'',DATA_DIR:path.join(dir,'db'),OUTPUT_DIR:dir};
try{for(const args of [['scripts/migrate.mjs'],['scripts/seed.mjs'],['scripts/documentation.mjs','attention'],['scripts/documentation.mjs','coverage'],['scripts/documentation.mjs','impact','20000000-0000-0000-0000-000000000001'],['scripts/view.mjs'],['scripts/docs.mjs']]){const result=spawnSync(process.execPath,args,{cwd:REPO_ROOT,env,stdio:'inherit'});if(result.status!==0)throw Error('Demo command failed');}console.log('Demo PASS. Temporary fictional records and outputs removed.');}finally{rmSync(dir,{recursive:true,force:true});}
