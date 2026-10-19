import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {parseCsv} from './csv.mjs';
import {REPO_ROOT} from './db.mjs';
export const READS={
 assets:"select id,name,kind,site,owner,criticality,state from assets order by site,name",
 sites:"select site,count(*)::int as assets,count(*) filter(where criticality='high')::int as critical_assets from assets where state='active' group by site order by site",
 runbooks:'select name,owner,version,state,reviewer,due_on,coalesce(current_review,false) as current_review from runbook_status order by name',
 'review-queue':"select name,owner,version,state,due_on from runbook_status where state<>'archived' and not coalesce(current_review,false) order by due_on nulls first,name",
 renewals:"select name,site,owner,warranty_on,renewal_on from assets where state='active' and (warranty_on<=current_date+60 or renewal_on<=current_date+60) order by coalesce(renewal_on,warranty_on),name",
 coverage:"select name,site,owner,criticality,runbooks,current_runbooks from asset_coverage where state='active' order by current_runbooks,name,site",
 dependencies:'select a.name as asset,a.site,p.name as depends_on,p.site as dependency_site,d.reason from dependencies d join assets a on a.id=d.asset_id join assets p on p.id=d.depends_on order by a.name,p.name',
 attention:"select i.name,coalesce(a.site,ta.site,'') as site,i.owner,i.issue,i.due_on from attention_items i left join assets a on i.record_type='asset' and a.id=i.id left join tasks t on i.record_type='task' and t.id=i.id left join assets ta on ta.id=t.asset_id order by i.due_on,i.name,site,i.issue",
 compliance:'select name,rule,issue,source from compliance_items order by rule,name',
 checks:'select a.name,a.site,c.kind,c.result,c.performed_on,c.due_on,c.evidence,c.operator from latest_checks c join assets a on a.id=c.asset_id order by c.performed_on,a.name',
 tasks:'select id,name,owner,due_on,state,evidence from tasks order by due_on,name',
 history:'select relation,record_id,operation,actor,created_at from audit order by created_at,id'
};
export const QUESTIONS=[
 ['Which critical assets have no current runbook?',"select name,site,owner from asset_coverage where state='active' and criticality='high' and current_runbooks=0 order by site,name"],
 ['Which renewals have no accountable owner?',"select name,site,renewal_on from assets where state='active' and renewal_on<=current_date+60 and nullif(trim(owner),'') is null order by renewal_on"],
 ['Which expired warranties protect high-criticality equipment?',"select name,site,warranty_on from assets where state='active' and criticality='high' and warranty_on<current_date order by warranty_on"],
 ['Which reviewed runbooks have become stale?',"select name,owner,due_on from runbook_status where state='reviewed' and not coalesce(current_review,false) order by name"],
 ['Which sites carry the most uncovered critical assets?',"select site,count(*)::int as uncovered from asset_coverage where state='active' and criticality='high' and current_runbooks=0 group by site order by uncovered desc,site"],
 ['Which failed checks have no open follow-up task?',"select a.name,c.kind,c.evidence from latest_checks c join assets a on a.id=c.asset_id where a.state='active' and c.result='fail' and not exists(select 1 from tasks t where t.asset_id=a.id and t.state='open') order by a.name"],
 ['Which runbooks containing personal information need a retention review?',"select name,owner,retention_review_on from runbooks where contains_personal and (retention_review_on is null or retention_review_on<current_date) order by name"],
 ['Which active assets rely directly on archived equipment?',"select a.name,p.name as archived_dependency from dependencies d join assets a on a.id=d.asset_id join assets p on p.id=d.depends_on where a.state='active' and p.state='archived' order by a.name"],
 ['Which people own overdue documentation work?',"select coalesce(owner,'Unassigned') as owner,count(*)::int as issues from attention_items where due_on<=current_date group by owner order by issues desc,owner"],
 ['Which imported assets still need classification?',"select name,site,source_id from assets where source_id is not null and state='active' and (criticality='unknown' or owner is null) order by name"]
];
const tables=['workspace','assets','runbooks','reviews','runbook_assets','dependencies','checks','tasks','notes','audit'];
function parse(args){const pos=[],f={};for(const a of args){if(!a.startsWith('--'))pos.push(a);else{const at=a.indexOf('=');const k=at<0?a.slice(2):a.slice(2,at);if(k in f)throw Error(`Repeated flag: ${k}`);f[k]=at<0?true:a.slice(at+1);}}return{pos,f};}
function needed(x,label){if(typeof x!=='string'||!x.trim())throw Error(`${label} required`);return x.trim();}
function date(x,label){needed(x,label);if(!/^\d{4}-\d{2}-\d{2}$/.test(x)||new Date(x+'T00:00:00Z').toISOString().slice(0,10)!==x)throw Error(`${label}: use a real YYYY-MM-DD date`);return x;}
const today=()=>new Date().toISOString().slice(0,10);
function past(x,label){date(x,label);if(x>today())throw Error(`${label} cannot be in the future`);return x;}
function choice(x,values,label){if(!values.includes(x))throw Error(`${label}: choose ${values.join('|')}`);return x;}
function safeText(x){needed(x,'text');if(/-----BEGIN .*PRIVATE KEY-----|\b(?:password|api[_ -]?key|secret|access[_ -]?token)\s*[:=]\s*\S+/i.test(x))throw Error('Credential-like content refused; use a separate vault');return x;}
async function resolve(db,t,term){needed(term,'record');if(!['assets','runbooks','tasks'].includes(t))throw Error('Unknown record type');let rows=await db.query(`select * from ${t} where id::text=$1 or lower(name)=lower($1) order by name,id`,[term]);if(!rows.length)rows=await db.query(`select * from ${t} where starts_with(id::text,$1) or strpos(lower(name),lower($1))>0 order by name,id`,[term]);if(rows.length!==1)throw Error(`${rows.length?'Ambiguous':'Not found'}: ${term}\n${rows.map(x=>`${x.id} | ${x.name}${x.site?' | '+x.site:''}`).join('\n')}`);return rows[0];}
async function impact(db,id){return db.query(`with recursive impacted(id) as (select asset_id from dependencies where depends_on=$1 union select d.asset_id from dependencies d join impacted i on d.depends_on=i.id) select a.id,a.name,a.site,a.owner,a.state from impacted i join assets a on a.id=i.id order by a.site,a.name`,[id]);}
async function transaction(db,actor,fn){await db.exec('BEGIN');try{await db.query("select set_config('app.actor',$1,true)",[needed(actor,'actor')]);const out=await fn();await db.exec('COMMIT');return out;}catch(e){await db.exec('ROLLBACK');throw e;}}
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const norm=x=>x.toLowerCase().replace(/[^a-z0-9]/g,'');
const defaultMap={source_id:['id','configurationid'],name:['name','configurationname'],kind:['configurationtype','type'],site:['location','locationname'],organisation:['organization','organisation','organizationname'],state:['configurationstatus','status'],manufacturer:['manufacturer'],model:['model'],serial_number:['serialnumber'],warranty_on:['warrantyexpires','warrantyexpirationdate']};
async function importCsv(db,file,f){
 const workspace=(await db.query('select * from workspace'))[0];if(!workspace)throw Error('Run init first with the exact IT Glue organisation name');
 if(/password|secret|credential/i.test(path.basename(needed(file,'CSV file'))))throw Error('Credential exports are not accepted');
 const text=readFileSync(file,'utf8');if(text.length>20_000_000)throw Error('Import exceeds 20 MB; split by organisation');
 const rows=parseCsv(text);if(!rows.length)throw Error('CSV contains no records');
 const headers=Object.keys(rows[0]);if(headers.some(h=>/password|secret|token|private.?key/i.test(h)))throw Error('Credential columns refused before import');
 const map=f.map?JSON.parse(readFileSync(f.map,'utf8')):{};
 for(const [key,value] of Object.entries(map)){if(!(key in defaultMap)||typeof value!=='string'||!headers.includes(value))throw Error(`Invalid column mapping: ${key}`);}
 const columns={};for(const [key,aliases]of Object.entries(defaultMap)){const found=map[key]?[map[key]]:headers.filter(h=>aliases.includes(norm(h)));if(found.length>1)throw Error(`Ambiguous CSV columns for ${key}; supply --map`);columns[key]=found[0];}
 for(const key of ['source_id','name','organisation'])if(!columns[key])throw Error(`Missing CSV column: ${key}; use --map for your export headings`);
 const seen=new Set(),prepared=[];for(const [i,row]of rows.entries()){
 const get=k=>columns[k]?row[columns[k]].trim():'';
 if(get('organisation').toLowerCase()!==workspace.source_org.toLowerCase())throw Error(`Row ${i+2}: organisation does not match this database`);
 const id=needed(get('source_id'),`Row ${i+2} ID`);if(seen.has(id))throw Error(`Duplicate source ID: ${id}`);seen.add(id);
 const status=get('state').toLowerCase();if(status&&!['active','inactive','archived'].includes(status))throw Error(`Row ${i+2}: unknown status; map it explicitly before import`);
 const value={source_id:id,name:safeText(needed(get('name'),'Name')),kind:get('kind')||'Unknown',site:get('site')||'Unassigned',state:['inactive','archived'].includes(status)?'archived':'active',manufacturer:get('manufacturer')||null,model:get('model')||null,serial_number:get('serial_number')||null,warranty_on:get('warranty_on')?date(get('warranty_on'),'Warranty Expires'):null};
 value.source_hash=hash(value);prepared.push(value);
 }
 // Validate conflicts and apply within one transaction, including audit. A dry run rolls back.
 return transaction(db,f.actor,async()=>{let imported=0,skipped=0;
 for(const row of prepared){const existing=(await db.query('select source_hash from assets where source_id=$1',[row.source_id]))[0];if(existing){if(existing.source_hash!==row.source_hash)throw Error(`Conflicting source ID: ${row.source_id}; reconcile changes before importing`);skipped++;continue;}
 const ks=Object.keys(row);await db.query(`insert into assets(${ks.join(',')}) values(${ks.map((_,i)=>'$'+(i+1)).join(',')})`,Object.values(row));imported++;}
 if(f['dry-run']){await db.exec('ROLLBACK');await db.exec('BEGIN');}
 return{imported,skipped,dry_run:!!f['dry-run'],scope:workspace.source_org,ignored_columns:headers.filter(h=>!Object.values(columns).includes(h))};});
}
export const MUTATIONS=['init','add-asset','update-asset','archive-asset','add-runbook','revise-runbook','review-runbook','link-runbook','depend','log-check','add-task','complete-task','log','record-controls','retention-review'];
export async function run(db,args){const {pos,f}=parse(args);const [cmd,a,b]=pos;
 const flags={init:['source-org'], 'add-asset':['kind','site','owner','criticality'], 'update-asset':['owner','site','criticality','warranty','renewal'], 'add-runbook':['owner','purpose','file','personal','retention-review'], 'revise-runbook':['file'], 'review-runbook':['version','reviewer','date','due','evidence'],depend:['reason'],'log-check':['kind','result','date','due','evidence'],'add-task':['owner','due','asset'],'complete-task':['evidence'],'record-controls':['kind','date','evidence'],'retention-review':['due','evidence'],import:['map','dry-run'],export:['out']};
 const allowed=new Set(['json','help',...(MUTATIONS.includes(cmd)||cmd==='import'?['actor']:[]),...(flags[cmd]||[])]);
 for(const [key,value]of Object.entries(f)){if(!allowed.has(key))throw Error(`Unknown flag: --${key}`);if(['json','help','personal','dry-run'].includes(key)&&value!==true)throw Error(`--${key} is a switch without a value`);}
 if(cmd==='help'||!cmd||f.help)return{reads:Object.keys(READS),detail:['asset','runbook','impact','search','insights'],writes:MUTATIONS,files:['import it-glue <csv>','export','draft-handover','draft-weekly-review']};
 if(READS[cmd])return db.query(READS[cmd]);
 if(cmd==='asset'){const asset=await resolve(db,'assets',a);return{asset,runbooks:await db.query('select b.* from runbook_status b join runbook_assets l on l.runbook_id=b.id where l.asset_id=$1 order by b.name',[asset.id]),notes:await db.query('select body,actor,created_at from notes where asset_id=$1 order by created_at,id',[asset.id]),impact:await impact(db,asset.id)};}
 if(cmd==='runbook'){const book=await resolve(db,'runbooks',a);return{runbook:book,reviews:await db.query('select * from reviews where runbook_id=$1 order by created_at,id',[book.id])};}
 if(cmd==='impact')return impact(db,(await resolve(db,'assets',a)).id);
 if(cmd==='search'){needed(a,'search text');return db.query("select 'asset' as type,name,site as detail from assets where strpos(lower(name||' '||kind||' '||site),lower($1))>0 union all select 'runbook',name,purpose from runbooks where strpos(lower(name||' '||purpose||' '||steps),lower($1))>0 order by type,name",[a]);}
 if(cmd==='insights'){const out=[];for(const [question,sql]of QUESTIONS)out.push({question,rows:await db.query(sql)});return out;}
 if(cmd==='import'){if(a!=='it-glue')throw Error('Supported import: it-glue');return importCsv(db,b,f);}
 if(cmd==='export'){const records={};await db.exec('BEGIN READ ONLY');try{for(const t of tables)records[t]=await db.query(`select * from ${t} order by id`);}finally{await db.exec('ROLLBACK');}const result={format:'it-documentation/v1',exported_at:new Date().toISOString(),records};if(f.out){writeFileSync(f.out,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});return{file:path.resolve(f.out),tables:tables.length};}return result;}
 if(['draft-handover','draft-weekly-review'].includes(cmd)){
 const records=cmd==='draft-handover'?await run(db,['asset',a]):{attention:await run(db,['attention']),coverage:await run(db,['coverage']),reviews:await run(db,['review-queue'])};
 const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,`${cmd}-${randomUUID()}.md`);writeFileSync(file,`# ${cmd==='draft-handover'?'IT handover draft':'Weekly documentation review'}\n\nFor operator review. No message has been sent.\n\n`+'```json\n'+JSON.stringify(records,null,2)+'\n```\n',{mode:0o600,flag:'wx'});return{file,sent:false};}
 if(!MUTATIONS.includes(cmd))throw Error(`Unknown command: ${cmd}`);
 return transaction(db,f.actor,async()=>{
 const required=k=>needed(f[k],k);
 const activeAsset=async term=>{const x=await resolve(db,'assets',term);if(x.state==='archived')throw Error('Asset is archived');return x;};
 if(cmd==='init'){if((await db.query('select * from workspace')).length)throw Error('Workspace already initialised');return(await db.query('insert into workspace(name,source_org) values($1,$2) returning *',[needed(a,'business name'),required('source-org')]))[0];}
 if(!(await db.query('select * from workspace')).length)throw Error('Run init before recording work');
 if(cmd==='add-asset')return(await db.query('insert into assets(name,kind,site,owner,criticality) values($1,$2,$3,$4,$5) returning *',[safeText(needed(a,'asset name')),required('kind'),required('site'),required('owner'),choice(f.criticality||'unknown',['unknown','low','medium','high'],'criticality')]))[0];
 if(cmd==='update-asset'){
 const asset=await activeAsset(a),values=[],sets=[];for(const [k,col]of Object.entries({owner:'owner',site:'site',criticality:'criticality',warranty:'warranty_on',renewal:'renewal_on'})){if(!(k in f))continue;let v=required(k);if(['warranty','renewal'].includes(k))v=date(v,k);if(k==='criticality')v=choice(v,['unknown','low','medium','high'],k);values.push(v);sets.push(`${col}=$${values.length}`);}if(!sets.length)throw Error('Supply owner, site, criticality, warranty or renewal');values.push(asset.id);return(await db.query(`update assets set ${sets.join(',')} where id=$${values.length} returning *`,values))[0];}
 if(cmd==='archive-asset'){const asset=await activeAsset(a);if((await impact(db,asset.id)).some(x=>x.state==='active'))throw Error('Active dependent assets remain; resolve them before archiving');return(await db.query("update assets set state='archived' where id=$1 returning *",[asset.id]))[0];}
 if(cmd==='add-runbook'){const steps=safeText(readFileSync(required('file'),'utf8'));return(await db.query('insert into runbooks(name,owner,purpose,steps,contains_personal,retention_review_on) values($1,$2,$3,$4,$5,$6) returning *',[safeText(needed(a,'runbook name')),required('owner'),safeText(required('purpose')),steps,f.personal===true,f['retention-review']?date(f['retention-review'],'retention review'):null]))[0];}
 if(cmd==='revise-runbook'){const book=await resolve(db,'runbooks',a);const steps=safeText(readFileSync(required('file'),'utf8'));if(book.state==='archived')throw Error('Runbook is archived');return(await db.query("update runbooks set steps=$1,version=version+1,state='draft' where id=$2 returning *",[steps,book.id]))[0];}
 if(cmd==='review-runbook'){const book=await resolve(db,'runbooks',a);if(book.state==='archived')throw Error('Runbook is archived');const version=Number(required('version'));if(!Number.isInteger(version)||version!==book.version)throw Error('Version changed; read the current runbook before reviewing');const on=past(required('date'),'review date'),due=date(required('due'),'review due');if(due<on)throw Error('Review due precedes review date');await db.query('insert into reviews(runbook_id,version,reviewer,evidence,reviewed_on,due_on) values($1,$2,$3,$4,$5,$6)',[book.id,version,required('reviewer'),safeText(required('evidence')),on,due]);await db.query("update runbooks set state='reviewed' where id=$1",[book.id]);return{runbook:book.name,version,reviewed:true};}
 if(cmd==='link-runbook'){const book=await resolve(db,'runbooks',a),asset=await activeAsset(b);if(book.state==='archived')throw Error('Runbook is archived');return(await db.query('insert into runbook_assets(runbook_id,asset_id) values($1,$2) on conflict(runbook_id,asset_id) do nothing returning *',[book.id,asset.id]))[0]||{unchanged:true};}
 if(cmd==='depend'){const asset=await activeAsset(a),parent=await activeAsset(b);if(asset.id===parent.id||(await impact(db,asset.id)).some(x=>x.id===parent.id))throw Error('Dependency would form a cycle');return(await db.query('insert into dependencies(asset_id,depends_on,reason) values($1,$2,$3) returning *',[asset.id,parent.id,safeText(required('reason'))]))[0];}
 if(cmd==='log-check'){const asset=await activeAsset(a),on=past(required('date'),'check date'),due=date(required('due'),'check due');if(due<on)throw Error('Check due precedes check date');return(await db.query('insert into checks(asset_id,kind,result,performed_on,due_on,evidence,operator) values($1,$2,$3,$4,$5,$6,$7) returning *',[asset.id,choice(required('kind'),['restore','handover','inspection'],'kind'),choice(required('result'),['pass','fail'],'result'),on,due,safeText(required('evidence')),f.actor]))[0];}
 if(cmd==='add-task'){const asset=f.asset?await activeAsset(f.asset):null;return(await db.query('insert into tasks(name,owner,due_on,asset_id) values($1,$2,$3,$4) returning *',[safeText(needed(a,'task name')),required('owner'),date(required('due'),'task due'),asset?.id||null]))[0];}
 if(cmd==='complete-task'){const task=await resolve(db,'tasks',a);if(task.state==='done')throw Error('Task is already done');return(await db.query("update tasks set state='done',evidence=$1 where id=$2 returning *",[safeText(required('evidence')),task.id]))[0];}
 if(cmd==='log'){const asset=await activeAsset(a);return(await db.query('insert into notes(asset_id,body,actor) values($1,$2,$3) returning *',[asset.id,safeText(needed(b,'note')),f.actor]))[0];}
 if(cmd==='retention-review'){const book=await resolve(db,'runbooks',a);if(!book.contains_personal)throw Error('Runbook is not marked as containing personal information');const due=date(required('due'),'retention review due');if(due<today())throw Error('Next retention review cannot be in the past');return(await db.query('update runbooks set retention_review_on=$1,retention_evidence=$2 where id=$3 returning *',[due,safeText(required('evidence')),book.id]))[0];}
 if(cmd==='record-controls'){const on=past(required('date'),'control date');const type=choice(required('kind'),['access-review','backup-test'],'control kind');const col=type==='access-review'?'access_review_on':'backup_test_on';const evidence=safeText(required('evidence'));const workspace=(await db.query('select * from workspace'))[0];if(workspace[col]&&on<workspace[col])throw Error('Control evidence is older than the recorded check');await db.query(`update workspace set ${col}=$1,${type==='access-review'?'access_review_evidence':'backup_test_evidence'}=$2`,[on,evidence]);return{kind:type,date:on,evidence};}
 });
}
