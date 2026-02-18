import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SeasonAuthDialogProps {
  isOpen: boolean;
  seasonName: string;
  onAuthenticate: (passcode: string) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SeasonAuthDialog({
  isOpen,
  seasonName,
  onAuthenticate,
  onClose,
  isLoading = false,
  error = null,
}: SeasonAuthDialogProps) {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate(passcode);
    setPasscode('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authenticate Season</DialogTitle>
          <DialogDescription>
            Enter the passcode for "{seasonName}" to modify games
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <div>
            <Label htmlFor="auth-passcode">Passcode</Label>
            <Input
              id="auth-passcode"
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !passcode.trim()}
              className="flex-1"
            >
              {isLoading ? 'Authenticating...' : 'Unlock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
