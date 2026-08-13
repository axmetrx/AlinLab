import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return user?.role === 'admin' ? 'admin' : 'courses';
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rose-light border-t-rose animate-spin mx-auto" />
          <p className="text-sm font-medium text-deep-muted">Загрузка платформы Okademalin...</p>

        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-deep">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
        {activeTab === 'courses' && <StudentDashboard />}
        {activeTab === 'notifications' && <NotificationsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
