# Record an operating procedure

Use credential-free text. Add --personal and --retention-review=YYYY-MM-DD when personal information is present. The record starts as draft.

```bash
node scripts/documentation.mjs add-runbook "<name>" --owner="<owner>" --purpose="<purpose>" --file="<local text>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
