# Evidence checks, not certification

Checked 19 October 2026. /compliance checks recorded evidence and configured review dates. It cannot establish that safeguards are effective, a procedure is safe, or retention is lawful. A person owns those decisions.

| Rule | Source | Implemented check | Limit |
|---|---|---|---|
| NZ-IPP5 | [NZ Privacy Commissioner, principle 5](https://www.privacy.org.nz/privacy-principles/5/) | Flag missing or stale access-review and restore-test dates, or missing evidence references | The principle requires reasonable safeguards. The 90-day interval is our local example, not law. A recorded reference does not prove safeguards work. |
| NZ-IPP9 | [NZ Privacy Commissioner, principle 9](https://www.privacy.org.nz/privacy-principles/9/) | Flag personal-information runbooks without a retention review date or whose review is overdue, including archived records | The principle limits retention to the lawful purpose. There is no fixed universal period; records and audit history need a business-specific disposal policy. |
| LOCAL-DOC | [Local policy](local-policy.md) | Flag unreviewed, revised or expired current runbook versions | Operational quality check, not legislation. |
| LOCAL-OWNER | [Local policy](local-policy.md) | Flag active equipment without an owner | Operational accountability check, not legislation. |

Reviews and checks require a dated evidence reference. Future performed dates are refused. New runbook versions invalidate prior reviews. Missing facts stay unknown. Password exports and credential columns are rejected. Pattern checks are an extra guard, not secret detection certification.

No NZ or Australian compliance certification is claimed. Australian operators must configure their own applicable requirements. The database has RLS with no public policies, and views execute with the caller's permissions. The intended owner connection has full record access. There is no tenant separation within one database, no authentication layer and no public endpoint. Use a separate private database for each business.
