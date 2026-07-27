import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '../components/rivet/Sidebar';
import Header from '../components/rivet/Header';
import ContentView from '../components/rivet/ContentView';
import { BalanceCard, TodayActivity } from '../components/rivet/BalanceCard';
import HubCards from '../components/rivet/HubCards';
import RecommendedTasks from '../components/rivet/RecommendedTasks';
import TopContributors from '../components/rivet/TopContributors';
import DashboardWidgets from '../components/rivet/DashboardWidgets';

export default function RivetDashboard() {
  const [activeNav, setActiveNav] = useState('home');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      <Sidebar
        activeNav={activeNav}
        onNavChange={(id) => { setActiveNav(id); setIsMobileNavOpen(false); }}
        isMobileOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeNav === 'home' ? (
            <>
              {/* Greeting */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Good morning, {currentUser?.full_name?.split(' ')[0] || 'Alex'} 👋</h1>
                <p className="text-sm text-gray-500 mt-1">Let's build something great today.</p>
              </div>

              {/* Top row: Balance + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><BalanceCard /></div>
                <TodayActivity />
              </div>

              {/* Hub cards */}
              <HubCards />

              {/* Recommended + Top Contributors */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><RecommendedTasks /></div>
                <TopContributors />
              </div>

              {/* Dashboard widgets */}
              <DashboardWidgets />

              {/* Invite banner */}
              <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Invite friends. Earn more.</h3>
                  <p className="text-sm text-white/70 mt-1">Get 100 points for every friend that joins Rivet.</p>
                </div>
                <button className="bg-white text-violet-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors whitespace-nowrap">Invite Now</button>
              </div>
            </>
          ) : (
            <ContentView activeNav={activeNav} currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}