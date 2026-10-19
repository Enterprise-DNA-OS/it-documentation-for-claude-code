# Move configuration records from IT Glue

Source checked 19 October 2026: [IT Glue export guide](https://help.itglue.kaseya.com/help/Content/1-admin/import-and-export/exporting-and-backing-up-account-data.html).

1. As an authorised administrator, choose the configuration list for the one organisation, check the filters and export that list as CSV. IT Glue's documented global-list export respects filters. Avoid full-account archives here: they can contain unencrypted passwords and OTP keys. This importer accepts only a configuration CSV, never a ZIP, password file or document archive.
2. Keep the export privately. Review just its configuration headings and confirm all records belong to the intended organisation. The sample is synthetic and illustrates supported headers; export headings vary, so use examples/column-map.json to map your actual headings. Do not call that sample a captured vendor export.
3. Install, migrate without seed and initialise with the exact organisation name. Run the single import command with --dry-run, inspect imported and ignored fields, then repeat without --dry-run. No API, integration sign-in or paid model call is needed.
4. Reconcile source IDs, names, site, asset type, manufacturer, model, serial number and warranty dates. Add verified owners and criticality, then link reviewed runbooks and dependencies. The importer leaves those unknown rather than inventing them.

```bash
node scripts/documentation.mjs import it-glue /private/configurations.csv --map=examples/column-map.json --dry-run --actor="Operator"
```

Remove --dry-run after checking. Date fields must be ISO YYYY-MM-DD. If your export uses another date convention, explicitly convert it before importing. Do not guess ambiguous dates. Supported status labels are Active, Inactive and Archived; unknown labels are rejected for reconciliation. Empty status defaults to active, so verify it before importing.

The map accepts source_id, organisation, name, kind, site, state, manufacturer, model, serial_number and warranty_on. Required fields are ID, organisation and name. Default heading aliases are in scripts/lib/domain.mjs. Explicit mapping resolves heading collisions. Every row must match the configured organisation. Unknown columns are listed and ignored, never copied into a catch-all field. Credential-like headings cause rejection of the whole import.

Identical source IDs and mapped values are skipped on repeat import. Changed mapped values require reconciliation, rather than overwriting local records. Duplicate IDs, invalid dates, conflicting names or any invalid row fail the entire import, including audit writes. A dry run rolls back every write.

IT Glue exports core and flexible assets as separate CSV files and documents as HTML. Its export excludes related items, revision history, users and flexible asset templates. This initial importer brings configuration fields across. Other asset types need an explicit mapping extension. Recreate relationships and review evidence after verifying them. Keep document and attachment archives privately; they are not imported by this command. Password records stay in a separate credential migration process, outside this tool.

Once the configuration import reconciles, run coverage, review-queue and impact on the records that matter. Keep the source archive until the business's retention and migration checks are satisfied. Switch the documentation desk only after the operator verifies the records. The one-command import is for configuration history, not a promise of full IT Glue feature parity or a timed migration guarantee.
