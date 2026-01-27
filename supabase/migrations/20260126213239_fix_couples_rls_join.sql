-- Fix RLS policy for couples table to allow users to find couples by invite code
-- This is needed so a new user can look up a couple to join it

-- First, drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own couples" ON couples;

-- Create a new policy that allows:
-- 1. Users to view couples they are part of (user1_id or user2_id)
-- 2. Users to view couples that are still open for joining (user2_id IS NULL)
CREATE POLICY "Users can view couples they belong to or can join"
  ON couples FOR SELECT
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
    OR user2_id IS NULL
  );
