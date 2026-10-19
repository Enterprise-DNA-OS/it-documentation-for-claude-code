#!/usr/bin/env node
import {getDb} from './lib/db.mjs';
import {run} from './lib/domain.mjs';
import {table} from './lib/format.mjs';
const args=process.argv.slice(2),json=args.includes('--json');
function show(value){if(Array.isArray(value)){if(value.length&&value[0].question)return value.map(x=>x.question+'\n'+show(x.rows)).join('\n\n');if(!value.length)return '  (none)';if(value.some(x=>Object.values(x).some(v=>v&&typeof v==='object')))return JSON.stringify(value,null,2);return table(value,Object.keys(value[0]).map(key=>({key,label:key.replaceAll('_',' ')})));}return JSON.stringify(value,null,2);}
let db;try{db=await getDb();const out=await run(db,args);console.log(json?JSON.stringify(out,null,2):show(out));}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}
