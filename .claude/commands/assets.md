# Review the equipment register

Show site, owner, criticality and state. Unknown criticality needs an operator decision.

```bash
node scripts/documentation.mjs assets
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
