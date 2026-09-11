import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  LayoutDashboard,
  History,
  Target,
  Trophy,
  Sliders,
  Volume2,
  Send,
  User,
  ExternalLink,
  Radio,
  Heart,
  Mic
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, streamer, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-slate-400">
        <span className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mr-3"></span>
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/client', label: 'OBS Alert Settings', icon: Volume2 },
    { to: '/dashboard/voice-ai', label: 'AI Voice & Messages', icon: Mic },
    { to: '/dashboard/tips-settings', label: 'Tips Settings', icon: Heart },
    { to: '/dashboard/leaderboard-avatar', label: 'Leaderboard Avatar', icon: Trophy },
    { to: '/dashboard/ticker', label: 'Donation Ticker', icon: Radio },
    { to: '/dashboard/donations', label: 'Donations History', icon: History },
    { to: '/dashboard/goals', label: 'Donation Goals', icon: Target },
    { to: '/dashboard/telegram', label: 'Telegram Alerts', icon: Send },
    { to: '/dashboard/profile-settings', label: 'Profile Settings', icon: Sliders },
  ];

  const streamerSlug = streamer?.slug || user?.username || 'dara_gaming';

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Streamer Header Bar */}
        <div className="glass-card p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-brand-500/20">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'}
              alt={user?.display_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{user?.display_name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  CREATOR
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">@{streamerSlug}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/tip/${streamerSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-accent-fuchsia hover:brightness-110 shadow-lg shadow-brand-500/25 transition-all"
              title={`Open Test Tip page for @${streamerSlug}`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
              <span>Test Tip</span>
            </a>
            <a
              href={`/@${streamerSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Heart className="w-3.5 h-3.5 text-accent-fuchsia" />
              Public Donation Page
            </a>
            <a
              href={`/leaderboard-avatar/${streamerSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/30"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Leaderboard
            </a>
            <a
              href={`/alert/${streamerSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
              OBS Overlay
            </a>
          </div>
        </div>

        {/* Dashboard Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-lg shadow-brand-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-brand-400" />
                  {item.label}
                </NavLink>
              );
            })}
          </aside>

          {/* Main Outlet */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
