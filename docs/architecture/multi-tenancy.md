# Multi-Tenancy Strategy

Multi-tenancy in Retainly is based on `organization_id`.

## PostgreSQL Row Level Security (RLS)
- Every tenant query includes `organization_id`.
- Planned enforcement via PostgreSQL RLS policies ensuring strict tenant isolation at the database level.
