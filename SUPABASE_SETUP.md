# Supabase Setup Guide for PAL

Your Supabase project is configured and ready. Follow these steps to complete the setup.

## ✅ Configuration Complete

**Project URL:** https://wbxsxwgopveolzlckqun.supabase.co  
**Environment File:** `.env.local` (created with your credentials)

---

## 📋 Migration Files Ready

5 migration files are ready in `/supabase/migrations/`:

| File | Size | Purpose |
|------|------|---------|
| `001_initial_schema.sql` | 11.5 KB | 9 tables, enums, triggers, basic indexes |
| `002_vector_indexes.sql` | 4.3 KB | HNSW indexes (m=16, ef=64), semantic search functions |
| `003_rls_policies.sql` | 9.7 KB | FORCE RLS on all tables, tenant isolation policies |
| `004_performance_indexes.sql` | 7.6 KB | Composite indexes, quiet hours enforcement, pg-boss setup |
| `005_seed_data.sql` | 0.5 KB | Optional test data (commented out by default) |

**Total:** ~34 KB of production-ready SQL

---

## 🚀 Apply Migrations (Choose One Method)

### Method A: Supabase Dashboard (Recommended)

1. **Go to** https://app.supabase.com/project/wbxsxwgopveolzlckqun/editor
2. **Click "SQL Editor"** in the left sidebar
3. **Copy and paste each file in order:**

   ```bash
   # Open each file and copy contents:
   cat supabase/migrations/001_initial_schema.sql      # → Paste in SQL Editor → Run
   cat supabase/migrations/002_vector_indexes.sql      # → Paste in SQL Editor → Run
   cat supabase/migrations/003_rls_policies.sql        # → Paste in SQL Editor → Run
   cat supabase/migrations/004_performance_indexes.sql # → Paste in SQL Editor → Run
   ```

4. **Verify success:** Each migration should show "Success. No rows returned"

### Method B: Supabase CLI

```bash
# Install CLI (if not already installed)
npm install -g supabase

# Login (opens browser)
supabase login

# Link to your project
supabase link --project-ref wbxsxwgopveolzlckqun

# Push all migrations
supabase db push
```

### Method C: Direct Connection String

Use the connection string from `.env.local` with a PostgreSQL client:

```bash
psql "postgresql://postgres:Logors1!9.com@db.wbxsxwgopveolzlckqun.supabase.co:5432/postgres"
```

Then run:
```sql
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_vector_indexes.sql
\i supabase/migrations/003_rls_policies.sql
\i supabase/migrations/004_performance_indexes.sql
```

---

## 🔍 Verify Installation

After applying migrations, run these verification queries in SQL Editor:

### Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
*Expected: 20+ tables including profiles, workspaces, voice_sessions, merchant_entities, mesh_memories, etc.*

### Check RLS Policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```
*Expected: RLS policies on all tables*

### Check Vector Extension
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```
*Expected: vector extension version 0.7.0 or higher*

### Check HNSW Indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexdef LIKE '%hnsw%'
ORDER BY indexname;
```
*Expected: Multiple HNSW indexes on embedding columns*

---

## 🔐 Security Notes

- **Anon Key** (`VITE_SUPABASE_ANON_KEY`): Safe for browser usage, RLS enforced
- **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`): SECRET - only use in backend/CLI
- **Database URL** (`DATABASE_URL`): SECRET - contains password, never expose to browser
- **RLS is enabled** on all tables with FORCE ROW LEVEL SECURITY

---

## 🧪 Test Connection

Create a test file `test-supabase.ts`:

```typescript
import { supabase } from './src/lib/supabase/client';

async function testConnection() {
  const { data, error } = await supabase.from('workspaces').select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connection successful!');
  }
}

testConnection();
```

Run with: `npx tsx test-supabase.ts`

---

## 📊 What's Created

After migrations, your database will have:

- **9 Core Tables:** profiles, workspaces, voice_sessions, merchant_entities, mesh_memories, entity_links, workflow_nodes, approval_queue, collections_ladder
- **10+ Supporting Tables:** audit logs, failure replays, benchmarks, activity trails, etc.
- **Enums:** workspace_type, entity_type, relationship_type, voice_state, gs_threshold_category, collection_status, approval_decision
- **Indexes:** 30+ indexes including 8 HNSW vector indexes for semantic search
- **RLS Policies:** Full tenant isolation on every table
- **Triggers:** updated_at timestamps, automatic profile creation
- **Functions:** semantic search, workspace switching, quiet hours checking

---

## Next Steps

1. ✅ Apply migrations using one of the methods above
2. ✅ Verify installation with test queries
3. ✅ Update `.env.local` with ANTHROPIC_API_KEY for LLM features
4. ✅ Run `npm run build` to verify everything compiles
5. ✅ Deploy to Vercel: `vercel --prod`

**Support:** If you encounter issues, check the Supabase logs at https://app.supabase.com/project/wbxsxwgopveolzlckqun/logs
