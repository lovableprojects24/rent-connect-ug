import { Link, useLocation } from 'react-router-dom';
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
  Home,
  Search,
  FileText,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const superAdminItems: NavItem[] = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Properties', icon: Building2, path: '/properties' },
  { label: 'Tenants', icon: Users, path: '/tenants' },
  { label: 'Payments', icon: DollarSign, path: '/payments' },
];

const landlordAdminItems: NavItem[] = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Properties', icon: Building2, path: '/properties' },
  { label: 'Tenants', icon: Users, path: '/tenants' },
  { label: 'Payments', icon: DollarSign, path: '/payments' },
];

const managerItems: NavItem[] = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Properties', icon: Building2, path: '/properties' },
  { label: 'Tenants', icon: Users, path: '/tenants' },
  { label: 'Repairs', icon: Wrench, path: '/maintenance' },
];

const tenantItems: NavItem[] = [
  { label: 'Home', icon: Home, path: '/portal' },
  { label: 'Find', icon: Search, path: '/find-property' },
  { label: 'Apps', icon: FileText, path: '/my-applications' },
  { label: 'Repairs', icon: Wrench, path: '/portal?tab=maintenance' },
];

interface MobileBottomNavProps {
  onOpenMore?: () => void;
}

export default function MobileBottomNav({ onOpenMore }: MobileBottomNavProps) {
  const location = useLocation();
  const { roles } = useAuth();
  const { unreadCount } = useNotifications();

  const isSuperAdmin = roles.includes('admin') && !roles.includes('landlord');
  const isLandlordAdmin = roles.includes('admin') && roles.includes('landlord');
  const isTenantOnly = roles.includes('tenant') && !roles.includes('admin') && !roles.includes('manager');

  const items = isSuperAdmin
    ? superAdminItems
    : isLandlordAdmin
      ? landlordAdminItems
      : roles.includes('manager')
        ? managerItems
        : tenantItems;

  const currentPath = location.pathname + location.search;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const isActive = isTenantOnly
            ? currentPath === item.path || (item.path === '/portal' && location.pathname === '/portal' && !location.search)
            : location.pathname === item.path;
          return (
            <li key={item.path + item.label}>
              <Link
                to={item.path}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate max-w-full">{item.label}</span>
                {isActive && <span className="absolute top-0 inset-x-3 h-0.5 bg-primary rounded-b-full" />}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={onOpenMore}
            className="relative w-full flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="More navigation options"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="truncate max-w-full">More</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1/2 translate-x-3 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
}
