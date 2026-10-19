# Record a completed retention assessment

Read the runbook and business retention policy. Record an assessment already completed by the responsible person, with the next review date. This does not erase content or establish a legal basis.

```bash
node scripts/documentation.mjs retention-review "<runbook>" --due=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
