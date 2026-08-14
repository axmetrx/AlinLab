import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LessonView } from '../components/LessonView';
import { Calendar, Play, Lock, Sparkles, BookOpen, FileText, Images, ChevronRight, CheckCircle2 } from 'lucide-react';

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
        <div className="w-10 h-10 rounded-full border-3 border-rose-light border-t-rose animate-spin" />
        <p className="text-sm text-deep-muted font-medium">Загрузка...</p>
      </div>
    );
  }

  const access = data?.access || { is_active: false };
  const lessons = data?.lessons || [];

  // ACCESS CLOSED
  if (!access.is_active) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="bg-white border border-cream-border rounded-2xl p-8 shadow-soft">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-cream-dark flex items-center justify-center">
            <Lock className="w-7 h-7 text-deep-muted" />
          </div>
          <h2 className="text-xl font-bold text-deep mb-2">Доступ закрыт</h2>
          <p className="text-sm text-deep-muted leading-relaxed mb-6">
            Ожидайте активации от администратора. Вы получите уведомление.
          </p>
          <div className="p-3 rounded-xl bg-cream flex items-center space-x-3 text-left">
            <Sparkles className="w-5 h-5 text-rose flex-shrink-0" />
            <p className="text-xs text-deep-muted">Подготовьте блокнот для заметок к урокам.</p>
          </div>
        </div>
      </div>
    );
  }

  // LESSON VIEW
  if (selectedLesson) {
    return <LessonView lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  }

  const getLessonIcon = (lType) => {
    if (lType === 'file') return <FileText className="w-[18px] h-[18px] text-deep-muted" />;
    if (lType === 'gallery') return <Images className="w-[18px] h-[18px] text-deep-muted" />;
    return <Play className="w-[18px] h-[18px] text-deep-muted fill-deep-muted" />;
  };

  // Format access expiry
  const formatExpiry = () => {
    if (access.is_unlimited) return 'Бессрочный доступ';
    if (access.days_remaining) {
      const d = access.days_remaining;
      const word = d === 1 ? 'день' : d < 5 ? 'дня' : 'дней';
      return `Осталось ${d} ${word}`;
    }
    return '';
  };

  const formatExpiryDate = () => {
    if (access.is_unlimited) return null;
    if (access.expires_at) {
      const date = new Date(access.expires_at);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return null;
  };

  const expiryDate = formatExpiryDate();

  // MAIN COURSE VIEW
  return (
    <div className="max-w-lg mx-auto bg-white min-h-[calc(100vh-64px)] animate-fade-in pb-28 md:pb-8">

      {/* Course Banner */}
      <div className="w-full aspect-[16/9] bg-gradient-to-tr from-[#00DECC] to-[#00A1FC] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-rose" />
            </div>
            <h2 className="text-xl font-bold text-deep tracking-wide">Okademalin</h2>
          </div>
        </div>
        {/* Decorative wave */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 30" preserveAspectRatio="none">
          <path d="M0,30 L0,15 Q100,0 200,15 Q300,30 400,15 L400,30 Z" fill="white" />
        </svg>
      </div>

      {/* Course Info */}
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-lg font-bold text-deep">Okademalin</h1>
        <p className="text-[13px] text-deep-muted leading-snug mt-1">
          Онлайн-платформа обучения
        </p>

        {/* Tags */}
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-[11px] font-semibold text-rose-dark bg-rose-light px-3 py-1 rounded-full">
            Курс
          </span>
          <span className="text-[11px] font-semibold text-rose-dark bg-rose-light px-3 py-1 rounded-full">
            Активный
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mx-5 bg-cream-dark rounded-2xl p-4 space-y-3">
        {/* Progress bar */}
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-deep font-medium">0 из {lessons.length} уроков</span>
          <span className="text-deep-muted font-semibold">0%</span>
        </div>
        <div className="w-full h-2 bg-cream-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00A1FC] to-[#00DECC] rounded-full transition-all duration-500" style={{ width: '0%' }} />
        </div>

        {/* Access info */}
        {(expiryDate || access.is_unlimited) && (
          <div className="flex items-center justify-between text-[12px] text-deep-muted pt-1">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{access.is_unlimited ? 'Бессрочный доступ' : `Доступ до ${expiryDate}`}</span>
            </div>
            {!access.is_unlimited && (
              <span className="font-semibold text-rose-dark">{formatExpiry()}</span>
            )}
          </div>
        )}
      </div>

      {/* Lessons List */}
      <div className="mt-6">
        <div className="px-5 mb-3">
          <h3 className="text-[15px] font-bold text-deep">Программа обучения</h3>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-10 px-5">
            <BookOpen className="w-10 h-10 text-deep-light mx-auto mb-2" />
            <p className="text-sm text-deep-muted">Уроки скоро появятся</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-border">
            {lessons.map((lesson, index) => {
              const lType = lesson.lesson_type || 'video';
              const isLast = index === lessons.length - 1;

              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="w-full flex items-center px-5 py-3.5 hover:bg-cream-dark/40 active:bg-cream-dark transition-colors text-left group"
                >
                  {/* Lesson icon */}
                  <div className="w-9 h-9 rounded-xl bg-cream-dark flex items-center justify-center flex-shrink-0 mr-3.5 group-hover:bg-rose-light transition-colors">
                    {getLessonIcon(lType)}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-deep truncate leading-snug">
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-[11px] text-deep-muted truncate mt-0.5">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4.5 h-4.5 text-deep-light flex-shrink-0 ml-2 group-hover:text-rose transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Button */}
      {lessons.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-5 z-30 max-w-lg mx-auto">
          <button
            onClick={() => setSelectedLesson(lessons[0])}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00A1FC] to-[#00DECC] text-white font-semibold text-[15px] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Продолжить обучение
          </button>
        </div>
      )}

    </div>
  );
};
