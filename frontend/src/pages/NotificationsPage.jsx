import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, Sparkles, Clock } from 'lucide-react';

export const NotificationsPage = () => {
  const { refreshNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/student/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.post(`/student/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      refreshNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/student/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      refreshNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-light border-t-rose animate-spin" />
        <p className="text-sm text-deep-muted font-medium">Загрузка оповещений...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-12 animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-light text-rose-dark flex items-center justify-center shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-deep">
              Центр Оповещений
            </h1>
            <p className="text-xs text-deep-muted">Уведомления о доступе, уроках и новостях платформы</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-2xl bg-white border border-cream-border text-xs font-semibold text-rose hover:bg-rose-light transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Прочитать все</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-cream-card rounded-3xl border border-cream-border shadow-soft">
          <Bell className="w-12 h-12 text-rose mx-auto mb-3 opacity-40" />
          <h3 className="font-serif text-lg font-bold text-deep">Пока нет оповещений</h3>
          <p className="text-xs text-deep-muted mt-1">Здесь будут отображаться все важные сообщения от администратора.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((note) => {
            const dateStr = new Date(note.created_at).toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  !note.is_read
                    ? 'bg-cream-card border-rose/30 shadow-soft'
                    : 'bg-white/60 border-cream-border opacity-90'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !note.is_read ? 'bg-rose text-white shadow-rose' : 'bg-cream-dark text-deep-muted'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-deep-muted flex items-center space-x-1 font-medium">
                        <Clock className="w-3 h-3 text-rose" />
                        <span>{dateStr}</span>
                      </span>
                      {!note.is_read && (
                        <span className="bg-rose text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Новое
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-deep leading-relaxed font-medium">
                      {note.message}
                    </p>
                  </div>
                </div>

                {!note.is_read && (
                  <button
                    onClick={() => handleMarkRead(note.id)}
                    title="Отметить прочитанным"
                    className="p-2 rounded-full text-deep-muted hover:text-rose hover:bg-rose-light transition-colors flex-shrink-0"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
