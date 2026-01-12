# Quick Start Guide

Get the Movie Matcher app running locally in 10 minutes.

## Prerequisites

- Node.js 18+
- A Supabase account (free)
- A TMDB API key (free)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize (2-3 minutes)

## Step 3: Set Up Database

1. In Supabase, go to SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run in SQL Editor
4. Verify tables were created in Table Editor

## Step 4: Get TMDB API Key

1. Create account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request API key (choose "Developer")
4. Copy your API Key (v3 auth)

## Step 5: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `VITE_SUPABASE_URL`: From Supabase Project Settings → API
- `VITE_SUPABASE_ANON_KEY`: From Supabase Project Settings → API
- `VITE_TMDB_API_KEY`: From TMDB Settings → API

## Step 6: Set Up Google OAuth

### In Google Cloud Console:
1. Create new project
2. Enable OAuth consent screen (External)
3. Create OAuth client ID (Web application)
4. Add authorized origins: `http://localhost:5173`
5. Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret

### In Supabase:
1. Go to Authentication → Providers
2. Enable Google
3. Paste Client ID and Secret
4. Save

## Step 7: Seed the Database

```bash
npm run seed
```

This will take 15-30 minutes. Leave it running in the background.

## Step 8: Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173`

## Step 9: Test the App

1. Click "Sign in with Google"
2. Authorize the app
3. Create a couple (get invite code)
4. Share invite code with partner (or use incognito mode to test)
5. Start swiping on movies
6. Check for matches

## Troubleshooting

### "No movies to swipe"
Wait for the seed script to finish, or check if movies were added to the database.

### "Auth error"
Verify Google OAuth is properly configured in both Google Cloud and Supabase.

### Build fails
Make sure all dependencies are installed: `npm install`

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed configuration
- Read [README.md](./README.md) for full documentation
- Deploy to Vercel following the deployment guide

## Need Help?

Check the full setup guide in [SETUP.md](./SETUP.md) or open an issue on GitHub.
