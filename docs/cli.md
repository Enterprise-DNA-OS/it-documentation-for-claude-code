# CLI reference

Run `node scripts/documentation.mjs <command>`. Reads accept --json. All writes require --actor, a caller-declared label. Dates use YYYY-MM-DD. Use IDs when names are ambiguous. Quote values containing spaces.

## assets

Review the equipment register. Show site, owner, criticality and state. Unknown criticality needs an operator decision.

```bash
node scripts/documentation.mjs assets
```

## asset

Read an asset and its evidence. Read the complete asset, linked runbooks, notes and downstream dependencies before suggesting a change.

```bash
node scripts/documentation.mjs asset "<unique name or ID>"
```

## sites

Review documentation by site. Compare active assets and critical equipment by site.

```bash
node scripts/documentation.mjs sites
```

## runbooks

Review procedure versions. Show which current versions have valid reviews. A historical review does not cover a revised procedure.

```bash
node scripts/documentation.mjs runbooks
```

## runbook

Read a procedure and review history. Read the steps and review evidence. Never execute recovery steps on infrastructure from this register.

```bash
node scripts/documentation.mjs runbook "<unique name or ID>"
```

## review-queue

Prepare the weekly procedure review. Prioritise missing, stale and invalidated reviews. Name the owner and due date.

```bash
node scripts/documentation.mjs review-queue
```

## renewals

Prepare the warranty and renewal review. Show records due within 60 days, including overdue items. Missing dates mean unknown, not current cover.

```bash
node scripts/documentation.mjs renewals
```

## coverage

Check recovery documentation coverage. Prioritise critical equipment without a currently reviewed runbook. Show site and accountable owner.

```bash
node scripts/documentation.mjs coverage
```

## dependencies

Read the recorded service dependencies. Read the dependency direction as asset depends on the named parent. Unrecorded dependencies remain unknown.

```bash
node scripts/documentation.mjs dependencies
```

## impact

Find downstream impact before a change. Show all recorded downstream assets. This is graph analysis of declared relationships, not network discovery.

```bash
node scripts/documentation.mjs impact "<unique asset or ID>"
```

## attention

Triage this week's documentation gaps. Group overdue work, expired warranties, missing owners and failed checks by owner. Do not mark anything done without evidence.

```bash
node scripts/documentation.mjs attention
```

## compliance

Review safeguards and retention evidence. Read docs/compliance.md. Distinguish NZ privacy principles from local 90-day controls. Findings are evidence gaps, not a legal verdict.

```bash
node scripts/documentation.mjs compliance
```

## checks

Review the latest recovery and handover checks. Show latest evidence per asset and check type. A pass records a human test; this software does not run the test.

```bash
node scripts/documentation.mjs checks
```

## tasks

Review outstanding follow-up work. Show overdue open tasks first. Completion needs an evidence reference.

```bash
node scripts/documentation.mjs tasks
```

## history

Read the change record. Explain who was declared as the actor and which record changed. The actor label is not authenticated identity.

```bash
node scripts/documentation.mjs history
```

## search

Find a procedure or asset. Search names, asset types, sites and procedure text. Quote only the matching records.

```bash
node scripts/documentation.mjs search "<text>"
```

## insights

Run the ten joined-record questions. Present useful results from each query and state when no rows matched. Do not claim a rival cannot build custom reports.

```bash
node scripts/documentation.mjs insights
```

## init

Set up one business database. Only one organisation belongs in each database. Do not seed real databases.

```bash
node scripts/documentation.mjs init "<business name>" --source-org="<exact IT Glue organisation>" --actor="<operator>"
```

## add-asset

Record new equipment. Confirm site and owner from the operator. Criticality is low, medium, high or unknown.

```bash
node scripts/documentation.mjs add-asset "<name>" --kind="<type>" --site="<site>" --owner="<owner>" --criticality=high --actor="<operator>"
```

## update-asset

Update ownership or key dates. Read the asset first. Supply only confirmed fields. Other accepted fields are --site and --criticality.

```bash
node scripts/documentation.mjs update-asset "<asset>" --owner="<owner>" --warranty=YYYY-MM-DD --renewal=YYYY-MM-DD --actor="<operator>"
```

