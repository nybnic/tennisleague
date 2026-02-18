# Tennis League - Multi-Season Update

## Overview
The tennis league app has been updated to support multiple seasons, persistent global players, and richer filtering options. Each season has its own set of matches but shares the same player pool.

## Key Features Implemented

### 1. **Multiple Seasons Support**
- **Seasons Table**: New `seasons` table in Supabase stores:
  - `id`: Unique season identifier
  - `name`: Display name (e.g., "Winter 2026", "Spring 2026")
  - `passcode`: Protection mechanism for modifying games
  - `created_at`: Timestamp
  
- **Season Association**: Matches now belong to specific seasons via `season_id` foreign key
- **Season Persistence**: Current selected season is saved to localStorage

### 2. **Persistent Global Players**
- Players are now truly global and can participate in multiple seasons
- Players are never deleted when removed from a season (cascade delete only applies to matches)
- Each season tracks wins/losses/ELO independently

### 3. **Passcode Authentication**
- Each season has a unique passcode to prevent unauthorized modifications
- Users must authenticate with the correct passcode to:
  - Add new matches
  - Edit existing matches
  - Delete matches
- Authentication state is stored in localStorage per season
- **SeasonAuthDialog** component handles passcode entry

### 4. **Season Selection UI**
- **SeasonSelector** component allows:
  - Switching between existing seasons via dropdown
  - Creating new seasons with custom names and passcodes
- Available on both Matches and Standings pages in the header

### 5. **Richer Filtering**
- **Court Type Filter** (Surface):
  - Filter standings by: All, Hard, Clay, Grass
  - Dynamically recalculates standings, head-to-head, trends for filtered matches
  - Available on Standings page header

- **Season Filter**:
  - Implicit - current season is selected at the top
  - Switching seasons automatically loads/refreshes all data

## Database Schema Changes

### New `seasons` Table
```sql
- id: UUID (PK)
- name: text
- league_id: UUID (FK → leagues.id) [nullable]
- passcode: text
- created_at: timestamp with timezone
```

### Updated `matches` Table
```sql
- season_id: UUID (FK → seasons.id) [NEW - REQUIRED]
- surface: text [was optional, still optional]
- Other fields remain unchanged
```

## Component Architecture

### New Components
- **SeasonSelector.tsx**: Dropdown + create modal for seasons
- **SeasonAuthDialog.tsx**: Passcode input dialog for season authentication

### Updated Components
- **MatchList.tsx**: Added `canEdit` prop to conditionally show edit/delete actions
- **MatchesPage.tsx**: Integrated season selection and authentication
- **StandingsPage.tsx**: Added season selector and court type filters

## Hook Changes

### useLeagueData() Enhanced Return
```typescript
{
  // Existing
  players: Player[]
  matches: Match[]
  rawMatches: Match[]
  loading: boolean
  error: string | null
  addPlayer, updatePlayer, deletePlayer
  addMatch, updateMatch, deleteMatch
  
  // New
  seasons: Season[]
  currentSeasonId: string | null
  switchSeason: (seasonId: string) => void
  createSeason: (name: string, passcode: string) => Promise<Season>
  authenticateSeason: (seasonId: string, passcode: string) => void
  isSeasonAuthenticated: (seasonId: string) => boolean
}
```

## Data Flow

1. **On Mount**:
   - Load all players (global)
   - Load all seasons
   - Restore last selected season from localStorage

2. **When Season Changes**:
   - Fetch matches for that season only
   - Load stored authentication state for that season
   - Reset canEdit UI based on auth state

3. **When Adding/Editing Match**:
   - Check if user is authenticated for current season
   - Prompt for passcode if not
   - Include `season_id` and `surface` in database insert/update

4. **When Filtering by Court**:
   - Filter matches by surface type
   - Recalculate all statistics (standings, ELO, insights)

## Authentication Flow

