# Set up one business database

Only one organisation belongs in each database. Do not seed real databases.

```bash
node scripts/documentation.mjs init "<business name>" --source-org="<exact IT Glue organisation>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
