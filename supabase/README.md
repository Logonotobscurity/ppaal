# Supabase Configuration

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project name: `pal-meaning-to-action`
5. Set database password (save this securely)
6. Choose region closest to your users (recommend: AWS Africa - Cape Town if available, otherwise Europe)

### 2. Run Migrations

After creating your project, run the migrations in order:

```bash
# Option A: Using Supabase CLI (recommended)
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push

# Option B: Manual SQL execution
# Copy each migration file content and run in Supabase SQL Editor:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_vector_indexes.sql
# 3. supabase/migrations/003_rls_policies.sql
# 4. supabase/migrations/004_performance_indexes.sql
```

### 3. Enable Required Extensions

In Supabase Dashboard → Database → Extensions, enable:
- ✅ `uuid-ossp` (for UUID generation)
- ✅ `vector` (for pgvector embeddings)
- ✅ `pgcrypto` (for pg-boss job queue)

### 4. Configure Auth

In Supabase Dashboard → Authentication → Providers:
- ✅ Enable Email/Password
- ✅ Enable Magic Link (optional)
- Configure email templates (optional but recommended)

### 5. Get Credentials

In Supabase Dashboard → Settings → API:
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **anon/public key** → `VITE_SUPABASE_ANON_KEY`

Add these to your `.env` file.

### 6. Generate TypeScript Types

After running migrations, generate up-to-date types:

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public \
  > src/lib/supabase/database.types.ts
```

## Migration Files Overview

| File | Purpose | Key Features |
|------|---------|--------------|
| `001_initial_schema.sql` | Core tables | 9 tables, enums, triggers, basic indexes |
| `002_vector_indexes.sql` | Semantic search | HNSW indexes (m=16, ef=64), match functions |
| `003_rls_policies.sql` | Security | FORCE RLS on all tables, tenant isolation policies |
| `004_performance_indexes.sql` | Optimization | Composite indexes, quiet hours enforcement, pg-boss setup |

## Critical Security Features

All tables have:
- ✅ **FORCE ROW LEVEL SECURITY** - Applies RLS even to table owners
- ✅ **Tenant isolation** - All queries scoped by `workspace_id`
- ✅ **Composite unique keys** - `UNIQUE(workspace_id, id)` prevents cross-tenant ID collisions
- ✅ **Auth integration** - Policies use `auth.uid()` for user identification

## Quiet Hours Enforcement

The database automatically enforces quiet hours (21:00-08:00 WAT):
- Workflows scheduled during quiet hours are pushed to 08:00 next day
- Collection actions respect the same quiet hours
- Configurable via `job_queue_metadata` table

## Testing Locally (Optional)

For local development with Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Link to local instance
supabase link --local

# Push migrations
supabase db push
```

Update `.env` with local credentials:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### RLS Policy Errors
If you get "permission denied" errors:
1. Verify RLS is enabled: `ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;`
2. Verify FORCE RLS: `ALTER TABLE your_table FORCE ROW LEVEL SECURITY;`
3. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`

### Vector Index Errors
If HNSW index creation fails:
1. Ensure `vector` extension is enabled
2. Check pgvector version: `SELECT extversion FROM pg_extension WHERE extname = 'vector';` (needs ≥ 0.7.0)
3. Reduce index size if memory is limited: `WITH (m = 8, ef_construction = 32);`

### Auth Not Working
1. Verify `VITE_SUPABASE_ANON_KEY` is correct (not the service role key)
2. Check auth hooks are registered in your app
3. Ensure user exists in `auth.users` and `public.profiles`

## Next Steps

After completing Supabase setup:
- ✅ Task 3: Design tokens (tokens.css + tailwind.config.ts)
- ✅ Task 4: shadcn/ui component installation
- ✅ Task 5: Supabase client + auth middleware (DONE)

Proceed to Task 3 or run `npm run dev` to test the current setup.
