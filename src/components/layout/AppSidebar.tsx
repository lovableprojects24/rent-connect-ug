import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  LucideIcon,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  /** Roles that can see this item. undefined = visible to all authenticated users */
  roles?: AppRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Properties', icon: Building2, path: '/properties', roles: ['admin', 'landlord', 'agent'] },
  { label: 'Tenants', icon: Users, path: '/tenants', roles: ['admin', 'landlord', 'agent'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['admin', 'landlord', 'agent', 'finance'] },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance', roles: ['admin', 'landlord', 'agent'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['admin', 'landlord', 'finance'] },
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

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(r => roles.includes(r));
  });

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
            const isActive = location.pathname === item.path;
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
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent w-full">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
