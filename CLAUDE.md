# IT Documentation for Claude Code

Run the documentation desk for one business, using its own private database. Read records before advising or changing them. All examples are fictional. Configure your operator context in docs/local-policy.md.

## Boundaries

- This is a documentation register, not a credential store or an infrastructure controller. Never open password exports, copy credentials or execute recovery procedures on real equipment.
- One trusted operator, one process at a time, one organisation per database. Actor labels are declared by the caller, not authenticated identities. There is no shared client portal or tenant boundary inside this database.
- Never send, publish, pay or delete. Drafts stay local. Retirement means a record status, not an equipment action.
- Read before writing. Ambiguous names must be resolved by the operator, not by choosing the first match.
- Record reviews and checks only from evidence of work already completed. A changed runbook needs a fresh review of its exact version.
- Do not invent missing owners, dates, dependencies or import columns. Unknown is a useful result.
- Back up before customisation. New schema work uses an additive migration and meaningful tests. Never edit an applied migration.
- The database owner can bypass local controls. Protect database credentials and generated reports. Keep personal information to a minimum.

## Routes

- `/README`: `.claude/commands/README.md`.
- `/add-asset`: `.claude/commands/add-asset.md`.
- `/add-runbook`: `.claude/commands/add-runbook.md`.
- `/add-task`: `.claude/commands/add-task.md`.
- `/archive-asset`: `.claude/commands/archive-asset.md`.
- `/asset`: `.claude/commands/asset.md`.
- `/assets`: `.claude/commands/assets.md`.
- `/attention`: `.claude/commands/attention.md`.
- `/checks`: `.claude/commands/checks.md`.
- `/complete-task`: `.claude/commands/complete-task.md`.
- `/compliance`: `.claude/commands/compliance.md`.
- `/coverage`: `.claude/commands/coverage.md`.
- `/customise`: `.claude/commands/customise.md`.
- `/depend`: `.claude/commands/depend.md`.
- `/dependencies`: `.claude/commands/dependencies.md`.
- `/documents`: `.claude/commands/documents.md`.
- `/draft-handover`: `.claude/commands/draft-handover.md`.
- `/draft-weekly-review`: `.claude/commands/draft-weekly-review.md`.
- `/export`: `.claude/commands/export.md`.
- `/history`: `.claude/commands/history.md`.
- `/impact`: `.claude/commands/impact.md`.
- `/import`: `.claude/commands/import.md`.
- `/init`: `.claude/commands/init.md`.
- `/insights`: `.claude/commands/insights.md`.
- `/link-runbook`: `.claude/commands/link-runbook.md`.
- `/log`: `.claude/commands/log.md`.
- `/log-check`: `.claude/commands/log-check.md`.
- `/new-view`: `.claude/commands/new-view.md`.
- `/record-controls`: `.claude/commands/record-controls.md`.
- `/renewals`: `.claude/commands/renewals.md`.
- `/retention-review`: `.claude/commands/retention-review.md`.
- `/review-queue`: `.claude/commands/review-queue.md`.
- `/review-runbook`: `.claude/commands/review-runbook.md`.
- `/revise-runbook`: `.claude/commands/revise-runbook.md`.
- `/runbook`: `.claude/commands/runbook.md`.
- `/runbooks`: `.claude/commands/runbooks.md`.
- `/search`: `.claude/commands/search.md`.
- `/sites`: `.claude/commands/sites.md`.
- `/tasks`: `.claude/commands/tasks.md`.
- `/update-asset`: `.claude/commands/update-asset.md`.
- `/view`: `.claude/commands/view.md`.
- `/weekly-review`: `.claude/commands/weekly-review.md`.

## Files

scripts/documentation.mjs is the sole business CLI. scripts/lib/domain.mjs holds the workflows. supabase/migrations holds portable Postgres migrations. DATABASE_URL selects private Postgres; when unset, local PGlite stores records in .data/db. Every read supports --json. docs/cli.md lists syntax; docs/compliance.md defines evidence checks and local rules.

Run with Claude Code, Codex, OpenCode or Cursor. The same command files apply to each.

Built and run through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=it-glue&utm_medium=readme
