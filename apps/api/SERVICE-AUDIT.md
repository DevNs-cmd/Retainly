# Backend service audit — 20 September 2026

Reviewed the source at local commit `2c434af` against the backend brief. All 20 named feature modules and all seven workers are registered. This does **not** mean every workflow is complete. Database deployment, real provider calls, and end-to-end execution were not verified. No schema or migration changes were made during this audit.

The current Prisma schema contains 24 models. The earlier description of a three-model schema is outdated. Schema presence alone does not establish that a database has been migrated or that runtime contracts work.

## Service coverage

“Present” means meaningful implementation exists, not production acceptance.

| Module | Implementation found | Remaining work / verification |
| --- | --- | --- |
| Organizations | Create organization/user/owner in a transaction; read/update/soft delete | Database and identity-provider acceptance tests |
| Users | Current-user profile read/update | Identity lifecycle integration verification |
| Memberships | List, pending invite record, role updates, removal, last-owner protection | Invite delivery and acceptance/linking to an authenticated user |
| Students | CRUD, risk view, CSV upload and background import | Import/creation quota enforcement; integration tests |
| Courses | CRUD and enrollment count | Database acceptance tests |
| Enrollments | CRUD and status-change outbox events | Lifecycle transitions and reference validation tests |
| Activities | List, single/batch ingestion, transactional outbox | Validate that the referenced student belongs to the organization |
| Risk | Features, scoring HTTP adapter, snapshots, history, recalculation | Adapter does not match the merged AI service contract |
| Automation | Rule CRUD, evaluator, cooldown, action dispatch | Inactivity/manual trigger producers and terminal execution status updates |
| Campaigns | CRUD, send/schedule, recipient fanout and statistics | Pause/resume API; delivery failure completion handling |
| Notifications | In-app notifications, provider delivery, retries and logs | Respect email opt-out; repair retry/accounting and terminal failure handling |
| Integrations | Encrypted credentials, connection lifecycle, registry and sync jobs | Several provider operations/OAuth require external bridge implementations absent from this repository |
| Webhooks | Routing verification, signatures, normalization and queued processing | Provider-specific compatibility/fixtures; generic signature fallback requires an agreed gateway |
| Analytics | Cached reads and scheduled aggregation worker | Verify metric definitions and results against realistic data |
| Billing | Stripe checkout, portal, invoices, subscription and usage logic | Enforce usage caps in write/send paths; provider lifecycle acceptance tests |
| Coach tasks | CRUD and assigned-coach read restrictions | Assignment authorization and membership tests |
| Audit | Mutation interceptor and audit reads | Before/after changes; avoid returning an error after an already committed mutation if audit logging fails |
| Subscriptions | Generic CRUD | Explicit cancellation/lifecycle behavior and event handling |
| Usage | Current usage and metric history reads | Integration with enforced limits and durable accounting verification |
| Payments | Read endpoints; webhook/sync writes | Provider mappings and payment lifecycle integration tests |

## Highest-priority backend gaps

1. **Risk service contract mismatch.** `src/risk/services/risk-scoring.adapter.ts` sends camel-case activity features using Bearer authentication and requires `{score: 0..1, reasons, confidence}`. `ai-services/app/schemas/risk.py` requires customer/tenure/charges/login fields and returns `risk_score: 0..100`, factors and actions; its configured authentication uses `X-API-Key`. Pointing the existing adapter at this service will not work without contract translation/agreement. This is backend integration work, not a request to change the AI algorithm.
2. **Provider coverage is partial.** `src/integrations/provider-registry.ts` routes many sync operations, three email providers, and OAuth flows through `PROVIDER_BRIDGES_JSON`. No bridge implementation is supplied here. Several old provider-specific adapter files still return empty arrays or unconditional success; these are unused scaffolds, not evidence of working integrations.
3. **Email opt-outs are not enforced.** The webhook worker sets `student.emailOptOut`, but `src/workers/notification/notification.processor.ts` does not check it before sending email.
4. **Notification retry and campaign completion defects.** Delivery's catch block includes failures after a provider has accepted the message, including accounting and campaign finalization. It can reset a sent log to RETRYING and send again. Final failure marks a recipient FAILED without calling campaign completion, so a campaign can remain RUNNING. Deleted-student early returns also leave recipients pending.
5. **Automation trigger paths are incomplete.** The evaluator accepts inactivity and manual events, but no producer for those events was found. The scheduler injects the automation queue without scheduling inactivity scans. Dispatched execution records are not completed/failed after downstream delivery.
6. **Invitations stop at persistence.** `src/memberships/memberships.service.ts` writes a PENDING membership with no user ID. It does not deliver an invitation or implement acceptance.
7. **Tenant reference and sync validation gaps.** Activity ingestion writes caller-provided student IDs without checking tenant ownership. Sync looks up student/course external IDs without first requiring those fields; undefined values can cause Prisma to omit filters and select an unrelated record within the tenant.
8. **Campaign pause/resume is absent.** The update DTO has no status field, while the service rejects edits to running campaigns. Archiving sets PAUSED, but is not a complete pause/resume workflow.
9. **Usage tracking is not quota enforcement.** Billing reports usage and scheduled warnings, but student/course/import and email operations do not consistently reject work exceeding the configured caps.

## Verification scope

The repository has four unit-test source files. Integration and end-to-end test directories contain README placeholders. Compilation and those unit tests are useful checks, but cannot establish real database/provider/worker workflow completion. See the accompanying audit response for the fresh build/test results.

Recommended order: tenant/reference checks and notification defects; AI contract alignment; invitation/automation/campaign workflows; provider implementations; quota enforcement; then database-backed and provider-sandbox acceptance testing with the responsible teams.
