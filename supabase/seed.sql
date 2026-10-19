begin;
select set_config('app.actor','fictional demo seed',true);
insert into workspace(id,name,source_org,access_review_on,backup_test_on) values
('10000000-0000-0000-0000-000000000001','Harbour Demo IT','Harbour Demo IT',current_date-110,current_date-100) on conflict do nothing;
insert into assets(id,name,kind,site,owner,criticality,warranty_on,renewal_on) values
('20000000-0000-0000-0000-000000000001','Core firewall','Network','Wellington','Mia Chen','high',current_date-20,current_date+12),
('20000000-0000-0000-0000-000000000002','File server','Server','Wellington','Noah Reed','high',current_date+300,null),
('20000000-0000-0000-0000-000000000003','Core firewall','Network','Auckland',null,'high',null,current_date+7),
('20000000-0000-0000-0000-000000000004','Backup storage','Storage','Wellington','Mia Chen','high',current_date+240,null),
('20000000-0000-0000-0000-000000000005','Reception workstation','Workstation','Auckland','Ava King','low',current_date+90,null)
on conflict do nothing;
insert into runbooks(id,name,owner,purpose,steps,state,contains_personal,retention_review_on) values
('30000000-0000-0000-0000-000000000001','Firewall recovery','Mia Chen','Restore site connectivity after an approved change','1. Confirm the approved maintenance window. 2. Obtain the approved configuration from the secure archive. 3. Have the authorised engineer restore it. 4. Record connectivity checks.','reviewed',false,null),
('30000000-0000-0000-0000-000000000002','File restore test','Noah Reed','Verify recovery using synthetic files','1. Select a synthetic test file. 2. Ask the backup operator to restore it. 3. Compare its checksum. 4. Save the evidence reference.','reviewed',false,null),
('30000000-0000-0000-0000-000000000003','Staff handover checklist','Ava King','Review named staff access at handover','1. Obtain the approved access list. 2. Ask the access administrator to reconcile it. 3. Record exceptions without copying credentials.','draft',true,current_date-5)
on conflict do nothing;
insert into reviews(id,runbook_id,version,reviewer,evidence,reviewed_on,due_on) values
('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',1,'Leo Patel','demo/firewall-review',current_date-100,current_date-10),
('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002',1,'Mia Chen','demo/restore-review',current_date-7,current_date+83)
on conflict do nothing;
insert into runbook_assets(id,runbook_id,asset_id) values
('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001'),
('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002'),
('50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000004') on conflict do nothing;
insert into dependencies(id,asset_id,depends_on,reason) values
('60000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Site network'),
('60000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','Backup source') on conflict do nothing;
insert into checks(id,asset_id,kind,result,performed_on,due_on,evidence,operator) values
('70000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','restore','fail',current_date-8,current_date-1,'demo/restore-failure','Noah Reed') on conflict do nothing;
insert into tasks(id,asset_id,name,owner,due_on) values
('80000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','Assign Auckland firewall owner','Ava King',current_date-3),
('80000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','Investigate failed restore','Noah Reed',current_date-1) on conflict do nothing;
commit;
