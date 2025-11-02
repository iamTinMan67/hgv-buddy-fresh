-- Migration: Add estimated_duration, scheduled_date, and scheduled_time columns to jobs table
-- Run this in your Supabase SQL Editor

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME;

-- Add comments to columns
COMMENT ON COLUMN jobs.estimated_duration IS 'Estimated duration in minutes for route planning';
COMMENT ON COLUMN jobs.scheduled_date IS 'Scheduled date for pickup/delivery';
COMMENT ON COLUMN jobs.scheduled_time IS 'Scheduled time for pickup/delivery';