## archive-asset

Retire a documented asset. Read dependencies first. Only record retirement after the operator confirms it. Active downstream dependencies block retirement. This does not change equipment.

```bash
node scripts/documentation.mjs archive-asset "<asset>" --actor="<operator>"
```

## add-runbook

Record an operating procedure. Use credential-free text. Add --personal and --retention-review=YYYY-MM-DD when personal information is present. The record starts as draft.

```bash
node scripts/documentation.mjs add-runbook "<name>" --owner="<owner>" --purpose="<purpose>" --file="<local text>" --actor="<operator>"
```

## revise-runbook

Revise a procedure and require a new review. Read the existing version first. This increments its version and invalidates its current review. Old content remains in the private audit history.

```bash
node scripts/documentation.mjs revise-runbook "<runbook>" --file="<local text>" --actor="<operator>"
```

## review-runbook

Record a completed human review. Read the current version and evidence. Record a review only after it happened. Never substitute the agent name for the human reviewer.

```bash
node scripts/documentation.mjs review-runbook "<runbook>" --version=<current version> --reviewer="<person>" --date=YYYY-MM-DD --due=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

## link-runbook

Link a recovery procedure to equipment. Read both records. An existing link is unchanged. A draft or stale procedure does not count as current coverage.

```bash
node scripts/documentation.mjs link-runbook "<runbook>" "<asset>" --actor="<operator>"
```

## depend

Record a service dependency. Confirm the dependency with the operator. Self-links and cycles are refused.

```bash
node scripts/documentation.mjs depend "<asset>" "<parent asset>" --reason="<reason>" --actor="<operator>"
```

## log-check

Record a restore, handover or inspection result. Record a test already performed by the operator. Kinds: restore, handover, inspection. Results: pass, fail. No equipment changes occur.

```bash
node scripts/documentation.mjs log-check "<asset>" --kind=restore --result=pass --date=YYYY-MM-DD --due=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

## add-task

Assign documentation follow-up. Asset is optional. Confirm the owner and due date; do not invent commitments.

```bash
node scripts/documentation.mjs add-task "<task>" --owner="<owner>" --due=YYYY-MM-DD --asset="<asset>" --actor="<operator>"
```

## complete-task

Record completion evidence. Read the task and verified evidence before recording completion.

```bash
node scripts/documentation.mjs complete-task "<task>" --evidence="<reference>" --actor="<operator>"
```

## log

Record a documentation note. Read the asset first. Keep credentials and unnecessary personal information out of notes.

```bash
node scripts/documentation.mjs log "<asset>" "<note>" --actor="<operator>"
```

## retention-review

Record a completed retention assessment. Read the runbook and business retention policy. Record an assessment already completed by the responsible person, with the next review date. This does not erase content or establish a legal basis.

```bash
node scripts/documentation.mjs retention-review "<runbook>" --due=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

## record-controls

Record a completed safeguards check. Kind is access-review or backup-test. Record evidence of a completed review or restore test. The register itself does neither.

```bash
node scripts/documentation.mjs record-controls --kind=access-review --date=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

## import

Bring IT Glue configuration records across. Read docs/replace-it-glue.md. Confirm the one organisation, check the dry-run counts and ignored columns, then repeat without --dry-run. Never open password exports or import attachments here.

```bash
node scripts/documentation.mjs import it-glue "<configurations.csv>" --map=examples/column-map.json --dry-run --actor="<operator>"
```

## export

Export every register and its evidence. Use a new file. Reconcile record counts and store it privately. The format is documented, not a built-in restore command.

```bash
node scripts/documentation.mjs export --out="<new private path.json>"
```

## draft-handover

Draft an asset handover. Read the generated draft and identify current review gaps. It stays in drafts; never send it.

```bash
node scripts/documentation.mjs draft-handover "<asset>"
```

## draft-weekly-review

Draft the weekly documentation review. Read the resulting draft containing attention, coverage and review queue. It stays local; never send it.

```bash
node scripts/documentation.mjs draft-weekly-review
```

