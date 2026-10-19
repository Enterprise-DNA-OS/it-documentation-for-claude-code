# Record new equipment

Confirm site and owner from the operator. Criticality is low, medium, high or unknown.

```bash
node scripts/documentation.mjs add-asset "<name>" --kind="<type>" --site="<site>" --owner="<owner>" --criticality=high --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
