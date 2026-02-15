import { useState, useEffect } from 'react';
import { Match, Player } from '@/types/tennis';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil } from 'lucide-react';

interface Props {
  players: Player[];
  onAdd: (match: Omit<Match, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>) => void;
  editMatch?: Match | null;
  onEditDone?: () => void;
}

export function MatchDialog({ players, onAdd, onUpdate, editMatch, onEditDone }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [playerAId, setPlayerAId] = useState('');
  const [playerBId, setPlayerBId] = useState('');
  const [gamesA, setGamesA] = useState('');
  const [gamesB, setGamesB] = useState('');

  useEffect(() => {
    if (editMatch) {
      setDate(editMatch.date);
      setPlayerAId(editMatch.playerAId);
      setPlayerBId(editMatch.playerBId);
      setGamesA(String(editMatch.gamesA));
      setGamesB(String(editMatch.gamesB));
      setOpen(true);
    }
  }, [editMatch]);

  const reset = () => {
    setDate('');
    setPlayerAId('');
    setPlayerBId('');
    setGamesA('');
    setGamesB('');
    onEditDone?.();
  };

  const handleSubmit = () => {
    if (!date || !playerAId || !playerBId || gamesA === '' || gamesB === '' || playerAId === playerBId) return;
    const ga = parseInt(gamesA);
    const gb = parseInt(gamesB);
    if (isNaN(ga) || isNaN(gb) || ga < 0 || gb < 0) return;

    if (editMatch) {
      onUpdate(editMatch.id, { date, playerAId, playerBId, gamesA: ga, gamesB: gb });
    } else {
      onAdd({ date, playerAId, playerBId, gamesA: ga, gamesB: gb });
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
