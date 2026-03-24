import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/[0.05] via-transparent to-transparent pointer-events-none" />
      
      {/* Logo */}
      <div className="mb-8 relative z-10">
        <Link to="/" className="flex items-center gap-1 group" id="auth-logo">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-white transition-colors">
            track
          </span>
          <span className="text-2xl font-bold tracking-tight text-[var(--accent-indigo)]">UTM</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-indigo)] ml-0.5 mb-3 group-hover:scale-125 transition-transform" />
        </Link>
      </div>

      <Card className="w-full max-w-[420px] bg-[var(--bg-surface)] border-[var(--bg-border)] shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="text-[var(--text-muted)] text-sm">
              {subtitle}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="mt-12 text-center text-xs text-[var(--text-muted)] relative z-10">
        &copy; {new Date().getFullYear()} Nexorel. All rights reserved.
      </div>
    </div>
  );
}
