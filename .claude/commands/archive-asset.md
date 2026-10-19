# Retire a documented asset

Read dependencies first. Only record retirement after the operator confirms it. Active downstream dependencies block retirement. This does not change equipment.

```bash
node scripts/documentation.mjs archive-asset "<asset>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
