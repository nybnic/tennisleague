# Database Setup Guide

This app uses **Supabase** as a free backend database solution. Your Supabase project is already configured, but you need to create the database schema.

## Prerequisites

- ✅ Supabase account created
- ✅ Project credentials in `.env` file
- ✅ Supabase CLI (optional, but recommended)

## Setup Steps

### 1. Create the Database Schema

You have two options to create the database tables:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your project **"tennisleague"**
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Copy all the SQL from `supabase/migrations/20260217_initial_schema.sql`
6. Paste it into the SQL editor
7. Click **Run** button (or press `Ctrl + Enter`)

#### Option B: Using Supabase CLI

1. Install Supabase CLI: https://supabase.com/docs/guides/cli/getting-started
2. Run the migration:
   ```bash
   supabase db push
   ```

### 2. Verify the Setup

After running the migration, verify that the tables were created:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see three tables:
   - `players` - stores player information
   - `matches` - stores match results
   - `leagues` - stores league information (for future use)

## What Gets Created

### Players Table
- Stores player information
- Fields: id, name, created_at, updated_at
- Automatic RLS (Row Level Security) enabled

### Matches Table
- Stores match results between two players
- Fields: id, date, player_a_id, player_b_id, games_a, games_b, surface, league_id, created_at, updated_at
- Foreign keys to players table
- Automatic RLS enabled

### Leagues Table
- For future use to group matches into leagues
- Fields: id, name, description, created_at, updated_at
- Automatic RLS enabled

## RLS Policies

The migration automatically creates Row Level Security (RLS) policies that allow all anonymous users full access to the tables. This is suitable for a shared tennis league where all players have access to all data.

If you want to add authentication later, you can modify these policies in the Supabase Dashboard under **Authentication > Policies**.

## Environment Variables

Your environment variables are already set in `.env`:

```
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_key"
VITE_SUPABASE_URL="https://your_project.supabase.co"
```

These are used automatically by the app to connect to Supabase.

## Running the App

After setting up the database:

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun run dev
   ```

3. The app will automatically:
   - Load players and matches from Supabase
   - Sync all changes to Supabase in real-time
   - Fall back to localStorage if Supabase is unavailable

## How Data is Synced

The `useLeagueData` hook automatically:

- **Loads** data from Supabase when the app starts
- **Creates** new players/matches in Supabase and the UI simultaneously
- **Updates** changes to Supabase and UI simultaneously
- **Deletes** records from Supabase and UI simultaneously

All operations are optimistic, meaning the UI updates immediately while the database operation happens in the background.

## Troubleshooting

### Database Tables Don't Appear

If you run the migration but tables don't appear:

1. Copy the entire SQL from `supabase/migrations/20260217_initial_schema.sql`
2. Go to Supabase Dashboard > SQL Editor
3. Create a new query and paste the SQL
4. Click Run

### "Could not connect to database" Error

This usually means:
- The Supabase URL or key in `.env` is incorrect
- Your Supabase project is paused
- There's a network connection issue

Check that `.env` contains the correct values from your Supabase project settings.

### Data Not Syncing

If data isn't syncing to Supabase:

1. Check your browser's network tab for errors
2. Check the browser console for error messages
3. Verify RLS policies are enabled in Supabase Dashboard
4. Make sure your Supabase project isn't paused

## Free Tier Limits

Supabase's free tier includes:
- 500 MB database storage
- 2 GB bandwidth/month
- Unlimited API requests
- Up to 50,000 monthly active users

This is more than enough for a personal tennis league!

## Future Enhancements

Once basic player and match tracking works, you can:

1. Add **user authentication** (email/password login)
2. Create **private leagues** with specific players
3. Add **season management** with distinct tournaments
4. Implement **statistics and analytics**
5. Add **player ratings and rankings** that persist across seasons
6. Create **team-based leagues**

All of this is possible with the current Supabase setup!
