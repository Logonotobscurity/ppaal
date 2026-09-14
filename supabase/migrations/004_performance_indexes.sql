-- ============================================================
-- PAL: Meaning-to-Action Intelligence
-- Migration 004: Performance Indexes + pg-boss Setup
-- Description: Additional B-tree indexes and job queue infrastructure
-- ============================================================

-- ============================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_voice_sessions_workspace_created 
ON voice_sessions(workspace_id, created_at DESC);

CREATE INDEX idx_merchant_entities_workspace_type 
ON merchant_entities(workspace_id, type);

CREATE INDEX idx_workflow_nodes_workspace_status 
ON workflow_nodes(workspace_id, status) 
WHERE status IN ('pending', 'staged', 'executing');

CREATE INDEX idx_approval_queue_workspace_status_expires
ON approval_queue(workspace_id, status, expires_at)
WHERE status = 'pending';

CREATE INDEX idx_collections_ladder_workspace_due
ON collections_ladder(workspace_id, due_date)
WHERE resolved_at IS NULL;

-- Partial indexes for high-selectivity queries
CREATE INDEX idx_workflow_nodes_pending_scheduled
ON workflow_nodes(scheduled_for)
WHERE status = 'pending' AND scheduled_for IS NOT NULL;

CREATE INDEX idx_approval_queue_expiring_soon
ON approval_queue(expires_at)
WHERE status = 'pending' AND expires_at < NOW() + INTERVAL '24 hours';

CREATE INDEX idx_collections_ladder_overdue
ON collections_ladder(due_date)
WHERE current_stage NOT IN ('collected', 'written_off')
  AND due_date < CURRENT_DATE;

-- Text search indexes (if needed for full-text search)
-- CREATE INDEX idx_merchant_entities_name_trgm ON merchant_entities USING GIN (name gin_trgm_ops);
-- CREATE INDEX idx_mesh_memories_content_trgm ON mesh_memories USING GIN (content gin_trgm_ops);

-- ============================================================
-- PG-BOSS JOB QUEUE SETUP
-- Required for durable workflow execution (Layer 3)
-- ============================================================

-- pg-boss will create its own schema and tables when initialized
-- This migration ensures the extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a job queue metadata table for tracking
CREATE TABLE IF NOT EXISTS job_queue_metadata (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO job_queue_metadata (key, value) VALUES
  ('quiet_hours', '{"start": "21:00", "end": "08:00", "timezone": "Africa/Lagos"}'),
  ('retry_policy', '{"max_attempts": 3, "backoff_multiplier": 2.0, "initial_delay_ms": 1000}'),
  ('collection_schedule', '{"initial_reminder": 1, "follow_up_1": 3, "follow_up_2": 7, "final_notice": 14, "escalated": 30}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- HELPER FUNCTIONS FOR QUIET HOURS ENFORCEMENT
-- ============================================================

/**
 * Check if current time is within quiet hours (21:00-08:00 WAT)
 * Returns TRUE if in quiet hours, FALSE otherwise
 */
CREATE OR REPLACE FUNCTION is_quiet_hours()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_hour INTEGER;
  wat_time TIMESTAMPTZ;
BEGIN
  -- Convert to West Africa Time (UTC+1)
  wat_time := NOW() AT TIME ZONE 'Africa/Lagos';
  current_hour := EXTRACT(HOUR FROM wat_time);
  
  -- Quiet hours: 21:00 - 08:00
  RETURN (current_hour >= 21 OR current_hour < 8);
END;
$$;

/**
 * Calculate next allowed execution time (after quiet hours)
 * @param requested_time - When the job was requested
 * @returns The next time the job can execute (outside quiet hours)
 */
CREATE OR REPLACE FUNCTION get_next_allowed_execution_time(requested_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  wat_time TIMESTAMPTZ;
  current_hour INTEGER;
  next_morning TIMESTAMPTZ;
BEGIN
  wat_time := requested_time AT TIME ZONE 'Africa/Lagos';
  current_hour := EXTRACT(HOUR FROM wat_time);
  
  -- If in quiet hours, schedule for 08:00 next day
  IF current_hour >= 21 OR current_hour < 8 THEN
    next_morning := DATE(wat_time + INTERVAL '1 day') + INTERVAL '8 hours';
    RETURN next_morning AT TIME ZONE 'Africa/Lagos' AT TIME ZONE 'UTC';
  END IF;
  
  -- Otherwise, execute immediately (return input)
  RETURN requested_time;
END;
$$;

/**
 * Enforce quiet hours on a scheduled time
 * If requested time falls in quiet hours, push to 08:00 next day
 */
CREATE OR REPLACE FUNCTION enforce_quiet_hours(scheduled_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_quiet_hours() THEN
    RETURN get_next_allowed_execution_time(scheduled_time);
  END IF;
  RETURN scheduled_time;
END;
$$;

-- ============================================================
-- TRIGGER: Auto-enforce quiet hours on workflow_nodes
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_enforce_quiet_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scheduled_for IS NOT NULL THEN
    NEW.scheduled_for := enforce_quiet_hours(NEW.scheduled_for);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_workflow_nodes_quiet_hours
BEFORE INSERT OR UPDATE ON workflow_nodes
FOR EACH ROW
EXECUTE FUNCTION trigger_enforce_quiet_hours();

-- ============================================================
-- TRIGGER: Auto-enforce quiet hours on collections_ladder
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_collections_next_action()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_action_date IS NOT NULL THEN
    -- Convert date to timestamp and enforce quiet hours
    NEW.next_action_date := DATE(enforce_quiet_hours(
      NEW.next_action_date::TIMESTAMPTZ
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_collections_quiet_hours
BEFORE INSERT OR UPDATE ON collections_ladder
FOR EACH ROW
EXECUTE FUNCTION trigger_collections_next_action();

-- ============================================================
-- SEED DATA (for development/testing only)
-- ============================================================

-- Create a test workspace and user (remove in production)
DO $$
DECLARE
  test_user_id UUID;
  test_workspace_id UUID;
BEGIN
  -- Only run in development environment
  IF current_setting('app.environment', TRUE) = 'development' THEN
    -- Create test user (you'll need to create via Supabase auth in real app)
    -- This is just a placeholder
    
    -- Create test workspace
    INSERT INTO workspaces (name, type, owner_id)
    VALUES ('Test Commerce Workspace', 'commerce', 
            '00000000-0000-0000-0000-000000000000'::UUID)
    RETURNING id INTO test_workspace_id;
    
    RAISE NOTICE 'Created test workspace: %', test_workspace_id;
  END IF;
END $$;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON FUNCTION is_quiet_hours IS 'Check if current time is within quiet hours (21:00-08:00 WAT)';
COMMENT ON FUNCTION get_next_allowed_execution_time IS 'Calculate next allowed execution time after quiet hours';
COMMENT ON FUNCTION enforce_quiet_hours IS 'Enforce quiet hours on scheduled times';
COMMENT ON TABLE job_queue_metadata IS 'Configuration for pg-boss job queue and quiet hours';
COMMENT ON TRIGGER trg_workflow_nodes_quiet_hours ON workflow_nodes IS 'Auto-enforce quiet hours on workflow scheduling';
COMMENT ON TRIGGER trg_collections_quiet_hours ON collections_ladder IS 'Auto-enforce quiet hours on collection actions';
