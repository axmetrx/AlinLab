import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LessonView } from '../components/LessonView';
import { Clock, Play, Lock, Sparkles, BookOpen, FileText, Images, ShieldCheck } from 'lucide-react';

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
        <p className="text-sm text-deep-muted font-medium">Загрузка материалов...</p>
      </div>
    );
  }

  const access = data?.access || { is_active: false };
  const lessons = data?.lessons || [];

  // STUB SCREEN: Access Is Closed / Pending
  if (!access.is_active) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="bg-cream-card/90 border border-cream-border rounded-3xl p-8 sm:p-12 shadow-soft relative overflow-hidden">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-rose-light text-rose-dark flex items-center justify-center shadow-inner">
            <Lock className="w-10 h-10 stroke-[1.75]" />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-light text-rose-dark text-xs font-semibold uppercase tracking-wider mb-4">
            Статус: Ожидание
          </span>

          <h2 className="font-serif text-xl sm:text-3xl font-bold text-deep mb-4 max-w-xl mx-auto leading-relaxed">
            Доступ к урокам пока закрыт
          </h2>

          <p className="text-sm text-deep-muted max-w-lg mx-auto leading-relaxed mb-8">
            Ожидайте активации от администратора. Как только доступ будет открыт, вы получите оповещение.
          </p>

          <div className="p-4 rounded-2xl bg-white border border-cream-border max-w-md mx-auto flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-deep">Совет по обучению</p>
              <p className="text-xs text-deep-muted">Подготовьте блокнот и выделите тихие 30 минут в день для лекций.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (lType) => {
    if (lType === 'file') return <FileText className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (lType === 'gallery') return <Images className="w-5 h-5 sm:w-6 sm:h-6" />;
    return <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />;
  };

  const getTypeLabel = (lType) => {
    if (lType === 'file') return 'Файл';
    if (lType === 'gallery') return 'Галерея';
    return 'Видео';
  };

  const getActionLabel = (lType) => {
    if (lType === 'file') return 'Открыть';
    if (lType === 'gallery') return 'Смотреть';
    return 'Смотреть';
  };

  // ACTIVE ACCESS SCREEN: Lessons Grid or Lesson View
  if (selectedLesson) {
    return <LessonView lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 animate-fade-in space-y-6">
      
      {/* Access Status Banner */}
      <div className="bg-cream-card border border-cream-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose to-rose-hover text-white flex items-center justify-center shadow-rose flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-lg sm:text-2xl font-bold text-deep">
                  Ваши Уроки
                </h1>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold">
                  Активен
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-deep-muted mt-0.5">
                Слушатель: <span className="font-semibold text-deep">{user?.full_name}</span>
              </p>
            </div>
          </div>

          {/* Timer Badge */}
          <div className="bg-white/90 border border-cream-border px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-light text-rose-dark flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] text-deep-muted uppercase font-bold tracking-wider">Доступ</p>
              <p className="text-xs sm:text-sm font-bold text-rose-dark">
                {access.is_unlimited ? (
                  <span>Бессрочный</span>
                ) : (
                  <span>Ещё <strong className="text-deep font-extrabold">{access.days_remaining}</strong> {access.days_remaining === 1 ? 'день' : access.days_remaining < 5 ? 'дня' : 'дней'}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-deep">
            Программа обучения
          </h2>
          <p className="text-[11px] sm:text-xs text-deep-muted">Нажмите на урок для просмотра</p>
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-rose-dark bg-rose-light px-3 py-1 rounded-full">
          {lessons.length} {lessons.length === 1 ? 'урок' : lessons.length < 5 ? 'урока' : 'уроков'}
        </span>
      </div>

      {/* Lessons Cards Grid */}
      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-cream-card rounded-3xl border border-cream-border">
          <BookOpen className="w-12 h-12 text-rose mx-auto mb-3 opacity-60" />
          <p className="text-sm font-semibold text-deep">Материалы пока добавляются</p>
          <p className="text-xs text-deep-muted mt-1">Скоро администратор опубликует первые уроки.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {lessons.map((lesson, index) => {
            const lType = lesson.lesson_type || 'video';

            return (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className="bg-cream-card border border-cream-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-soft hover:shadow-xl active:scale-[0.98] transition-all duration-200 group cursor-pointer flex flex-col"
              >
                {/* Thumbnail Area */}
                <div className="relative aspect-[16/10] bg-deep/5 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                  
                  {/* Play / Open Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 text-rose-dark flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose group-hover:text-white transition-all duration-300 relative z-10">
                    {getTypeIcon(lType)}
                  </div>

                  <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-cream/90 backdrop-blur-md text-deep text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold">
                    #{index + 1} • {getTypeLabel(lType)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 flex-1">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-deep group-hover:text-rose transition-colors line-clamp-2 mb-1.5">
                    {lesson.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-deep-muted line-clamp-2 leading-relaxed">
                    {lesson.description || 'Описание к уроку отсутствует.'}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-cream-border/60 bg-white/50 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-deep-muted flex items-center space-x-1 font-semibold">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose" />
                    <span>{getTypeLabel(lType)}</span>
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-rose group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>{getActionLabel(lType)}</span>
                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