### First Time Using a Season
1. User selects/creates a season
2. Tries to add/edit/delete a match
3. SeasonAuthDialog appears
4. User enters passcode
5. Authentication state stored in localStorage[`{AUTHENTICATED_SEASONS_KEY}`]
6. Can now modify matches without re-entering passcode

### Passcode Recovery
- Currently, passcode is visible in the select dropdown
- Users who forget the passcode would need to:
  - Create a new season with a new passcode, OR
  - Clear localStorage key `tennis-league-authenticated-seasons` to reset

## Storage (localStorage)

- **`tennis-league-current-season`**: Current selected season ID
- **`tennis-league-authenticated-seasons`**: JSON array of season IDs the user has authenticated for

## Usage Instructions for Users

### Creating a New Season
1. Click the **+** button next to the season dropdown
2. Enter season name (e.g., "Winter 2026")
3. Enter a passcode (remember this!)
4. Click "Create Season"

### Adding Matches to a Season
1. Select the season from the dropdown
2. If you haven't authenticated yet, you'll see: "Authenticate with passcode to modify matches"
3. Click "Add Match" button or try to edit a match
4. Enter the season passcode
5. Now you can add/edit/delete matches freely until you close the browser

### Viewing Standings by Court Type
1. Go to the Standings page
2. Use the court type buttons in the header (All, 🏟️ Hard, 🟤 Clay, 🌿 Grass)
3. Statistics recalculate in real-time

### Switching Seasons
1. Use the season dropdown to select a different season
2. All matches, standings, and charts automatically update
3. Authentication state is independent per season

## Security Considerations

### Current Implementation
- Passcodes are stored in plain text in Supabase
- Authentication is session-based (localStorage)
- Not suitable for multi-user production use

### Future Enhancements
- Hash passcodes with bcrypt before storage
- Implement user auth with Supabase Auth
- Add role-based access (admin, viewer, editor)
- Server-side verification of passcode on mutations

## TypeScript Types

### New
```typescript
interface Season {
  id: string
  name: string
  passcode: string
  createdAt: string
}
```

### Updated
```typescript
interface Match {
  id: string
  date: string
  playerAId: string
  playerBId: string
  gamesA: number
  gamesB: number
  createdAt: string
  seasonId: string  // Now required
  surface?: Surface
}
```

## Migration Notes

### For Existing Data
If migrating from old version:
1. Create default season in Supabase UI
2. Update all existing matches to include `season_id`
3. Or re-import matches through the app

### For Fresh Start
1. App creates seasons and matches automatically
2. All data persisted to Supabase
3. Players shared across all seasons

## Files Modified/Created

### New Files
- `src/components/SeasonSelector.tsx`
- `src/components/SeasonAuthDialog.tsx`

### Modified Files
- `src/integrations/supabase/types.ts` - Added seasons table + updated matches
- `src/types/tennis.ts` - Added Season interface
- `src/hooks/useLeagueData.ts` - Major refactor for season support
- `src/pages/MatchesPage.tsx` - Added season UI and auth
- `src/pages/StandingsPage.tsx` - Added season + court filters
- `src/components/MatchList.tsx` - Added canEdit prop

## Testing Checklist

- [x] Create multiple seasons with different passcodes
- [x] Add matches to different seasons (stay isolated)
- [x] Switch between seasons (data updates correctly)
- [x] Authenticate with wrong passcode (error shown)
- [x] Authenticate with correct passcode (can edit)
- [x] Filter standings by court type (stats recalculate)
- [x] Add player (appears in all seasons)
- [x] Delete match (only affects current season)
- [x] Build compiles without errors

## Next Steps / Future Enhancements

1. **Player Profiles**: Show player's cross-season stats, profile picture, bio
2. **Season Archives**: View past season stats
3. **Exports**: Download season data as CSV/PDF
4. **Multiplayer**: Real user authentication and sharing
5. **Analytics**: Trends across seasons, season comparison
6. **Mobile**: Optimize for mobile responsiveness
