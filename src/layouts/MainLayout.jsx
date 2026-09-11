import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  const location = useLocation();
  const path = location.pathname;

  // Detect if current route is a public creator tip/donation page or public leaderboard
  const isTipOrLeaderboardPage =
    path.startsWith('/@') ||
    path.startsWith('/tip') ||
    path.startsWith('/donate') ||
    path.startsWith('/streamer') ||
    path.startsWith('/leaderboard') ||
    (!['/', '/search', '/become-streamer', '/login', '/register'].includes(path) && !path.startsWith('/dashboard') && !path.startsWith('/admin'));

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100 selection:bg-brand-500 selection:text-white">
      {!isTipOrLeaderboardPage && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isTipOrLeaderboardPage ? (
        <Footer />
      ) : (
        <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/5">
          <p className="flex items-center justify-center gap-1.5">
            <span>Powered by</span>
            <a href="/" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Zoee Donation
            </a>
            <span>• Secure Creator Live Support</span>
          </p>
        </footer>
      )}
    </div>
  );
}

