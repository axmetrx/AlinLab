import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VideoModal } from '../components/VideoModal';
import { Clock, Play, Lock, Sparkles, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-light border-t-rose animate-spin" />
        <p className="text-sm text-deep-muted font-medium">Загрузка материалов обучения...</p>
      </div>
    );
  }

  const access = data?.access || { is_active: false };
  const lessons = data?.lessons || [];

  // STUB SCREEN: Access Is Closed / Pending
  if (!access.is_active) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center animate-fade-in">
        
        {/* Soft Aesthetic Card Stub */}
        <div className="bg-cream-card/90 border border-cream-border rounded-3xl p-8 sm:p-12 shadow-soft relative overflow-hidden">
          
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-rose-light text-rose-dark flex items-center justify-center shadow-inner">
            <Lock className="w-10 h-10 stroke-[1.75]" />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-light text-rose-dark text-xs font-semibold uppercase tracking-wider mb-4">
            Статус доступа: Ожидание
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-deep mb-4 max-w-xl mx-auto leading-relaxed">
            Доступ к урокам пока закрыт. Пожалуйста, ожидайте активации от администратора
          </h2>

          <p className="text-sm text-deep-muted max-w-lg mx-auto leading-relaxed mb-8">
            Администратор платформы уже получил вашу заявку. Как только доступ будет открыт, вы получите оповещение в личном кабинете.
          </p>

          <div className="p-4 rounded-2xl bg-white border border-cream-border max-w-md mx-auto flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-deep">Совет по обучению</p>
              <p className="text-xs text-deep-muted">Подготовьте блокнот и выделите тихие 30 минут в день для просмотра лекций.</p>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ACTIVE ACCESS SCREEN: Lessons Grid + Timer Badge
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12 animate-fade-in space-y-8">
      
      {/* Top Banner: Access Status & Countdown */}
      <div className="bg-gradient-to-r from-cream-card via-white to-rose-light/30 border border-cream-border rounded-3xl p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose to-rose-hover text-white flex items-center justify-center shadow-rose flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-2xl font-bold text-deep">
                Ваши Доступные Уроки
              </h1>
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Активен
              </span>
            </div>
            <p className="text-xs text-deep-muted mt-0.5">
              Слушатель: <span className="font-semibold text-deep">{user?.full_name}</span>
            </p>
          </div>
        </div>

        {/* Timer Badge */}
        <div className="bg-white/90 border border-cream-border px-5 py-3 rounded-2xl shadow-sm flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-rose-light text-rose-dark flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-deep-muted uppercase font-bold tracking-wider">Срок действия доступа</p>
            <p className="text-sm font-bold text-rose-dark">
              {access.is_unlimited ? (
                <span>Бессрочный доступ</span>
              ) : (
                <span>Ваш доступ действует еще <strong className="text-deep font-extrabold">{access.days_remaining}</strong> {access.days_remaining === 1 ? 'день' : access.days_remaining < 5 ? 'дня' : 'дней'}</span>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Lessons Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-deep">
            Программа обучения
          </h2>
          <p className="text-xs text-deep-muted">Нажмите на карточку для просмотра видеоматериала</p>
        </div>
        <span className="text-xs font-semibold text-rose-dark bg-rose-light px-3 py-1 rounded-full">
          Всего уроков: {lessons.length}
        </span>
      </div>

      {/* Lessons Cards Grid */}
      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-cream-card rounded-3xl border border-cream-border">
          <BookOpen className="w-12 h-12 text-rose mx-auto mb-3 opacity-60" />
          <p className="text-sm font-semibold text-deep">Материалы пока добавляются</p>
          <p className="text-xs text-deep-muted mt-1">Скоро администратор опубликует первые видеоуроки.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-cream-card border border-cream-border rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-deep/5 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Decorative Play Button */}
                  <div className="w-14 h-14 rounded-full bg-white/90 text-rose-dark flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose group-hover:text-white transition-all duration-300 relative z-10">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>

                  <span className="absolute top-3 left-3 bg-cream/90 backdrop-blur-md text-deep text-xs px-3 py-1 rounded-full font-semibold">
                    Урок #{index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-lg font-bold text-deep group-hover:text-rose transition-colors line-clamp-2 mb-2">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-deep-muted line-clamp-3 leading-relaxed">
                    {lesson.description || 'Описание к уроку отсутствует.'}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-6 py-4 border-t border-cream-border/60 bg-white/50 flex items-center justify-between">
                <span className="text-[11px] text-deep-muted flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose" />
                  <span>Видеоурок</span>
                </span>
                <span className="text-xs font-semibold text-rose group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Смотреть</span>
                  <Play className="w-3 h-3 fill-rose" />
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {selectedLesson && (
        <VideoModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}

    </div>
  );
};
