# Retainly Database Setup Guide

## Quick Start

### Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- npm or yarn package manager

---

## Step 1: Install Dependencies

```bash
cd apps/api
npm install
```

This installs Prisma and all required dependencies.

---

## Step 2: Configure Database Connection

Create a `.env` file in the `apps/api` directory:

```bash
# Copy the example
cp ../../.env.example .env
```

Edit `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/retainly?schema=public"
```

**Replace:**
- `username` - Your PostgreSQL username
- `password` - Your PostgreSQL password
- `localhost:5432` - Your PostgreSQL host and port
- `retainly` - Your database name

**Example for local development:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/retainly?schema=public"
```

---

## Step 3: Create Database

Create the database in PostgreSQL:

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE retainly;"

# Or using createdb command
createdb -U postgres retainly
```

---

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

This generates the TypeScript client from your schema.

---

## Step 5: Run Migration

You have two options:

### Option A: Direct SQL Migration (Recommended for Initial Setup)

```bash
psql -U postgres -d retainly -f prisma/migrations/0001_initial_retainly_schema.sql
```

This runs the complete SQL migration file with all tables, indexes, RLS policies, and triggers.

### Option B: Prisma Migrate

```bash
# Push the schema to database
npx prisma db push

# OR create a new migration
npx prisma migrate dev --name init
```

---

## Step 6: Verify Schema

```bash
# Validate the Prisma schema
npx prisma validate

# View the database in Prisma Studio
npx prisma studio
```

Prisma Studio will open at `http://localhost:5555` - you can browse all tables and relationships.

---

## Step 7: Seed Demo Data

```bash
npx prisma db seed
```

This creates:
- 2 demo organizations
- 3 users with memberships
- 3 courses
- 7 students with enrollments
- 20+ activity events
- 5 risk scores
- 2 retention campaigns
- Message actions, automation rules, integrations, and more

**Output:**
```
🌱 Seeding Retainly database...

Creating organizations...
✓ Created 2 organizations

Creating users...
✓ Created 3 users

...

✅ Database seeded successfully!
```

---

## Step 8: Test Database Queries

Create a test script `apps/api/test-db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all organizations
  const orgs = await prisma.organization.findMany();
  console.log('Organizations:', orgs);

  // Get students with their enrollments
  const students = await prisma.student.findMany({
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
      riskScores: {
        orderBy: {
          calculatedAt: 'desc',
        },
        take: 1,
      },
    },
  });
  console.log('Students:', JSON.stringify(students, null, 2));

  // Get high-risk students
  const highRisk = await prisma.student.findMany({
    where: {
      riskScores: {
        some: {
          riskLevel: 'HIGH',
        },
      },
    },
    include: {
      riskScores: {
        orderBy: {
          calculatedAt: 'desc',
        },
        take: 1,
      },
    },
  });
  console.log('High-risk students:', highRisk);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
npx ts-node test-db.ts
```

---

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Solution:** Make sure `.env` file exists in `apps/api/` directory with `DATABASE_URL` defined.

### Error: "Can't reach database server"

**Solution:** 
1. Verify PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
2. Check connection details in `.env`
3. Ensure PostgreSQL accepts connections (check `pg_hba.conf`)

### Error: "database does not exist"

**Solution:** Create the database first:
```bash
createdb -U postgres retainly
```

### Error: "permission denied to create extension"

**Solution:** Grant permissions or use superuser:
```bash
psql -U postgres -d retainly -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

### Error: Prisma Client not found

**Solution:** Generate the client:
```bash
npx prisma generate
```

---

## PostgreSQL Configuration Tips

### Enable UUID Extension

If migration fails with "uuid-ossp extension not found":

```sql
-- Connect as superuser
psql -U postgres -d retainly

-- Enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Row Level Security (RLS)

The migration enables RLS policies. To use them in your application:

```typescript
// Set current organization context
await prisma.$executeRaw`
  SET LOCAL app.current_organization_id = ${organizationId}::uuid
`;

// All subsequent queries will be filtered by organization
const students = await prisma.student.findMany(); // Only current org's students
```

**Note:** RLS is optional but recommended for production. For development, you can disable it:

```sql
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
```

### Performance Tuning

For production, consider these PostgreSQL settings:

```conf
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
```

---

## Database Backup & Restore

### Backup

```bash
# Full database backup
pg_dump -U postgres retainly > retainly_backup.sql

# Schema only
pg_dump -U postgres --schema-only retainly > retainly_schema.sql

# Data only
pg_dump -U postgres --data-only retainly > retainly_data.sql
```

### Restore

```bash
# Restore full backup
psql -U postgres -d retainly < retainly_backup.sql

# Restore to new database
createdb -U postgres retainly_restored
psql -U postgres -d retainly_restored < retainly_backup.sql
```

---

## Docker Setup (Optional)

If you prefer running PostgreSQL in Docker:

### 1. Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: retainly_postgres
    environment:
      POSTGRES_USER: retainly_user
      POSTGRES_PASSWORD: retainly_password
      POSTGRES_DB: retainly
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U retainly_user']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 2. Start PostgreSQL:

```bash
docker-compose up -d
```

### 3. Update `.env`:

```env
DATABASE_URL="postgresql://retainly_user:retainly_password@localhost:5432/retainly?schema=public"
```

### 4. Run migrations:

```bash
npx prisma db push
npx prisma db seed
```

---

## Development Workflow

### Making Schema Changes

1. Edit `schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name add_new_field
   ```
3. Prisma generates SQL and applies it
4. Commit both `schema.prisma` and migration files

### Resetting Database

**Warning:** This deletes all data!

```bash
npx prisma migrate reset
```

This will:
1. Drop database
2. Create database
3. Run all migrations
4. Run seed script

### Viewing Database

```bash
# Prisma Studio (GUI)
npx prisma studio

# psql CLI
psql -U postgres -d retainly

# Sample queries
SELECT * FROM organizations;
SELECT * FROM students WHERE email LIKE '%@gmail.com';
SELECT * FROM risk_scores ORDER BY calculated_at DESC LIMIT 10;
```

---

## Production Deployment

### 1. Environment Variables

Set these in your production environment:

```env
DATABASE_URL="postgresql://user:password@prod-host:5432/retainly_prod?schema=public&sslmode=require"
```

**Important:** Use SSL in production (`sslmode=require`)

### 2. Run Migrations

```bash
npx prisma migrate deploy
```

**Note:** Use `migrate deploy` (not `migrate dev`) in production.

### 3. Generate Client

```bash
npx prisma generate
```

### 4. Connection Pooling

Use a connection pooler like PgBouncer for production:

```env
# Direct connection (for migrations)
DATABASE_URL="postgresql://user:password@host:5432/retainly?schema=public"

# Pooled connection (for app)
DATABASE_URL_POOLED="postgresql://user:password@pooler:6543/retainly?schema=public"
```

Update Prisma Client:

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POOLED,
    },
  },
});
```

---

## Monitoring

### Check Database Size

```sql
SELECT
  pg_size_pretty(pg_database_size('retainly')) AS database_size;
```

### Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

### Check Index Usage

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Slow Queries

Enable slow query logging in `postgresql.conf`:

```conf
log_min_duration_statement = 1000  # Log queries slower than 1 second
```

---

## Support

For questions or issues:
- Review: `DATABASE_DOCUMENTATION.md`
- Check: `ER_DIAGRAM.md`
- Prisma Docs: https://www.prisma.io/docs

---

**Version:** 1.0.0
**Last Updated:** February 2024
