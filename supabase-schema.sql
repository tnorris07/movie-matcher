-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for swipe types
CREATE TYPE swipe_type AS ENUM ('yes', 'no', 'seen_yes', 'seen_no');

-- Couples table
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invite_code TEXT UNIQUE NOT NULL,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on user IDs for faster lookups
CREATE INDEX idx_couples_user1 ON couples(user1_id);
CREATE INDEX idx_couples_user2 ON couples(user2_id);
CREATE INDEX idx_couples_invite_code ON couples(invite_code);

-- Movies table
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  runtime INTEGER NOT NULL,
  director TEXT NOT NULL,
  movie_cast TEXT[] NOT NULL DEFAULT '{}',
  plot_synopsis TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  trailer_url TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  tmdb_rating DECIMAL(3,1) NOT NULL,
  rt_score INTEGER,
  imdb_rating DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for movie searches
CREATE INDEX idx_movies_year ON movies(year);
CREATE INDEX idx_movies_genres ON movies USING GIN(genres);
CREATE INDEX idx_movies_tmdb_rating ON movies(tmdb_rating DESC);

-- Swipes table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE NOT NULL,
  swipe_type swipe_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Create indexes for swipe lookups
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_movie_id ON swipes(movie_id);
CREATE INDEX idx_swipes_user_movie ON swipes(user_id, movie_id);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(couple_id, movie_id)
);

-- Create indexes for match lookups
CREATE INDEX idx_matches_couple_id ON matches(couple_id);
CREATE INDEX idx_matches_movie_id ON matches(movie_id);
CREATE INDEX idx_matches_watched ON matches(watched);

-- User genre preferences tracking table
CREATE TABLE user_genre_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  genre TEXT NOT NULL,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  PRIMARY KEY(user_id, genre)
);

-- Create index for user genre lookups
CREATE INDEX idx_user_genre_prefs_user_id ON user_genre_preferences(user_id);

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check for matching swipes and create match
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
  partner_id UUID;
  couple_record RECORD;
  partner_swipe_record RECORD;
  is_match BOOLEAN := FALSE;
BEGIN
  -- Find the user's couple
  SELECT * INTO couple_record
  FROM couples
  WHERE user1_id = NEW.user_id OR user2_id = NEW.user_id;

  -- If no couple found, return
  IF couple_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine partner ID
  IF couple_record.user1_id = NEW.user_id THEN
    partner_id := couple_record.user2_id;
  ELSE
    partner_id := couple_record.user1_id;
  END IF;

  -- If partner doesn't exist yet, return
  IF partner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get partner's swipe for this movie
  SELECT * INTO partner_swipe_record
  FROM swipes
  WHERE user_id = partner_id AND movie_id = NEW.movie_id;

  -- If partner hasn't swiped, return
  IF partner_swipe_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check for match conditions
  -- Match if: both yes, both seen_yes, or one yes + one seen_yes
  IF (NEW.swipe_type = 'yes' AND partner_swipe_record.swipe_type = 'yes') OR
     (NEW.swipe_type = 'seen_yes' AND partner_swipe_record.swipe_type = 'seen_yes') OR
     (NEW.swipe_type = 'yes' AND partner_swipe_record.swipe_type = 'seen_yes') OR
     (NEW.swipe_type = 'seen_yes' AND partner_swipe_record.swipe_type = 'yes') THEN
    is_match := TRUE;
  END IF;

  -- Create match if conditions are met
  IF is_match THEN
    INSERT INTO matches (couple_id, movie_id)
    VALUES (couple_record.id, NEW.movie_id)
    ON CONFLICT (couple_id, movie_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check for matches after swipe
CREATE TRIGGER trigger_check_match
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_and_create_match();

-- Function to update genre preferences
CREATE OR REPLACE FUNCTION update_genre_preferences()
RETURNS TRIGGER AS $$
DECLARE
  genre_item TEXT;
  is_positive BOOLEAN;
BEGIN
  -- Determine if swipe is positive or negative
  is_positive := (NEW.swipe_type = 'yes' OR NEW.swipe_type = 'seen_yes');

  -- Get genres for the movie
  FOR genre_item IN
    SELECT unnest(genres) FROM movies WHERE id = NEW.movie_id
  LOOP
    -- Insert or update genre preference
    INSERT INTO user_genre_preferences (user_id, genre, positive_count, negative_count)
    VALUES (
      NEW.user_id,
      genre_item,
      CASE WHEN is_positive THEN 1 ELSE 0 END,
      CASE WHEN is_positive THEN 0 ELSE 1 END
    )
    ON CONFLICT (user_id, genre)
    DO UPDATE SET
      positive_count = user_genre_preferences.positive_count + CASE WHEN is_positive THEN 1 ELSE 0 END,
      negative_count = user_genre_preferences.negative_count + CASE WHEN is_positive THEN 0 ELSE 1 END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update genre preferences after swipe
CREATE TRIGGER trigger_update_genre_prefs
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION update_genre_preferences();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_genre_preferences ENABLE ROW LEVEL SECURITY;

-- Couples policies
CREATE POLICY "Users can view their own couples"
  ON couples FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create couples"
  ON couples FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their couples to add partner"
  ON couples FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Swipes policies
CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view matches for their couple"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = matches.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update matches for their couple"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = matches.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

-- User genre preferences policies
CREATE POLICY "Users can view their own genre preferences"
  ON user_genre_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own genre preferences"
  ON user_genre_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genre preferences"
  ON user_genre_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Movies table is public (no RLS needed for read-only access)
-- But we'll enable RLS anyway for consistency
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view movies"
  ON movies FOR SELECT
  USING (true);
