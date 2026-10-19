create table workspace (
 id uuid primary key default gen_random_uuid(), singleton boolean not null default true unique check(singleton),
 name text not null check(length(trim(name))>0), source_org text not null check(length(trim(source_org))>0),
 access_review_on date, backup_test_on date, access_review_evidence text, backup_test_evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table assets (
 id uuid primary key default gen_random_uuid(), source_id text unique, source_hash text,
 name text not null check(length(trim(name))>0), kind text not null, site text not null default 'Unassigned',
 owner text, criticality text not null default 'unknown' check(criticality in ('unknown','low','medium','high')),
 state text not null default 'active' check(state in ('active','archived')),
 manufacturer text, model text, serial_number text, warranty_on date, renewal_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index assets_name_site on assets(lower(name),lower(site));
create table runbooks (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0),
 owner text, purpose text not null, steps text not null, version integer not null default 1 check(version>0),
 state text not null default 'draft' check(state in ('draft','reviewed','archived')),
 contains_personal boolean not null default false, retention_review_on date, retention_evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index runbooks_name on runbooks(lower(name));
create table reviews (
 id uuid primary key default gen_random_uuid(), runbook_id uuid not null references runbooks(id),
 version integer not null, reviewer text not null, evidence text not null,
 reviewed_on date not null, due_on date not null check(due_on>=reviewed_on),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index reviews_book_version on reviews(runbook_id,version,created_at desc);
create table runbook_assets (
 id uuid primary key default gen_random_uuid(), runbook_id uuid not null references runbooks(id),
 asset_id uuid not null references assets(id), unique(runbook_id,asset_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index runbook_assets_asset on runbook_assets(asset_id);
create table dependencies (
 id uuid primary key default gen_random_uuid(), asset_id uuid not null references assets(id),
 depends_on uuid not null references assets(id), reason text not null,
 check(asset_id<>depends_on), unique(asset_id,depends_on),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index dependencies_parent on dependencies(depends_on);
create table checks (
 id uuid primary key default gen_random_uuid(), asset_id uuid not null references assets(id),
 kind text not null check(kind in ('restore','handover','inspection')),
 result text not null check(result in ('pass','fail')), performed_on date not null,
 due_on date not null check(due_on>=performed_on), evidence text not null, operator text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index checks_asset_kind on checks(asset_id,kind,performed_on desc);
create table tasks (
 id uuid primary key default gen_random_uuid(), asset_id uuid references assets(id),
 name text not null, owner text not null, due_on date not null,
 state text not null default 'open' check(state in ('open','done')),
 evidence text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(state<>'done' or length(trim(evidence))>0)
);
create index tasks_asset on tasks(asset_id);
create index tasks_due on tasks(due_on) where state='open';
create table notes (
 id uuid primary key default gen_random_uuid(), asset_id uuid not null references assets(id),
 body text not null, actor text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index notes_asset on notes(asset_id);
create table audit (
 id uuid primary key default gen_random_uuid(), relation text not null, record_id uuid not null,
 operation text not null, actor text not null, before_record jsonb, after_record jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index audit_record on audit(record_id,created_at);
create function touch_record() returns trigger language plpgsql as $$ begin new.updated_at=clock_timestamp(); return new; end $$;
create function audit_record() returns trigger language plpgsql as $$
declare who text; begin
 who:=nullif(current_setting('app.actor',true),'');
 if who is null then raise exception 'actor required'; end if;
 insert into audit(relation,record_id,operation,actor,before_record,after_record)
 values(tg_table_name,coalesce(new.id,old.id),tg_op,who,case when tg_op='INSERT' then null else to_jsonb(old) end,case when tg_op='DELETE' then null else to_jsonb(new) end);
 return coalesce(new,old);
end $$;
create function immutable_record() returns trigger language plpgsql as $$ begin raise exception 'append-only record'; end $$;
create trigger workspace_touch before update on workspace for each row execute function touch_record();
create trigger workspace_audit after insert or update or delete on workspace for each row execute function audit_record();
create trigger assets_touch before update on assets for each row execute function touch_record();
create trigger assets_audit after insert or update or delete on assets for each row execute function audit_record();
create trigger runbooks_touch before update on runbooks for each row execute function touch_record();
create trigger runbooks_audit after insert or update or delete on runbooks for each row execute function audit_record();
create trigger reviews_touch before update on reviews for each row execute function touch_record();
create trigger reviews_audit after insert or update or delete on reviews for each row execute function audit_record();
create trigger runbook_assets_touch before update on runbook_assets for each row execute function touch_record();
create trigger runbook_assets_audit after insert or update or delete on runbook_assets for each row execute function audit_record();
create trigger dependencies_touch before update on dependencies for each row execute function touch_record();
create trigger dependencies_audit after insert or update or delete on dependencies for each row execute function audit_record();
create trigger checks_touch before update on checks for each row execute function touch_record();
create trigger checks_audit after insert or update or delete on checks for each row execute function audit_record();
create trigger tasks_touch before update on tasks for each row execute function touch_record();
create trigger tasks_audit after insert or update or delete on tasks for each row execute function audit_record();
create trigger notes_touch before update on notes for each row execute function touch_record();
create trigger notes_audit after insert or update or delete on notes for each row execute function audit_record();
create trigger audit_immutable before update or delete on audit for each row execute function immutable_record();
create trigger reviews_immutable before update or delete on reviews for each row execute function immutable_record();
create trigger checks_immutable before update or delete on checks for each row execute function immutable_record();
create trigger notes_immutable before update or delete on notes for each row execute function immutable_record();
create view runbook_status with (security_invoker=true) as
 select b.id,b.name,b.owner,b.version,b.state,b.contains_personal,b.retention_review_on,
 r.reviewer,r.reviewed_on,r.due_on,
 (b.state='reviewed' and r.due_on>=current_date and r.reviewed_on<=current_date) as current_review
 from runbooks b left join lateral
 (select * from reviews where runbook_id=b.id and version=b.version order by reviewed_on desc,created_at desc,id desc limit 1) r on true;
create view asset_coverage with (security_invoker=true) as
 select a.id,a.name,a.kind,a.site,a.owner,a.criticality,a.state,a.warranty_on,a.renewal_on,
 count(b.id) filter(where b.state<>'archived')::int as runbooks,
 count(b.id) filter(where b.current_review)::int as current_runbooks
 from assets a left join runbook_assets l on l.asset_id=a.id left join runbook_status b on b.id=l.runbook_id
 group by a.id;
create view latest_checks with (security_invoker=true) as
 select distinct on(asset_id,kind) * from checks order by asset_id,kind,performed_on desc,created_at desc,id desc;
create view attention_items with (security_invoker=true) as
 select a.id,'asset'::text as record_type,a.name,a.owner,'No current runbook'::text as issue,current_date as due_on
 from asset_coverage a where a.state='active' and a.criticality='high' and a.current_runbooks=0
 union all select id,'asset',name,owner,'Owner missing',current_date from assets where state='active' and nullif(trim(owner),'') is null
 union all select id,'asset',name,owner,'Warranty expired',warranty_on from assets where state='active' and warranty_on<current_date
 union all select id,'asset',name,owner,'Renewal due',renewal_on from assets where state='active' and renewal_on<=current_date+30
 union all select id,'runbook',name,owner,'Review required',coalesce(due_on,current_date) from runbook_status where state<>'archived' and not coalesce(current_review,false)
 union all select t.id,'task',t.name,t.owner,'Task overdue',t.due_on from tasks t where state='open' and due_on<current_date
 union all select a.id,'asset',a.name,a.owner,'Check failed or overdue: '||c.kind,c.due_on from latest_checks c join assets a on a.id=c.asset_id where a.state='active' and (c.result='fail' or c.due_on<current_date);
create view compliance_items with (security_invoker=true) as
 select id,name,'NZ-IPP5'::text as rule,'Access safeguards review missing or overdue'::text as issue,'https://www.privacy.org.nz/privacy-principles/5/'::text as source
 from workspace where access_review_on is null or access_review_on<current_date-90 or nullif(trim(access_review_evidence),'') is null
 union all select id,name,'NZ-IPP5','Backup restore test missing or overdue','https://www.privacy.org.nz/privacy-principles/5/' from workspace where backup_test_on is null or backup_test_on<current_date-90 or nullif(trim(backup_test_evidence),'') is null
 union all select id,name,'NZ-IPP9','Personal information retention review missing or overdue','https://www.privacy.org.nz/privacy-principles/9/' from runbooks where contains_personal and (retention_review_on is null or retention_review_on<current_date or nullif(trim(retention_evidence),'') is null)
 union all select id,name,'LOCAL-DOC','Current version has no valid review','docs/local-policy.md' from runbook_status where state<>'archived' and not coalesce(current_review,false)
 union all select id,name,'LOCAL-OWNER','Active asset has no accountable owner','docs/local-policy.md' from assets where state='active' and nullif(trim(owner),'') is null;
alter table workspace enable row level security;
revoke all on workspace from public;
alter table assets enable row level security;
revoke all on assets from public;
alter table runbooks enable row level security;
revoke all on runbooks from public;
alter table reviews enable row level security;
revoke all on reviews from public;
alter table runbook_assets enable row level security;
revoke all on runbook_assets from public;
alter table dependencies enable row level security;
revoke all on dependencies from public;
alter table checks enable row level security;
revoke all on checks from public;
alter table tasks enable row level security;
revoke all on tasks from public;
alter table notes enable row level security;
revoke all on notes from public;
alter table audit enable row level security;
revoke all on audit from public;
revoke all on runbook_status from public;
revoke all on asset_coverage from public;
revoke all on latest_checks from public;
revoke all on attention_items from public;
revoke all on compliance_items from public;
