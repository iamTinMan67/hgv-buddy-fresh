-- Migration: Add special_requirements column to jobs table
-- Run this in your Supabase SQL Editor

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS special_requirements TEXT;

-- Add comment to column
COMMENT ON COLUMN jobs.special_requirements IS 'Special requirements and metadata for the job (can contain JSON metadata prefixed with METADATA:)';

