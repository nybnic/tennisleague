import { Link, useLocation } from 'react-router-dom';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { Home, ClipboardList, Trophy } from 'lucide-react';

export function BottomNav() {
  const { pathname } = useLocation();
  const { currentLeague } = useLeagueContext();

  if (!currentLeague) return null;

  const isMatchesActive = pathname.includes('/matches');
  const isStandingsActive = pathname.includes('/standings');
  const baseUrl = `/league/${currentLeague.id}`;

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around">
        <Link to="/" className={`bottom-nav-item flex-1 ${pathname === '/' ? 'active' : ''}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>
        <Link to={`${baseUrl}/matches`} className={`bottom-nav-item flex-1 ${isMatchesActive ? 'active' : ''}`}>
          <ClipboardList className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Matches</span>
        </Link>
        <Link to={`${baseUrl}/standings`} className={`bottom-nav-item flex-1 ${isStandingsActive ? 'active' : ''}`}>
          <Trophy className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Standings</span>
        </Link>
      </div>
    </nav>
  );
}
