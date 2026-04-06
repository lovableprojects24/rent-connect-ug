import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Home, Lock, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If user doesn't need to change password, redirect
  if (user && profile && !profile.must_change_password) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      // Update password
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;

      // Clear the must_change_password flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('user_id', user!.id);

      if (profileError) throw profileError;

      toast.success('Password updated successfully! Welcome to RentFlow.');
      
      // Force refresh to pick up the updated profile
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 rounded-xl stat-card-gradient flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">RentFlow</h1>
        </div>

        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold">Change Your Password</h2>
          <p className="text-muted-foreground text-sm mt-2">
            For security, you need to set a new password before accessing your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-destructive">Passwords do not match</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !newPassword || newPassword !== confirmPassword}
          >
            {submitting ? 'Updating…' : 'Set New Password & Continue'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
