# ✅ Supabase Database Setup Checklist

Use this checklist to track your database setup progress.

## Pre-Setup
- [X] I have a Supabase account
- [X ] I have a Supabase project created
- [ X] I have the project URL and publishable key

## Files & Configuration
- [ ] `.env.local` exists with Supabase credentials
- [ ] `.env` has VITE_SUPABASE_URL set
- [ ] `.env` has VITE_SUPABASE_PUBLISHABLE_KEY set  
- [ ] `.env` has VITE_SUPABASE_PROJECT_ID set

## Database Schema Setup
- [ ] I understand what the SQL migration does
- [ ] I have accessed my Supabase project dashboard
- [ ] I have opened the SQL Editor in Supabase
- [ ] I have copied the SQL from `supabase/migrations/20260217_initial_schema.sql`
- [ ] I have pasted the SQL into Supabase
- [ ] I have executed the SQL (no errors)
- [ ] I can see `players` table in Supabase Table Editor
- [ ] I can see `matches` table in Supabase Table Editor
- [ ] I can see `leagues` table in Supabase Table Editor

## Code Configuration
- [ ] `src/hooks/useLeagueData.ts` imports from Supabase
- [ ] `src/integrations/supabase/types.ts` has table definitions
- [ ] `src/integrations/supabase/client.ts` creates Supabase client

## Testing
- [ ] I have installed dependencies: `bun install`
- [ ] I have started the dev server: `bun run dev`
- [ ] The app loads without console errors
- [ ] I can add a player
- [ ] I can see the new player in Supabase dashboard
- [ ] I can add a match
- [ ] I can see the new match in Supabase dashboard
- [ ] The player list persists when I refresh the page
- [ ] The match list persists when I refresh the page

## Optional: Advanced Testing
- [ ] I tested deleting a player
- [ ] I tested deleting a match
- [ ] I tested updating a player name
- [ ] I tested updating a match
- [ ] The app works with multiple matches
- [ ] The app works with multiple players

## Success!
- [ ] All checkboxes are checked!
- [ ] Your tennis league database is ready
- [ ] Data is being synced to Supabase in real-time

## Troubleshooting Reference
If you encounter issues:

1. **Database tables don't exist**
   - Re-run the SQL migration from `supabase/migrations/20260217_initial_schema.sql`

2. **"Failed to load data" error**
   - Check `.env.local` has correct credentials
   - Verify your Supabase project is not paused

3. **Changes not syncing**
   - Check browser console for errors
   - Verify your internet connection
   - Check if Supabase is down

4. **TypeScript errors**
   - Run `bun install` to ensure types are up to date
   - Check that `src/integrations/supabase/types.ts` is not empty

## Need Help?

See the following files for more information:
- [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) - Detailed setup guide
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - What was changed
- [`supabase/migrations/20260217_initial_schema.sql`](./supabase/migrations/20260217_initial_schema.sql) - The database schema
