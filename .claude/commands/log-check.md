# Record a restore, handover or inspection result

Record a test already performed by the operator. Kinds: restore, handover, inspection. Results: pass, fail. No equipment changes occur.

```bash
node scripts/documentation.mjs log-check "<asset>" --kind=restore --result=pass --date=YYYY-MM-DD --due=YYYY-MM-DD --evidence="<reference>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
