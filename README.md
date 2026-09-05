# Retainly

AI-powered retention platform for online course and coaching businesses.

## Architecture Highlights
- **Modular Monolith** built with NestJS & Next.js.
- **Transactional Outbox Pattern** for guaranteed event delivery.
- **BullMQ & Redis** for resilient background worker processing.
- **PostgreSQL RLS Multi-tenancy** scoped by `organization_id`.
- **Provider Adapters** for external integrations (Kajabi, Stripe, Mailchimp, etc.).

## Quick Start
1. Copy `.env.example` to `.env`.
2. Start PostgreSQL & Redis: `docker-compose up -d`
3. Install dependencies: `pnpm install`
4. Run development: `pnpm dev`
