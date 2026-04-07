import { useState } from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ResetPasswordButtonProps {
  targetUserId: string;
  targetName: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'icon';
}

export default function ResetPasswordButton({ targetUserId, targetName, variant = 'outline', size = 'sm' }: ResetPasswordButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { target_user_id: targetUserId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTempPassword(data.temporary_password);
      toast.success('Password reset successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!tempPassword) return;
    const text = `Temporary Password: ${tempPassword}\n\nPlease change your password after logging in.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTempPassword(null);
      setCopied(false);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5">
          <KeyRound className="w-3.5 h-3.5" /> Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {tempPassword ? 'Password Reset!' : 'Reset Password'}
          </DialogTitle>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-4 mt-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <KeyRound className="w-5 h-5" />
                <p className="text-sm font-semibold">New Temporary Password</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this password with <strong>{targetName}</strong>. They will be required to change it on next login.
              </p>
              <div className="bg-background rounded-md p-3 border border-border">
                <p className="text-sm font-mono font-medium tracking-wider">{tempPassword}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Password'}
              </Button>
              <Button onClick={() => handleClose(false)} className="flex-1">Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              This will generate a new temporary password for <strong>{targetName}</strong>. Their current password will stop working immediately.
            </p>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
              The user will be required to change their password on next login.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>Cancel</Button>
              <Button className="flex-1 gap-1.5" onClick={handleReset} disabled={loading}>
                <KeyRound className="w-4 h-4" />
                {loading ? 'Resetting…' : 'Reset Password'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
