export type SwipeType = 'yes' | 'no' | 'seen_yes' | 'seen_no';

export interface Movie {
  id: number;
  title: string;
  year: number;
  runtime: number;
  director: string;
  movie_cast: string[];
  plot_synopsis: string;
  poster_url: string;
  trailer_url: string | null;
  genres: string[];
  tmdb_rating: number;
  rt_score: number | null;
  imdb_rating: number | null;
  created_at?: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  movie_id: number;
  swipe_type: SwipeType;
  created_at: string;
}

export interface Couple {
  id: string;
  created_at: string;
  invite_code: string;
  user1_id: string;
  user2_id: string | null;
}

export interface Match {
  id: string;
  couple_id: string;
  movie_id: number;
  created_at: string;
  watched: boolean;
  watched_at: string | null;
  movie?: Movie;
}

export interface UserGenrePreference {
  user_id: string;
  genre: string;
  positive_count: number;
  negative_count: number;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
  };
}

export interface MovieWithSwipe extends Movie {
  user_swipe?: Swipe;
  partner_swipe?: Swipe;
}
