import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ManagerDashboardPage from './ManagerDashboardPage';
import AdminDashboardPage from './AdminDashboardPage';

export default function DashboardPage() {
  const { roles } = useAuth();

  // Tenant → portal
  const isTenantOnly = roles.includes('tenant') && !roles.includes('admin') && !roles.includes('manager');
  if (isTenantOnly) return <Navigate to="/portal" replace />;

  // Admin → Admin Dashboard
  if (roles.includes('admin')) return <AdminDashboardPage />;

  // Manager → Manager Dashboard
  return <ManagerDashboardPage />;
}
