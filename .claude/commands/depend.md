# Record a service dependency

Confirm the dependency with the operator. Self-links and cycles are refused.

```bash
node scripts/documentation.mjs depend "<asset>" "<parent asset>" --reason="<reason>" --actor="<operator>"
```

Read the output before reporting success. Add `--json` when combining records. On an ambiguous name, list the candidates and let the operator select. Never send, publish, change equipment or handle credentials.
