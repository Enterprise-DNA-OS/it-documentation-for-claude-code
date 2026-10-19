# Record a completed safeguards check

Kind is access-review or backup-test. Record evidence of a completed review or restore test. The register itself does neither.

```bash
node scripts/documentation.mjs record-controls --kind=access-review --date=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
