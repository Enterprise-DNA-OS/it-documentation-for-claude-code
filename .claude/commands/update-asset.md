# Update ownership or key dates

Read the asset first. Supply only confirmed fields. Other accepted fields are --site and --criticality.

```bash
node scripts/documentation.mjs update-asset "<asset>" --owner="<owner>" --warranty=YYYY-MM-DD --renewal=YYYY-MM-DD --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
