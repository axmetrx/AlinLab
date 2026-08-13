import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Bell, User as UserIcon, Shield, LogOut, BookOpen } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, unreadCount } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-cream-border transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab(user?.role === 'admin' ? 'admin' : 'courses')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose to-rose-hover flex items-center justify-center text-white shadow-rose transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-serif text-2xl font-semibold tracking-wide text-deep block leading-tight">
              Okademalin

            </span>
            <span className="text-[10px] tracking-widest text-deep-muted uppercase block font-medium">
              Академия Обучения
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-cream-card/80 p-1.5 rounded-full border border-cream-border/60">
          {user?.role === 'admin' ? (
            <>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'admin'
                    ? 'bg-white text-rose-dark shadow-sm font-semibold'
                    : 'text-deep-muted hover:text-deep hover:bg-white/50'
                }`}
              >
                <Shield className="w-4 h-4 text-rose" />
                <span>Панель Управления</span>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'courses'
                    ? 'bg-white text-rose-dark shadow-sm font-semibold'
                    : 'text-deep-muted hover:text-deep hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-rose" />
                <span>Обзор Уроков</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'courses'
                  ? 'bg-white text-rose-dark shadow-sm font-semibold'
                  : 'text-deep-muted hover:text-deep hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-rose" />
              <span>Обучение</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 relative ${
              activeTab === 'notifications'
                ? 'bg-white text-rose-dark shadow-sm font-semibold'
                : 'text-deep-muted hover:text-deep hover:bg-white/50'
            }`}
          >
            <Bell className="w-4 h-4 text-rose" />
            <span>Оповещения</span>
            {unreadCount > 0 && (
              <span className="ml-1 bg-rose text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-white text-rose-dark shadow-sm font-semibold'
                : 'text-deep-muted hover:text-deep hover:bg-white/50'
            }`}
          >
            <UserIcon className="w-4 h-4 text-rose" />
            <span>Профиль</span>
          </button>
        </nav>

        {/* User Right Menu */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 bg-cream-card px-3.5 py-1.5 rounded-full border border-cream-border/60">
            <div className="w-7 h-7 rounded-full bg-rose-light text-rose-dark font-semibold text-xs flex items-center justify-center">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-deep block truncate max-w-[120px]">
                {user?.full_name}
              </span>
              <span className="text-[10px] text-deep-muted block">
                {user?.role === 'admin' ? 'Администратор' : 'Студент'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Выйти"
            className="p-2.5 rounded-full text-deep-muted hover:text-rose-hover hover:bg-rose-light/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
