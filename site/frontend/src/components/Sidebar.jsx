import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Settings, Code, Key, LogOut } from 'lucide-react';

export default function Sidebar() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Configure', path: '/dashboard/configure', icon: Settings },
    { label: 'Snippet', path: '/dashboard/snippet', icon: Code },
    { label: 'API Key', path: '/dashboard/apikey', icon: Key },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] fixed inset-y-0 left-0 bg-[var(--bg-surface)] border-r border-[var(--bg-border)] z-50">
        <div className="h-16 flex items-center px-6 border-b border-[var(--bg-border)]">
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-heading">
            trackUTM<span className="text-[var(--accent-indigo)]">.</span>
          </span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium border-l-2 ${
                  isActive
                    ? 'border-[var(--accent-indigo)] text-[var(--accent-indigo)] bg-[var(--accent-indigo)]/10'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--bg-border)] flex flex-col gap-3">
          <div className="text-sm font-medium text-[var(--text-primary)] truncate px-2" title={email}>
            {email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors text-sm font-medium w-full text-left"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-t border-[var(--bg-border)] flex items-center justify-around z-50 px-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-[var(--accent-indigo)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </nav>
    </>
  );
}
