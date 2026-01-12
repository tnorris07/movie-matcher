# Movie Matcher - Complete Setup Guide

This guide will walk you through setting up the Movie Matcher app from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [TMDB API Setup](#tmdb-api-setup)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Local Development Setup](#local-development-setup)
6. [Seeding the Database](#seeding-the-database)
7. [Deployment to Vercel](#deployment-to-vercel)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier works)
- A TMDB account (free)
- A Google Cloud account (for OAuth)

## Supabase Setup

### 1. Create a New Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Name: `movie-matcher` (or your choice)
   - Database Password: Generate a strong password and save it
   - Region: Choose closest to your users
4. Wait for the project to be created (2-3 minutes)

### 2. Get Your Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 3. Run the Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Open the `supabase-schema.sql` file from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run" to execute

This will create:
- All necessary tables (couples, movies, swipes, matches, user_genre_preferences)
- Database triggers for automatic match detection
- Row Level Security policies
- Helper functions

### 4. Verify Schema Creation

1. Go to Table Editor
2. You should see these tables:
   - couples
   - movies
   - swipes
   - matches
   - user_genre_preferences

## TMDB API Setup

### 1. Create a TMDB Account

1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Click "Join TMDB" and create an account
3. Verify your email

### 2. Request an API Key

1. Go to Settings (click your avatar → Settings)
2. Click on "API" in the left sidebar
3. Click "Request an API Key"
4. Choose "Developer"
5. Fill in the application form:
   - Application Name: Movie Matcher
   - Application URL: Your app URL (or `http://localhost:5173` for development)
   - Application Summary: A movie matching app for couples
6. Accept the terms and submit
7. Copy your **API Key (v3 auth)**

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it "Movie Matcher"
4. Click "Create"

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in:
   - App name: Movie Matcher
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. Skip scopes (click "Save and Continue")
6. Add test users if needed (or publish the app later)
7. Click "Save and Continue"

### 3. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Fill in:
   - Name: Movie Matcher Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your Vercel production URL (add later)
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback`
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### 4. Configure Google OAuth in Supabase

1. Go to your Supabase project
2. Navigate to Authentication → Providers
3. Find "Google" and click to expand
4. Toggle "Enable Google provider"
5. Paste your Google **Client ID** and **Client Secret**
6. Copy the "Callback URL" shown (you'll need this)
7. Click "Save"

### 5. Update Google OAuth Settings

1. Go back to Google Cloud Console
2. Add the Supabase callback URL to your OAuth client's redirect URIs
3. Save

## Local Development Setup

### 1. Clone and Install

```bash
cd movie-matcher
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Seeding the Database

### Why Seed?

The app needs movies in the database for users to swipe on. The seeding script fetches 500-1000 curated movies from TMDB.

### Run the Seed Script

```bash
npm run seed
```

**This will take 15-30 minutes** due to TMDB API rate limits.

The script will:
1. Fetch movies from different eras (1970s-present)
2. Get detailed information for each movie
3. Insert into your Supabase database
4. Skip duplicates automatically

### Monitor Progress

Watch the console output to see:
- Which movie sets are being processed
- How many movies have been added
- Any errors that occur

### Verify Seeding

1. Go to Supabase Table Editor
2. Open the `movies` table
3. You should see hundreds of movies

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? Yes
- Which scope? Choose your account
- Link to existing project? No
- Project name: movie-matcher
- Directory: ./
- Override settings? No

### 3. Set Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_TMDB_API_KEY
```

Or add them in the Vercel dashboard:
1. Go to your project settings
2. Click "Environment Variables"
3. Add all three variables for Production, Preview, and Development

### 4. Deploy Again

```bash
vercel --prod
```

### 5. Update OAuth Settings

1. Copy your Vercel production URL
2. Add it to:
   - **Supabase**: Authentication → URL Configuration
     - Add to "Site URL"
     - Add to "Redirect URLs"
   - **Google Cloud**: OAuth client settings
     - Add to "Authorized JavaScript origins"
     - Add to "Authorized redirect URIs"

## Troubleshooting

### "Failed to fetch movies"
- Check your TMDB API key is correct
- Verify you're not hitting rate limits
- Check network connection

### "Authentication error"
- Verify Google OAuth is configured in Supabase
- Check redirect URLs match exactly
- Clear cookies and try again

### "Database error"
- Verify schema was created successfully
- Check Supabase RLS policies
- Look at Supabase logs for details

### "No movies to swipe"
- Run the seeding script: `npm run seed`
- Check the movies table in Supabase
- Verify movies were inserted

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript files have no errors
- Verify `.env` file exists with all required variables

## Next Steps

After setup:
1. Test the complete flow (sign in → create couple → swipe → match)
2. Invite a partner to test the couple functionality
3. Monitor Supabase usage in the dashboard
4. Consider adding more movies with the seed script

## Support

If you encounter issues:
1. Check this troubleshooting section
2. Review Supabase logs
3. Check browser console for errors
4. Open an issue on GitHub
