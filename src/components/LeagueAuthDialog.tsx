import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { Lock } from 'lucide-react';

interface LeagueAuthDialogProps {
  isOpen: boolean;
  leagueName: string;
  onAuthenticate: (passcode: string) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LeagueAuthDialog({
  isOpen,
  leagueName,
  onAuthenticate,
  onClose,
  isLoading = false,
  error = null,
}: LeagueAuthDialogProps) {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim()) {
      onAuthenticate(passcode);
      setPasscode('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <DialogTitle>Authenticate League</DialogTitle>
          </div>
          <DialogDescription>
            Enter the passcode for "{leagueName}" to modify data
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter league passcode"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !passcode.trim()}>
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
