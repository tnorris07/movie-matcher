# Movie Matcher

A mobile-optimized web app that helps couples find movies they both want to watch. Built with React, TypeScript, Supabase, and deployed on Vercel.

## Features

- **Tinder-style Swiping**: Swipe through curated movies with four different actions
  - Right: Would watch (haven't seen)
  - Left: Wouldn't watch
  - Up: Already seen, would watch again
  - Down: Already seen, wouldn't watch again
- **Smart Matching**: Automatically detects when both partners want to watch the same movie
- **Shared Watch List**: View all matched movies with filtering and sorting options
- **Movie Details**: Rich information including ratings, cast, director, trailer links
- **Google OAuth Authentication**: Secure sign-in with Google
- **Couple System**: Invite system to connect with your partner
- **Mobile-First Design**: Optimized for iPhone and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Google OAuth
- **Movie Data**: TMDB API
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- TMDB API key
- Google OAuth credentials

### 1. Clone and Install

```bash
git clone <repository-url>
cd movie-matcher
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL to create all tables, functions, and policies

3. Configure Google OAuth:
   - Go to Authentication → Providers in Supabase
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URLs (e.g., `http://localhost:5173` for development)

### 3. Get TMDB API Key

1. Create an account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request an API key (it's free)
4. Copy your API Key (v3 auth)

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

### 5. Seed the Database with Movies

Run the seeding script to populate your database with 500-1000 curated movies:

```bash
npm run seed
```

This will fetch movies from TMDB across different categories:
- Recent highly-rated movies (2020-2024)
- Classic movies (1970-1999)
- Modern classics (2000-2019)
- Popular recent releases

The script will take 15-30 minutes to complete due to API rate limiting.

### 6. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Project Structure

```
movie-matcher/
├── src/
│   ├── components/
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Reusable UI components
│   │   ├── swipe/        # Movie card and swipe components
│   │   ├── watchlist/    # Watch list components
│   │   └── profile/      # Profile components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # External service integrations
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── scripts/              # Database seeding scripts
├── supabase-schema.sql   # Database schema
└── README.md
```

## Database Schema

The app uses the following main tables:

- **couples**: Stores couple relationships and invite codes
- **movies**: Curated movie data from TMDB
- **swipes**: User swipe history
- **matches**: Automatically created when both partners swipe positively
- **user_genre_preferences**: Tracks genre preferences for future recommendations

See `supabase-schema.sql` for the complete schema with triggers and RLS policies.

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

Follow the prompts to connect your project.

### 3. Configure Environment Variables

In the Vercel dashboard, add your environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TMDB_API_KEY`

### 4. Update Supabase OAuth Redirect URLs

Add your production URL to Supabase:
- Go to Authentication → URL Configuration
- Add your Vercel URL to "Site URL" and "Redirect URLs"

## User Flow

1. **Sign In**: Users sign in with Google OAuth
2. **Create/Join Couple**: First user creates a couple and gets an invite code; second user joins with that code
3. **Swipe Movies**: Each partner independently swipes on movies
4. **Get Matches**: When both partners swipe positively, a match is created
5. **Watch List**: View all matches, filter by genre/runtime, mark as watched

## API Integration

### TMDB API

The app uses TMDB API to:
- Fetch movie metadata (title, year, runtime, cast, director)
- Get poster images and trailer links
- Retrieve ratings and genres

### Rate Limiting

The seeding script includes delays to respect TMDB's rate limits:
- 250ms between movie detail requests
- 500ms between page requests

## Contributing

Contributions are welcome. Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Future Enhancements

- Streaming availability integration
- Smart recommendations based on genre preferences
- Social features (friends, shared lists)
- Date night mode with extra filters
- Export to other platforms

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
