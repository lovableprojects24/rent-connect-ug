import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingService } from '@/services/onboarding';
import ManagerDashboardPage from './ManagerDashboardPage';
import AdminDashboardPage from './AdminDashboardPage';

export default function DashboardPage() {
  const { user, roles } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user || !roles.length) return;
    if (!roles.includes('admin')) {
      setCheckingOnboarding(false);
      return;
    }
    onboardingService.get(user.id).then((progress) => {
      setNeedsOnboarding(!progress || !onboardingService.isComplete(progress));
      setCheckingOnboarding(false);
    });
  }, [user, roles]);

  // Tenant → portal
  const isTenantOnly = roles.includes('tenant') && !roles.includes('admin') && !roles.includes('manager');
  if (isTenantOnly) return <Navigate to="/portal" replace />;

  if (checkingOnboarding) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading…</div></div>;
  }

  if (needsOnboarding) return <Navigate to="/onboarding" replace />;

  if (roles.includes('admin')) return <AdminDashboardPage />;
  return <ManagerDashboardPage />;
}
