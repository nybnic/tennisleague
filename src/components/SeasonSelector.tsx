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
  onCreateSeason?: (name: string) => Promise<void>;
  readOnly?: boolean;
}

export function SeasonSelector({
  seasons,
  currentSeasonId,
  onSeasonChange,
  onCreateSeason,
  readOnly = false,
}: SeasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSeason = async () => {
    if (!seasonName.trim()) {
      setError('Season name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      if (onCreateSeason) {
        await onCreateSeason(seasonName.trim());
      }
      setSeasonName('');
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
        <SelectTrigger className="w-32 md:w-48">
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

      {!readOnly && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" title="Add new season">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Season</DialogTitle>
            <DialogDescription>
              Add a new season to organize your matches
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
                disabled={isLoading}
              />
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
      )}
    </div>
  );
}
