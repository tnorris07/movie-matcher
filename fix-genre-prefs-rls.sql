-- Add missing RLS policies for user_genre_preferences table
-- These policies allow the database triggers to update genre preferences when users swipe

CREATE POLICY "Users can insert their own genre preferences"
  ON user_genre_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genre preferences"
  ON user_genre_preferences FOR UPDATE
  USING (auth.uid() = user_id);
