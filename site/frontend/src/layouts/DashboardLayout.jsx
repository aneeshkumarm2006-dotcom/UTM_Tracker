import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { email, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Breadcrumb generation based on current route
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path.includes('configure')) return 'Configure';
    if (path.includes('snippet')) return 'Snippet';
    if (path.includes('apikey')) return 'API Key';
    return 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex text-[var(--text-primary)]">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-[220px] pb-16 md:pb-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--bg-border)] bg-[var(--bg-surface)]/50 backdrop-blur sticky top-0 z-40">
          <h1 className="text-lg font-semibold tracking-tight">
            {getBreadcrumb()}
          </h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-[var(--text-muted)]">
              {email}
            </div>
            {/* Mobile logout in top bar */}
            <button
              onClick={handleLogout}
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
