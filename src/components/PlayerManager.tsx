import { useState } from 'react';
import { Player } from '@/types/tennis';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';

interface Props {
  players: Player[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function PlayerManager({ players, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editingId) {
      onUpdate(editingId, name);
    } else {
      onAdd(name);
    }
    setName('');
    setEditingId(null);
  };

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setName(player.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) cancelEdit(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Players
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Manage Players</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="player-name" className="sr-only">Player name</Label>
              <Input
                id="player-name"
                placeholder="Player name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                maxLength={50}
              />
            </div>
            <Button onClick={handleSubmit} size="sm">
              {editingId ? 'Update' : 'Add'}
            </Button>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
            )}
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50">
                <span className="font-medium text-sm">{p.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {players.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No players yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
