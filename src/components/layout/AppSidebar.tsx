import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Home,
  Shield,
  PieChart,
  Wallet,
  FileText,
  LucideIcon,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  roles?: AppRole[];
}

// Admin: full system control
const adminNavItems: NavItem[] = [
  { label: 'Control Center', icon: LayoutDashboard, path: '/', roles: ['admin'] },
  { label: 'Properties', icon: Building2, path: '/properties', roles: ['admin'] },
  { label: 'Tenants', icon: Users, path: '/tenants', roles: ['admin'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['admin'] },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance', roles: ['admin'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['admin'] },
  { label: 'Finance', icon: PieChart, path: '/finance', roles: ['admin'] },
  { label: 'Staff', icon: Shield, path: '/staff', roles: ['admin'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['admin'] },
];

// Manager (landlord/agent): daily property ops
const managerNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['landlord', 'agent'] },
  { label: 'Properties', icon: Building2, path: '/properties', roles: ['landlord', 'agent'] },
  { label: 'Tenants', icon: Users, path: '/tenants', roles: ['landlord', 'agent'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['landlord', 'agent'] },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance', roles: ['landlord', 'agent'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['landlord', 'agent'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['landlord', 'agent'] },
];

// Finance: money focused
const financeNavItems: NavItem[] = [
  { label: 'Finance', icon: PieChart, path: '/finance', roles: ['finance'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['finance'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['finance'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['finance'] },
];

// Tenant: self-service
const tenantNavItems: NavItem[] = [
  { label: 'Financial', icon: Wallet, path: '/portal?tab=financial' },
  { label: 'Maintenance', icon: Wrench, path: '/portal?tab=maintenance' },
  { label: 'Lease & Docs', icon: FileText, path: '/portal?tab=lease' },
];
interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, roles } = useAuth();
  const { unreadCount } = useNotifications();
  const isTenantOnly = roles.includes('tenant') && roles.length === 1;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getNavItems = () => {
    if (isTenantOnly) return tenantNavItems;
    if (roles.includes('admin')) return adminNavItems;
    if (roles.includes('finance') && !roles.includes('landlord') && !roles.includes('agent')) return financeNavItems;
    return managerNavItems;
  };

  const visibleItems = getNavItems();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg stat-card-gradient flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg text-sidebar-foreground">RentFlow</h1>
            <p className="text-xs text-sidebar-muted">Uganda Edition</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = isTenantOnly
              ? location.pathname + location.search === item.path
              : location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role badge */}
        {roles.length > 0 && (
          <div className="px-6 py-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
              {roles[0]}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          {roles.includes('admin') && (
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent w-full">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
