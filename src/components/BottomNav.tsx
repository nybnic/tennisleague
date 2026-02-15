import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Trophy } from 'lucide-react';

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around">
        <Link to="/" className={`bottom-nav-item flex-1 ${pathname === '/' ? 'active' : ''}`}>
          <ClipboardList className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Matches</span>
        </Link>
        <Link to="/standings" className={`bottom-nav-item flex-1 ${pathname === '/standings' ? 'active' : ''}`}>
          <Trophy className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Standings</span>
        </Link>
      </div>
    </nav>
  );
}
