-- ============================================================
-- PAL: Meaning-to-Action Intelligence
-- Migration 002: Vector Indexes (HNSW for Semantic Search)
-- Description: HNSW indexes for pgvector semantic similarity search
-- ============================================================

-- ============================================================
-- HNSW INDEXES FOR SEMANTIC SEARCH
-- Using multilingual-e5-base embeddings (768 dimensions)
-- Parameters: m=16, ef=64 (balanced speed/accuracy)
-- ============================================================

-- Merchant Entities HNSW Index
-- For finding similar customers/suppliers/items by name or description
CREATE INDEX idx_merchant_entities_embedding 
ON merchant_entities 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Mesh Memories HNSW Index
-- For RAG semantic recall (k=7 nearest neighbors)
CREATE INDEX idx_mesh_memories_embedding 
ON mesh_memories 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- ============================================================
-- CONFIGURE HNSW SEARCH PARAMETERS
-- These can be adjusted per-query for speed vs accuracy tradeoff
-- ============================================================

-- Default ef_search for balance (can override in queries)
-- SET hnsw.ef_search = 64;

-- ============================================================
-- HELPER FUNCTIONS FOR SEMANTIC SEARCH
-- ============================================================

/**
 * Find similar merchant entities by embedding
 * @param query_embedding - 768-dim vector from multilingual-e5-base
 * @param match_threshold - Minimum cosine similarity (0.0 to 1.0)
 * @param match_count - Maximum number of results
 * @param ws_id - Workspace ID for tenant isolation
 */
CREATE OR REPLACE FUNCTION match_merchant_entities(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INTEGER DEFAULT 10,
  ws_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  type entity_type,
  name TEXT,
  description TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.id,
    me.workspace_id,
    me.type,
    me.name,
    me.description,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM merchant_entities me
  WHERE 1 - (me.embedding <=> query_embedding) > match_threshold
    AND (ws_id IS NULL OR me.workspace_id = ws_id)
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

/**
 * Find similar mesh memories by embedding (RAG retrieval)
 * @param query_embedding - 768-dim vector from multilingual-e5-base
 * @param match_threshold - Minimum cosine similarity (0.0 to 1.0)
 * @param match_count - Maximum number of results (typically k=7)
 * @param ws_id - Workspace ID for tenant isolation
 */
CREATE OR REPLACE FUNCTION match_mesh_memories(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INTEGER DEFAULT 7,
  ws_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  content TEXT,
  summary TEXT,
  tags TEXT[],
  source_type TEXT,
  source_id UUID,
  confidence NUMERIC,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mm.id,
    mm.workspace_id,
    mm.content,
    mm.summary,
    mm.tags,
    mm.source_type,
    mm.source_id,
    mm.confidence,
    1 - (mm.embedding <=> query_embedding) AS similarity
  FROM mesh_memories mm
  WHERE 1 - (mm.embedding <=> query_embedding) > match_threshold
    AND (ws_id IS NULL OR mm.workspace_id = ws_id)
  ORDER BY mm.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON INDEX idx_merchant_entities_embedding IS 'HNSW index for semantic search of merchant entities (multilingual-e5-base, 768-dim)';
COMMENT ON INDEX idx_mesh_memories_embedding IS 'HNSW index for RAG semantic recall (k=7 default)';
COMMENT ON FUNCTION match_merchant_entities IS 'Find similar entities by embedding with tenant isolation';
COMMENT ON FUNCTION match_mesh_memories IS 'RAG retrieval function for semantic memory with tenant isolation';
