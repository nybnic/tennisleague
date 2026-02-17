import { useState, useEffect } from 'react';
import { Match, Player, Surface, SURFACE_META } from '@/types/tennis';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

interface Props {
  players: Player[];
  matches: Match[];
  onAdd: (match: Omit<Match, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>) => void;
  editMatch?: Match | null;
  onEditDone?: () => void;
  lastMatch?: Match | null;
}

function findLastSurfaceForPair(matches: Match[], a: string, b: string): Surface | undefined {
  if (!a || !b) return undefined;
  const sorted = [...matches]
    .filter(m => (m.playerAId === a && m.playerBId === b) || (m.playerAId === b && m.playerBId === a))
    .sort((x, y) => y.date.localeCompare(x.date) || y.createdAt.localeCompare(x.createdAt));
  return sorted[0]?.surface;
}

export function MatchDialog({ players, matches, onAdd, onUpdate, editMatch, onEditDone, lastMatch }: Props) {
  const [open, setOpen] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [playerAId, setPlayerAId] = useState(lastMatch?.playerAId ?? '');
  const [playerBId, setPlayerBId] = useState(lastMatch?.playerBId ?? '');
  const [gamesA, setGamesA] = useState('');
  const [gamesB, setGamesB] = useState('');
  const [surface, setSurface] = useState<Surface | ''>('');

  // Auto-select surface when player pair changes
  useEffect(() => {
    if (!editMatch && playerAId && playerBId) {
      const last = findLastSurfaceForPair(matches, playerAId, playerBId);
      if (last) setSurface(last);
    }
  }, [playerAId, playerBId, matches, editMatch]);

  useEffect(() => {
    if (editMatch) {
      setDate(editMatch.date);
      setPlayerAId(editMatch.playerAId);
      setPlayerBId(editMatch.playerBId);
      setGamesA(String(editMatch.gamesA));
      setGamesB(String(editMatch.gamesB));
      setSurface(editMatch.surface || '');
      setOpen(true);
    }
  }, [editMatch]);

  const reset = () => {
    setDate(todayStr);
    setPlayerAId(lastMatch?.playerAId ?? '');
    setPlayerBId(lastMatch?.playerBId ?? '');
    setGamesA('');
    setGamesB('');
    setSurface('');
    onEditDone?.();
  };

  const handleSubmit = () => {
    if (!date || !playerAId || !playerBId || gamesA === '' || gamesB === '' || playerAId === playerBId) return;
    const ga = parseInt(gamesA);
    const gb = parseInt(gamesB);
    if (isNaN(ga) || isNaN(gb) || ga < 0 || gb < 0) return;

    const matchData = {
      date,
      playerAId,
      playerBId,
      gamesA: ga,
      gamesB: gb,
      ...(surface ? { surface: surface as Surface } : {}),
    };

    if (editMatch) {
      onUpdate(editMatch.id, matchData);
    } else {
      onAdd(matchData);
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Match
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editMatch ? 'Edit Match' : 'Add Match'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="match-date">Date</Label>
            <Input id="match-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Player A</Label>
              <Select value={playerAId} onValueChange={setPlayerAId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {players.filter(p => p.id !== playerBId).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Player B</Label>
              <Select value={playerBId} onValueChange={setPlayerBId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {players.filter(p => p.id !== playerAId).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Surface selector */}
          <div>
            <Label>Surface</Label>
            <TooltipProvider delayDuration={200}>
              <ToggleGroup
                type="single"
                value={surface}
                onValueChange={(v) => setSurface(v as Surface | '')}
                className="justify-start mt-1"
              >
                {(Object.keys(SURFACE_META) as Surface[]).map(s => (
                  <Tooltip key={s}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={s}
                        aria-label={SURFACE_META[s].label}
                        className="px-3 py-2 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {SURFACE_META[s].emoji} {SURFACE_META[s].label}
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{SURFACE_META[s].label} court</TooltipContent>
                  </Tooltip>
                ))}
              </ToggleGroup>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="games-a">Games A</Label>
              <Input id="games-a" type="number" min="0" value={gamesA} onChange={e => setGamesA(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="games-b">Games B</Label>
              <Input id="games-b" type="number" min="0" value={gamesB} onChange={e => setGamesB(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={!date || !playerAId || !playerBId || playerAId === playerBId}>
            {editMatch ? 'Update Match' : 'Add Match'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
