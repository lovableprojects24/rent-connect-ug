import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import AppSidebar from './AppSidebar';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { profile, roles } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const displayName = profile?.full_name || 'User';
  const displayRole = roles[0] ? roles[0].charAt(0).toUpperCase() + roles[0].slice(1) : 'User';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">Current Role</p>
              <p className="font-medium capitalize">{displayRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{profile?.phone || ''}</p>
            </div>
            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-medium">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
