# Bring IT Glue configuration records across

Read docs/replace-it-glue.md. Confirm the one organisation, check the dry-run counts and ignored columns, then repeat without --dry-run. Never open password exports or import attachments here.

```bash
node scripts/documentation.mjs import it-glue "<configurations.csv>" --map=examples/column-map.json --dry-run --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
