# Retainly Architecture Overview

Retainly is designed as a **Modular Monolith** to deliver fast performance, strong domain isolation, and high maintainability without microservice deployment overhead.

## Key Layers
1. **Frontend (apps/web)**: Next.js App Router UI. Communicates exclusively via the NestJS API.
2. **API Layer (apps/api)**: NestJS Modular Monolith containing domain modules, auth, and webhooks.
3. **Transaction & Outbox**: PostgreSQL database with outbox table for domain event consistency.
4. **Queue & Workers (apps/api src/workers)**: BullMQ workers handling heavy async workflows.
