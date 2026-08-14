import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Bell, User, Shield, Truck } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { user, unreadCount } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-lg border-t border-cream-border py-2 px-4 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Admin Tab or Courses Tab */}
        {user?.role === 'admin' ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-colors ${
              activeTab === 'admin' ? 'text-rose font-semibold' : 'text-deep-muted hover:text-deep'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[11px]">Админ</span>
          </button>
        ) : null}

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-colors ${
            activeTab === 'courses' ? 'text-rose font-semibold' : 'text-deep-muted hover:text-deep'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px]">Курсы</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-colors ${
            activeTab === 'suppliers' ? 'text-rose font-semibold' : 'text-deep-muted hover:text-deep'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[11px]">Поставщики</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-colors relative ${
            activeTab === 'notifications' ? 'text-rose font-semibold' : 'text-deep-muted hover:text-deep'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Оповещения</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-colors ${
            activeTab === 'profile' ? 'text-rose font-semibold' : 'text-deep-muted hover:text-deep'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px]">Профиль</span>
        </button>

      </div>
    </div>
  );
};
