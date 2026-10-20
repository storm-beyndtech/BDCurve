import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';
import { Menu } from 'lucide-react';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (!user.isAdmin && user.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    }
  }, [user, loading, navigate]);

  // Show nothing while checking auth
  if (loading || !user || (!user.isAdmin && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background relative">
        {/* Static Grid Background - Fixed */}
        <div
          className="fixed inset-0 opacity-50 pointer-events-none z-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(168, 85, 247, 0.02) 1px, transparent 1px), linear-gradient(to right, rgba(168, 85, 247, 0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex gap-2 min-w-0">
          {/* Sidebar spacer + nav */}
          <div className="hidden lg:block">
            <div className="w-72" />
            <AdminSidebarNav />
          </div>

          {/* Main Content */}
          <main className="relative w-full min-w-0 overflow-x-hidden px-3 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 max-w-7xl mx-auto">
            <header className="lg:hidden sticky top-0 z-30 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 mb-4 flex items-center justify-between bg-background/90 backdrop-blur">
              <button
                className="lg:hidden p-2 rounded-lg border border-border/60 bg-card/80 shadow-sm"
                aria-label="Open admin menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </header>
            <Outlet />
          </main>
        </div>

        {/* Mobile overlay nav */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <div className="absolute top-4 left-4 bottom-4 w-64 max-w-[85vw] overflow-y-auto" onClick={(e) => { e.stopPropagation(); if ((e.target as HTMLElement).closest("a")) setMobileOpen(false); }}>
              <AdminSidebarNav hideOnMobile={false} className="block lg:hidden" />
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
