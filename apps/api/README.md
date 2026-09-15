# Retainly API implementation status

This checkout contains a **partial implementation**, not the complete backend in the supplied brief.
The original Prisma schema is unchanged. It contains only Organization (id/name/timestamps),
StudentActivity, and OutboxEvent. Most requested features cannot persist their data using that client.

## Implemented and wired

- Nest configuration, Helmet, explicit CORS allowlist, raw request bodies, global validation,
  safe exception mapping, structured Pino logs, Swagger at /api/docs, rate limiting.
- Clerk/Auth0 JWT validation through the configured issuer's JWKS; RS256, issuer, audience,
  expiry, subject, issued-at and trusted organization/role claims are required.
- Request-scoped TenantContext, CurrentUser/Public/Roles decorators and role guards.
  Roles currently come from signed identity-provider organization claims; local Membership
  verification is pending the missing table. Configure explicit owner/admin/coach/viewer claims.
  Clerk's default role set may require custom roles or a server-controlled token template.
- Shared Prisma and Redis modules and registration of all seven existing queue names.
  Queue names are preserved from the repository to avoid silently changing consumers.
- GET /api/activities and POST /api/activities[/batch], including pagination/filtering,
  tenant predicates, DTO validation, and atomic activity/outbox transactions.
- Transactional outbox publisher in the worker process: 5-second polling, SKIP LOCKED,
  fanout routing, stable job IDs, retry accounting, and FAILED status after ten failed deliveries.
- Stripe payment activity ingress: POST /api/webhooks/stripe, 1000 requests/minute,
  raw-body HMAC/timestamp verification, Redis SET NX, and durable activity identity.
  Supported events: payment_intent.succeeded, payment_intent.payment_failed,
  invoice.paid, invoice.payment_failed. Metadata must contain studentId.
- Standalone worker bootstrap, webhook worker and completed/failed/stalled logs.
- Real activity feature extraction and an injectable AI scoring contract/HTTP adapter.
  No scoring algorithm or synthetic score is provided.
- GET /api/health checks PostgreSQL and Redis; all other public access is explicit.

The existing GET /api/risk/scores now returns 503 because RiskSnapshot is unavailable;
it no longer falsely returns an empty successful result. Other unsupported webhook providers
return 501; unsupported Stripe event types return 422.

## Pending scope

Organizations/onboarding, users/memberships, students, courses, enrollments, stored risk
snapshots/recalculation, automation, campaigns, notifications, integrations/adapters,
analytics, billing, coach tasks, audit, subscriptions, usage, and payments remain unfinished.
Their supplied module files remain scaffolds. Six queue processors remain scaffolds and are
**not registered as consumers**: sync, risk, automation, notification, analytics, billing.
Jobs routed to these queues stay queued; they must not be interpreted as processed.

Also pending: S3 CSV ingestion, local membership verification, PlanGuard, tenant caches,
global persisted audit, recurring sync/analytics/billing schedules, provider OAuth and
credential storage, notification delivery logs, payment subscription reconciliation,
and provider-specific webhook handling beyond the Stripe payment events above.

See [DATABASE-CONTRACT.md](DATABASE-CONTRACT.md) for the proposed data-team handoff.
The brief says 24 modules but only names 20 feature modules; it does not identify four
additional supporting modules.

## Development

Use the repository's approved dependency-build settings when installing:

```sh
pnpm --filter @retainly/api install
cd apps/api
cp .env.example .env
pnpm prisma:generate
pnpm build
pnpm test
pnpm start
# Separate process:
pnpm start:worker
```

Do not run migrations from this API task. Use the database team's migration process.
Prisma client generation reads the existing schema and does not migrate the database.
With pnpm 11, explicitly approve the existing allowlisted Prisma/Nest build scripts if
the package manager asks; the repository currently uses the older onlyBuiltDependencies setting.

## Operational boundaries

- Set AUTH_ISSUER/AUTH_AUDIENCE or startup fails. CORS defaults to no allowed cross-origin clients.
  AUTH_ORG_CLAIM and AUTH_ROLE_CLAIM must refer to issuer-controlled claims, never user-editable metadata.
- Until IntegrationConnection exists, Stripe ingress is bound to ONE organization via environment.
  It never takes organizationId from a body or query. Multi-organization ingress is not implemented.
- PostgreSQL cannot currently verify a student's existence or organization membership because Student
  does not exist. Activity rows are tenant-scoped, but cross-resource referential checks await the model.
- Outbox polling is the intentional privileged cross-tenant scanner. It keeps row locks in an interactive
  transaction while enqueueing; tenant predicates protect subsequent updates. Workers receive explicit
  trusted organization IDs and never depend on request-scoped context.
- A PostgreSQL/Redis dual commit is not possible. Delivery is at least once. BullMQ job IDs deduplicate
  publication replays while retained. Do not delete retained queue jobs until an operational replay
  horizon and consumer receipt policy exist. Monitor queue growth and FAILED outbox rows.
- Webhook activity IDs remain durable after Redis expiry; retrying after DB commit cannot duplicate
  activity/outbox writes. Redis must have durable persistence configured for accepted ingress jobs.
- A failed retained webhook job requires an operator retry; ingress returns 409 rather than claiming
  successful redelivery. Database outbox rows stop retrying after ten delivery failures; alert and
  investigate before resetting their status through the database team's tooling.
- Rate limiting currently uses Throttler's per-process memory store, so limits multiply across replicas.
  Distributed rate limiting requires a shared Redis Throttler storage adapter.
- /api/docs and /api/health are reachable without JWT. Health returns no database details.
  Configure ingress access controls for documentation if needed.

## Verification

The unit suite exercises signed JWT rejection, tenant boundaries, role checks, DTO validation,
Stripe replay/tampering checks, transactional write propagation, outbox partial fanout, and
Redis key/TTL behavior. Module wiring is checked with infrastructure test doubles.

Live PostgreSQL/Redis integration and provider delivery tests require running infrastructure
and credentials. Those tests have not been run in this environment.

Stripe verification follows the [official signature documentation](https://docs.stripe.com/webhooks/signature).
