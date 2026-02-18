import { useState } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useLeagueData } from '@/hooks/useLeagueData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface LeagueHeaderProps {
  currentSeasonName?: string;
}

export function LeagueHeader({ currentSeasonName }: LeagueHeaderProps) {
  const { currentLeague, isLeagueAuthorized, renameLeague } = useLeagueContext();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState(currentLeague?.name || '');
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLeagueName.trim()) {
      setError('League name is required');
      return;
    }

    try {
      setIsRenaming(true);
      setError(null);
      await renameLeague(newLeagueName.trim());
      setRenameDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename league');
    } finally {
      setIsRenaming(false);
    }
  };

  if (!currentLeague) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
      <div className="flex items-center gap-3 min-w-0 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex-shrink-0">League</span>
          <h2 className="text-sm font-bold truncate">{currentLeague.name}</h2>
        </div>
        {currentSeasonName && (
          <>
            <span className="text-muted-foreground/40 flex-shrink-0">•</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex-shrink-0">Season</span>
              <p className="text-sm truncate">{currentSeasonName}</p>
            </div>
          </>
        )}
      </div>
      
      {isLeagueAuthorized && (
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost" 
              className="ml-2 flex-shrink-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename League</DialogTitle>
              <DialogDescription>
                Update the name of your league
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleRename} className="space-y-4">
              <div>
                <Label htmlFor="league-name">League Name</Label>
                <Input
                  id="league-name"
                  value={newLeagueName}
                  onChange={e => setNewLeagueName(e.target.value)}
                  disabled={isRenaming}
                  placeholder="e.g., Talvisarja 2025-26"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenameDialogOpen(false)}
                  disabled={isRenaming}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isRenaming}>
                  {isRenaming ? 'Renaming...' : 'Rename League'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
