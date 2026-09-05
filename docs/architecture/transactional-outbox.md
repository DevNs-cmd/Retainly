# Transactional Outbox Pattern

To prevent dual-write bugs where database writes succeed but Redis/queue publishing fails, Retainly writes outbox events into PostgreSQL in the same transaction as domain model changes.

```sql
BEGIN TRANSACTION;
  INSERT INTO student_activities (...);
  INSERT INTO outbox_events (id, event_type, payload, status) VALUES (...);
COMMIT;
```

The Outbox Publisher processes pending events and pushes them to BullMQ.
