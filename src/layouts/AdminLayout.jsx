import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  ShieldAlert,
  Users,
  CreditCard,
  FileText,
  Settings,
  LayoutDashboard
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-slate-400">
        <span className="animate-spin h-8 w-8 border-2 border-accent-rose border-t-transparent rounded-full mr-3"></span>
        Authenticating admin credentials...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const adminNav = [
    { to: '/admin', label: 'Overview Metrics', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User & Streamer Management', icon: Users },
    { to: '/admin/transactions', label: 'Transactions & Moderation', icon: CreditCard },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="glass-card p-6 rounded-2xl mb-8 flex items-center justify-between border border-accent-rose/30 bg-dark-card/90">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-rose/20 border border-accent-rose/40 flex items-center justify-center text-accent-rose">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">System Administration Console</h1>
              <p className="text-xs text-slate-400">Manage users, audit payment transactions, and monitor platform integrity</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-rose/20 text-accent-rose border border-accent-rose/30">
            ADMIN ROOT ACCESS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-accent-rose" />
                  {item.label}
                </NavLink>
              );
            })}
          </aside>

          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
