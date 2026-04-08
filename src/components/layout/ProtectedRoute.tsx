import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, profile, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  if (profile?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  // Block unapproved users
  if (profile && !profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4a843]/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-[#d4a843]" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Your account has been created successfully and is awaiting approval from the admin team. You'll be notified once your account is activated.
          </p>
          <div className="bg-muted rounded-lg p-4 text-sm mb-6">
            <p className="text-muted-foreground">Need help? Contact us at</p>
            <p className="font-medium text-foreground">+256 703 911851</p>
          </div>
          <Button onClick={signOut} variant="outline" className="border-border">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
