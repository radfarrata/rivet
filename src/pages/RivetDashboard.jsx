import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '../components/rivet/Sidebar';
import Header from '../components/rivet/Header';
import ContentView from '../components/rivet/ContentView';
import SearchResults from '../components/rivet/SearchResults';
import ProfileView from '../components/rivet/ProfileView';
import NotificationsPanel from '../components/rivet/NotificationsPanel';
import { BalanceCard, TodayActivity } from '../components/rivet/BalanceCard';
import HubCards from '../components/rivet/HubCards';
import TopContributors from '../components/rivet/TopContributors';
import DashboardWidgets from '../components/rivet/DashboardWidgets';

export default function RivetDashboard() {
  const [activeNav, setActiveNav] = useState('home');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const handleViewProfile = (user) => {
    setProfileUser({
      name: user.author || user.name,
      handle: user.handle,
      isAgent: user.isAgent,
      trustScore: user.trustScore,
      uid: user.created_by_id || user.uid,
    });
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar
        activeNav={activeNav}
        onNavChange={(id) => { setActiveNav(id); setSearchQuery(''); setProfileUser(null); setIsMobileNavOpen(false); }}
        isMobileOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
        currentUser={currentUser}
        onProfileClick={() => handleViewProfile({ name: currentUser?.full_name || 'You', handle: '@you', uid: currentUser?.id })}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentUser={currentUser} onMenuClick={() => setIsMobileNavOpen(true)} onSearchChange={setSearchQuery} onBellClick={() => setShowNotifications(true)} onAvatarClick={() => handleViewProfile({ name: currentUser?.full_name || 'You', handle: '@you', uid: currentUser?.id })} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {searchQuery ? (
            <SearchResults query={searchQuery} currentUser={currentUser} onViewProfile={handleViewProfile} />
          ) : profileUser ? (
            <ProfileView user={profileUser} currentUser={currentUser} onBack={() => setProfileUser(null)} onViewProfile={handleViewProfile} />
          ) : activeNav === 'home' ? (
            <>
              {/* Greeting */}
              <div className="rounded-2xl border border-[#2f3336] bg-[#16181c] p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9d4f7a] mb-2">Dashboard</p>
                <h1 className="text-2xl font-bold tracking-tight text-[#e7e9ea]">Good morning, {currentUser?.full_name?.split(' ')[0] || 'there'}</h1>
                <p className="text-sm text-[#71767b] mt-1">Let's build something great today.</p>
              </div>

              {/* Top row: Balance + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><BalanceCard userId={currentUser?.id} /></div>
                <TodayActivity />
              </div>

              {/* Hub cards */}
              <HubCards onNavigate={(id) => { setActiveNav(id); setSearchQuery(''); }} />

              {/* Top Contributors */}
              <TopContributors onViewProfile={handleViewProfile} />

              {/* Dashboard widgets */}
              <DashboardWidgets />
            </>
          ) : (
            <ContentView activeNav={activeNav} currentUser={currentUser} onViewProfile={handleViewProfile} />
          )}
        </main>
      </div>
      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
    </div>
  );
}