-- 20251208_zoning_support.sql
-- Zoning support for Market Space

-- Add zoning-related fields to spaces table
ALTER TABLE spaces
ADD COLUMN IF NOT EXISTS zoning_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS zoning_source TEXT,
ADD COLUMN IF NOT EXISTS zoning_last_checked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS zoning_confidence INTEGER,
ADD COLUMN IF NOT EXISTS host_zoning_certified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS zoning_notes TEXT;

-- Optional: table to record zoning lookups / audits
CREATE TABLE IF NOT EXISTS zoning_lookups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    zoning_code VARCHAR(50),
    raw_response JSONB,
    source TEXT,
    confidence INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster zoning lookups
CREATE INDEX IF NOT EXISTS idx_spaces_zoning_code ON spaces(zoning_code);
CREATE INDEX IF NOT EXISTS idx_zoning_lookups_space ON zoning_lookups(space_id);
CREATE INDEX IF NOT EXISTS idx_zoning_lookups_created ON zoning_lookups(created_at DESC);

-- RLS policies for zoning_lookups
ALTER TABLE zoning_lookups ENABLE ROW LEVEL SECURITY;

-- Hosts can view zoning lookups for their spaces
CREATE POLICY "Hosts can view zoning lookups for own spaces" ON zoning_lookups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = zoning_lookups.space_id
            AND spaces.owner_id = auth.uid()
        )
    );

-- Service role can insert zoning lookups (for automated checks)
CREATE POLICY "Service can insert zoning lookups" ON zoning_lookups
    FOR INSERT WITH CHECK (true);

-- Comment documentation
COMMENT ON COLUMN spaces.zoning_code IS 'Zoning designation (e.g., C-2, M-1, R-3)';
COMMENT ON COLUMN spaces.zoning_source IS 'Source of zoning data (e.g., city API, manual entry)';
COMMENT ON COLUMN spaces.zoning_last_checked_at IS 'Last time zoning was verified';
COMMENT ON COLUMN spaces.zoning_confidence IS 'Confidence score 0-100 for automated lookups';
COMMENT ON COLUMN spaces.host_zoning_certified IS 'Host has certified zoning is correct';
COMMENT ON COLUMN spaces.zoning_notes IS 'Additional notes about zoning or permitted uses';

COMMENT ON TABLE zoning_lookups IS 'Audit trail of all zoning lookups and API calls';
COMMENT ON COLUMN zoning_lookups.raw_response IS 'Full API response for debugging/auditing';
