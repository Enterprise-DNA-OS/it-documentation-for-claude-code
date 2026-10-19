# Record a completed human review

Read the current version and evidence. Record a review only after it happened. Never substitute the agent name for the human reviewer.

```bash
node scripts/documentation.mjs review-runbook "<runbook>" --version=<current version> --reviewer="<person>" --date=YYYY-MM-DD --due=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
