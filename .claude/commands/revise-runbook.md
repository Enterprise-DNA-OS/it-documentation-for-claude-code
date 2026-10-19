# Revise a procedure and require a new review

Read the existing version first. This increments its version and invalidates its current review. Old content remains in the private audit history.

```bash
node scripts/documentation.mjs revise-runbook "<runbook>" --file="<local text>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
