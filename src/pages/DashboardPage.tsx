import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ManagerDashboardPage from './ManagerDashboardPage';
import AdminDashboardPage from './AdminDashboardPage';
import FinanceDashboardPage from './FinanceDashboardPage';

export default function DashboardPage() {
  const { roles } = useAuth();

  // Tenant → portal
  const isTenantOnly = roles.includes('tenant') && roles.length === 1;
  if (isTenantOnly) return <Navigate to="/portal" replace />;

  // Admin → Admin Control Center
  if (roles.includes('admin')) return <AdminDashboardPage />;

  // Finance-only → Finance Dashboard
  const isFinanceOnly = roles.includes('finance') && !roles.includes('landlord') && !roles.includes('agent') && !roles.includes('admin');
  if (isFinanceOnly) return <Navigate to="/finance" replace />;

  // Manager (landlord/agent) → Manager Dashboard
  return <ManagerDashboardPage />;
}
