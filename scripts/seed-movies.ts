import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TMDB_API_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error('Please ensure .env file exists with:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (get from Supabase Project Settings → API → service_role key)');
  console.error('  - VITE_TMDB_API_KEY');
  process.exit(1);
}

// Use service role key to bypass RLS for seeding
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids?: number[];
  runtime?: number;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  runtime: number;
  credits: {
    cast: { name: string; order: number }[];
    crew: { name: string; job: string }[];
  };
  videos: {
    results: { key: string; site: string; type: string }[];
  };
  imdb_id: string | null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  return fetchTMDB(`/movie/${movieId}`, {
    append_to_response: 'credits,videos',
  });
}

async function discoverMovies(params: Record<string, string>): Promise<TMDBMovie[]> {
  const data = await fetchTMDB('/discover/movie', params);
  return data.results;
}

function getDirector(crew: { name: string; job: string }[]): string {
  const director = crew.find((person) => person.job === 'Director');
  return director?.name || 'Unknown';
}

function getTopCast(cast: { name: string; order: number }[]): string[] {
  return cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 4)
    .map((actor) => actor.name);
}

function getTrailerUrl(videos: { key: string; site: string; type: string }[]): string | null {
  const trailer = videos.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

async function seedMovies() {
  console.log('Starting movie seeding process...');

  const movieSets = [
    {
      name: 'Recent Highly Rated (2020-2024)',
      params: {
        'primary_release_date.gte': '2020-01-01',
        'primary_release_date.lte': '2024-12-31',
        'vote_average.gte': '7.5',
        'vote_count.gte': '500',
        'sort_by': 'vote_average.desc',
      },
      pages: 10,
    },
    {
      name: 'Classic Movies (1970-1999)',
      params: {
        'primary_release_date.gte': '1970-01-01',
        'primary_release_date.lte': '1999-12-31',
        'vote_average.gte': '7.5',
        'vote_count.gte': '1000',
        'sort_by': 'vote_average.desc',
      },
      pages: 10,
    },
    {
      name: 'Modern Classics (2000-2019)',
      params: {
        'primary_release_date.gte': '2000-01-01',
        'primary_release_date.lte': '2019-12-31',
        'vote_average.gte': '7.5',
        'vote_count.gte': '800',
        'sort_by': 'vote_average.desc',
      },
      pages: 10,
    },
    {
      name: 'Popular Recent (2018-2024)',
      params: {
        'primary_release_date.gte': '2018-01-01',
        'primary_release_date.lte': '2024-12-31',
        'vote_average.gte': '6.5',
        'vote_count.gte': '1000',
        'sort_by': 'popularity.desc',
      },
      pages: 5,
    },
  ];

  const allMovieIds = new Set<number>();
  let totalProcessed = 0;

  for (const movieSet of movieSets) {
    console.log(`\nFetching ${movieSet.name}...`);

    for (let page = 1; page <= movieSet.pages; page++) {
      console.log(`  Page ${page}/${movieSet.pages}`);

      const movies = await discoverMovies({
        ...movieSet.params,
        page: page.toString(),
      });

      for (const movie of movies) {
        if (allMovieIds.has(movie.id)) {
          continue;
        }

        allMovieIds.add(movie.id);

        try {
          console.log(`    Processing: ${movie.title} (${movie.id})`);

          const details = await getMovieDetails(movie.id);

          if (!details.runtime || details.runtime < 40) {
            console.log(`      Skipping (too short)`);
            continue;
          }

          const movieData = {
            id: details.id,
            title: details.title,
            year: new Date(details.release_date).getFullYear(),
            runtime: details.runtime,
            director: getDirector(details.credits.crew),
            movie_cast: getTopCast(details.credits.cast),
            plot_synopsis: details.overview || 'No synopsis available.',
            poster_url: details.poster_path
              ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
              : '/placeholder-movie.png',
            trailer_url: getTrailerUrl(details.videos.results),
            genres: details.genres.map((g) => g.name),
            tmdb_rating: Math.round(details.vote_average * 10) / 10,
            imdb_rating: null,
            rt_score: null,
          };

          const { error } = await supabase
            .from('movies')
            .insert(movieData)
            .select()
            .single();

          if (error) {
            if (error.code !== '23505') {
              console.error(`      Error inserting movie:`, error.message);
            }
          } else {
            totalProcessed++;
            console.log(`      ✓ Added (Total: ${totalProcessed})`);
          }

          await sleep(250);
        } catch (err) {
          console.error(`      Error processing movie:`, err);
        }
      }

      await sleep(500);
    }
  }

  console.log(`\n✅ Seeding complete! Processed ${totalProcessed} movies.`);
}

seedMovies().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
