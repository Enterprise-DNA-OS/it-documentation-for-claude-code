# Link a recovery procedure to equipment

Read both records. An existing link is unchanged. A draft or stale procedure does not count as current coverage.

```bash
node scripts/documentation.mjs link-runbook "<runbook>" "<asset>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
