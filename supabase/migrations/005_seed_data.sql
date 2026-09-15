-- Optional: Seed data for testing
-- Run this manually in Supabase SQL Editor if you want sample data

-- Create a test workspace
-- INSERT INTO workspaces (id, name, type, owner_id)
-- VALUES ('test-workspace-uuid', 'My Test Workspace', 'commerce', auth.uid());

-- Create sample entities
-- INSERT INTO merchant_entities (workspace_id, name, type, embedding)
-- SELECT 
--   'test-workspace-uuid',
--   'Sample Customer',
--   'customer',
--   pgvector.vector_out('[0.1, 0.2, 0.3]'::vector);
