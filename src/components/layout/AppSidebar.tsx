import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Building2,
  Users,
  UserPlus,
  DollarSign,
  Wrench,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Home,
  LucideIcon,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const superAdminNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Requests', icon: UserPlus, path: '/requests' },
  { label: 'Properties', icon: Building2, path: '/properties' },
  { label: 'Managers', icon: Users, path: '/staff' },
  { label: 'All Tenants', icon: Users, path: '/tenants' },
  { label: 'Payments', icon: DollarSign, path: '/payments' },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const landlordAdminNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'My Properties', icon: Building2, path: '/properties' },
  { label: 'My Staff', icon: Users, path: '/staff' },
  { label: 'Tenants', icon: Users, path: '/tenants' },
  { label: 'Payments', icon: DollarSign, path: '/payments' },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const managerNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'My Properties', icon: Building2, path: '/properties' },
  { label: 'Tenants', icon: Users, path: '/tenants' },
  { label: 'Payments', icon: DollarSign, path: '/payments' },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
];

const tenantNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/portal' },
  { label: 'My Payments', icon: DollarSign, path: '/portal?tab=financial' },
  { label: 'Maintenance', icon: Wrench, path: '/portal?tab=maintenance' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
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
  const isTenantOnly = roles.includes('tenant') && !roles.includes('admin') && !roles.includes('manager');

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isSuperAdmin = roles.includes('admin') && !roles.includes('landlord');
  const isLandlordAdmin = roles.includes('admin') && roles.includes('landlord');

  const getNavItems = () => {
    if (isSuperAdmin) return superAdminNavItems;
    if (isLandlordAdmin) return landlordAdminNavItems;
    if (roles.includes('manager')) return managerNavItems;
    return tenantNavItems;
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isLandlordAdmin) return 'Admin Portal';
    if (roles.includes('manager')) return 'Manager Portal';
    return 'Tenant Portal';
  };

  const visibleItems = getNavItems();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-primary font-heading font-bold text-xl">RentFlow</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
              isSuperAdmin
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : isLandlordAdmin
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : roles.includes('manager')
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {getRoleLabel()}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = isTenantOnly
                ? location.pathname + location.search === item.path || (item.path === '/portal' && location.pathname === '/portal' && !location.search)
                : location.pathname === item.path;
              return (
                <li key={item.path + item.label}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <span className={`ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isActive ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                      }`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
