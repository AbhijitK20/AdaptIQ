-- Enable Supabase Realtime for real-time data synchronization
-- Run this in your Supabase SQL Editor

-- Enable realtime for question_attempts table (for accuracy tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_attempts;

-- Enable realtime for practice_sessions table (for activity metrics)
ALTER PUBLICATION supabase_realtime ADD TABLE public.practice_sessions;

-- Enable realtime for user_catalog_mastery table (for progress tracking)
-- This may already be enabled, but adding it here for completeness
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_catalog_mastery;

-- Note: If you get an error that the table is already a member, that's fine - it means realtime is already enabled.
