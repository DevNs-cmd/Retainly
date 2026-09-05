# Event-Driven Architecture

Retainly uses canonical internal events to decouple third-party platforms from core risk/automation processing.

## Event Processing Pipeline
1. External Webhook (e.g. Thinkific / Kajabi) -> NestJS Webhook Controller
2. Raw webhook normalized into canonical `student.activity.completed` event.
3. Activity record + Outbox record committed inside PostgreSQL transaction.
4. Outbox Publisher polling/listening -> BullMQ Queue.
5. Workers process canonical event idempotently.
