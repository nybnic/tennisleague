@echo off
REM Tennis League Database Setup Script
REM This script helps set up the Supabase database for the tennis league app

echo.
echo 🎾 Tennis League Database Setup
echo ==================================
echo.

if not exist ".env.local" (
    echo ⚠️  .env.local not found!
    echo.
    echo Please create .env.local with your Supabase credentials:
    echo.
    echo   VITE_SUPABASE_URL=your_supabase_url
    echo   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
    echo   VITE_SUPABASE_PROJECT_ID=your_project_id
    echo.
    exit /b 1
)

echo ✅  .env.local found
echo.
echo 📋 Next steps:
echo.
echo 1. Go to Supabase Dashboard: https://supabase.com/dashboard
echo 2. Select your tennis league project
echo 3. Go to SQL Editor
echo 4. Create a new query
echo 5. Copy the SQL from: supabase/migrations/20260217_initial_schema.sql
echo 6. Paste and run the SQL in Supabase
echo.
echo 7. Once complete, run:
echo    bun install
echo    bun run dev
echo.
echo 🎉 Your database will be ready!
echo.
pause
