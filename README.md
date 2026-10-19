# IT Documentation for Claude Code

Know which critical equipment has no reviewed recovery procedure before it fails. Keep equipment, runbooks, dependencies, dates and review evidence in a database you own. MIT licensed. Built by Enterprise DNA.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install, test and bring your configuration export across. | Your fields, review rules, documents and connections. One setup fee, then a retainer. | Installed and maintained through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=it-glue&utm_medium=readme) | [Talk to Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=it-glue&utm_medium=readme) |

IT Glue Enterprise lists US$44 per user per month on a 36-month term, with a five-user minimum and an onboarding fee. [Vendor pricing](https://www.itglue.com/pricing/), checked 19 October 2026. This base covers the documentation desk; it does not reproduce the vendor's complete platform.

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/it-documentation-for-claude-code.git
cd it-documentation-for-claude-code
npm install
npm test
npm run demo
```

Use Node 22. The demo uses a temporary fictional database, renders its reports and removes its output afterward. It ignores DATABASE_URL. For persistent fictional records, run npm run migrate and npm run seed. For real work, migrate without seeding, then initialise one organisation:

```bash
node scripts/documentation.mjs init "Your business" --source-org="Exact IT Glue organisation" --actor="Your operator"
```

Leave DATABASE_URL unset for local PGlite, or point it at your private Postgres database. Remote TLS certificates are verified. There is no public API. The base is for one trusted operator and one organisation; separate businesses need separate databases.

Open the folder in Claude Code, Codex, OpenCode or Cursor. Ask for /attention or describe the review you need. No model API is called by this code.

## Weekly work

- /review-queue: procedures needing a current version review.
- /coverage: critical equipment without reviewed recovery instructions.
- /renewals: warranties and renewal dates approaching or overdue.
- /impact: downstream equipment affected by a recorded dependency.
- /weekly-review: attention, coverage and review queue, saved as a draft.
- /compliance: safeguard and retention evidence, with cited principles and separately labelled local controls.

42 workflow commands ship in .claude/commands. The complete syntax is in [docs/cli.md](docs/cli.md). Reads return aligned text or --json; unique partial identifiers and case-insensitive names work. Ambiguous matches list candidates and exit unsuccessfully.

## Bring your IT Glue history

Export configuration records for one organisation as CSV. Review the headings, set the mapping if needed and run:

```bash
node scripts/documentation.mjs import it-glue examples/it-glue-configurations.csv --map=examples/column-map.json --dry-run --actor="Demo operator"
```

That fictional example matches the seeded organisation. For real data, use your own configuration CSV and initialise the exact source organisation name first. Repeat without --dry-run after reconciling the counts and ignored fields. Repeated identical rows are skipped; conflicting source IDs stop the entire import. Only selected asset fields carry over. IT Glue does not export related items or revision history; rebuild dependencies from verified evidence. HTML documents, attachments and password exports are not read by this importer. [Switching guide](docs/replace-it-glue.md).

## Documents and views

Set your business name, logo and colours in brand.json. npm run view renders the weekly review, coverage and evidence dashboards. npm run docs renders asset handovers, runbook review records and control reports as branded HTML. They are read-only files, with no service to host and no actions to click. /new-view adds a report from your own question. Drafts remain local and never send.

## Ten questions answered from your records

/insights executes all ten. These combine the records you own; they are not claims that IT Glue cannot produce a custom report.

1. Which critical assets have no current runbook?
2. Which renewals have no accountable owner?
3. Which expired warranties protect high-criticality equipment?
4. Which reviewed runbooks have become stale?
5. Which sites carry the most uncovered critical assets?
6. Which failed checks have no open follow-up task?
7. Which runbooks containing personal information need a retention review?
8. Which active assets rely directly on archived equipment?
9. Which people own overdue documentation work?
10. Which imported assets still need classification?

## Your first hour: ten things to ask for

1. Show critical assets without current recovery instructions.
2. Show all equipment that relies on the core firewall.
3. Find the runbooks nobody has reviewed this quarter.
4. Record the owner of the Auckland firewall.
5. Link the verified restore procedure to the file server.
6. Record the evidence from yesterday's restore test.
7. Draft the handover for the file server.
8. Put our business name on the review report.
9. Show imported equipment that still needs classification.
10. Add our own equipment field or review rule through /customise.

## Trust and limits

The register records human checks; it does not test backups, discover equipment or change infrastructure. The text check rejects common credential patterns but cannot detect every secret: keep credentials in a separate vault. Reviews are versioned, and edits invalidate current review status. Audit, review, check and note records are append-only through the database triggers; the database owner can bypass them. Keep the database and generated files private. There is no identity verification, multi-user permission layer or encrypted credential store. Use a custom installation for shared access and authenticated approvals.

See [scope](docs/why-no-front-end.md), [compliance](docs/compliance.md), [selection evidence](docs/research.md) and [local policy](docs/local-policy.md). A database backup is required for recovery; the JSON export is a portable record archive, not an automated restore tool.

## Verification

npm test exercises migrations, repeatable seed, every workflow, ambiguous matches, dependency cycles, review invalidation, immutable history, isolated imports, full rollback, missing evidence, restricted access, drafts and HTML output. The same test command is configured for Windows and Linux in GitHub Actions. Local execution is Linux/PGlite; a separate server Postgres and Windows machine are not implied by a local pass.
