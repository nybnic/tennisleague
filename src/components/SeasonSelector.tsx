import { useState } from 'react';
import { Season } from '@/types/tennis';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface SeasonSelectorProps {
  seasons: Season[];
  currentSeasonId: string | null;
  onSeasonChange: (seasonId: string) => void;
  onCreateSeason: (name: string, passcode: string) => Promise<void>;
}

export function SeasonSelector({
  seasons,
  currentSeasonId,
  onSeasonChange,
  onCreateSeason,
}: SeasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSeason = async () => {
    if (!seasonName.trim() || !passcode.trim()) {
      setError('Season name and passcode are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onCreateSeason(seasonName.trim(), passcode.trim());
      setSeasonName('');
      setPasscode('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create season');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentSeasonId || ''} onValueChange={onSeasonChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select a season" />
        </SelectTrigger>
        <SelectContent>
          {seasons.map(season => (
            <SelectItem key={season.id} value={season.id}>
              {season.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Season</DialogTitle>
            <DialogDescription>
              Add a new season with a passcode to protect modifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <div>
              <Label htmlFor="season-name">Season Name</Label>
              <Input
                id="season-name"
                placeholder="e.g., Winter 2026"
                value={seasonName}
                onChange={e => setSeasonName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter a passcode to modify games"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll need this to add or edit matches
              </p>
            </div>
            <Button
              onClick={handleCreateSeason}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Season'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
