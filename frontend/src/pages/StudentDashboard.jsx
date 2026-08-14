import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LessonView } from '../components/LessonView';
import { Calendar, Play, Lock, Sparkles, BookOpen, FileText, Images, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeCourse, setActiveCourse] = useState(false); // Controls landing screen vs module details

  // Collapsible modules state
  const [expandedModules, setExpandedModules] = useState({});

  // Local storage completion tracking
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('completed_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
      if (res.data.completed_lesson_ids) {
        setCompletedLessons(res.data.completed_lesson_ids);
        localStorage.setItem('completed_lessons', JSON.stringify(res.data.completed_lesson_ids));
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const lessons = data?.lessons || [];

  // Group lessons by module
  const groupedLessons = lessons.reduce((acc, lesson) => {
    const mod = lesson.module || 'Модуль 1';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(lesson);
    return acc;
  }, {});

  const moduleKeys = Object.keys(groupedLessons).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Expand first module by default
  useEffect(() => {
    if (moduleKeys.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [moduleKeys[0]]: true });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-rose-light border-t-rose animate-spin" />
        <p className="text-sm text-deep-muted font-medium">Загрузка...</p>
      </div>
    );
  }

  const access = data?.access || { is_active: false };

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

  const markLessonComplete = async (lessonId) => {
    try {
      await api.post(`/student/lessons/${lessonId}/complete`);
      setCompletedLessons(prev => {
        if (prev.includes(lessonId)) return prev;
        const next = [...prev, lessonId];
        localStorage.setItem('completed_lessons', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error('Failed to mark lesson complete on server:', err);
      // Fallback
      setCompletedLessons(prev => {
        if (prev.includes(lessonId)) return prev;
        const next = [...prev, lessonId];
        localStorage.setItem('completed_lessons', JSON.stringify(next));
        return next;
      });
    }
  };

  // LESSON VIEW
  if (selectedLesson) {
    return (
      <LessonView 
        lesson={selectedLesson} 
        onBack={() => setSelectedLesson(null)} 
        onComplete={() => {
          markLessonComplete(selectedLesson.id);
          setSelectedLesson(null);
        }}
      />
    );
  }

  const getLessonIcon = (lType) => {
    if (lType === 'file') return <FileText className="w-4 h-4 text-deep-muted" />;
    if (lType === 'gallery') return <Images className="w-4 h-4 text-deep-muted" />;
    return <Play className="w-4 h-4 text-deep-muted fill-deep-muted" />;
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

  // Dynamic progress values
  const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const toggleModule = (modName) => {
    setExpandedModules(prev => ({
      ...prev,
      [modName]: !prev[modName]
    }));
  };

  const handleContinueStudy = () => {
    if (lessons.length === 0) return;
    const firstUncompleted = lessons.find(l => !completedLessons.includes(l.id));
    setSelectedLesson(firstUncompleted || lessons[0]);
  };

  // SCREEN 1: My Courses Landing (when activeCourse is false)
  if (!activeCourse) {
    return (
      <div className="max-w-lg mx-auto bg-cream-card min-h-[calc(100vh-64px)] animate-fade-in pb-24 md:pb-8 flex flex-col">
        {/* Cover Photo */}
        <div className="w-full aspect-[16/9] relative overflow-visible">
          <img 
            src="/course_cover.jpg" 
            alt="Okademalin Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-tr from-[#00DECC] to-[#00A1FC] flex items-center justify-center text-white font-bold text-xl shadow-md">
              Ok
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="text-center mt-12 px-5">
          <div className="flex items-center justify-center space-x-1">
            <h1 className="text-xl font-bold text-deep">Okademalin</h1>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#00A1FC] text-white">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
          <p className="text-xs text-deep-muted mt-1 font-medium">by Okademalin Team</p>
        </div>

        {/* Courses Section */}
        <div className="px-5 mt-8 flex-1">
          <h3 className="text-[15px] font-bold text-deep mb-4 text-left">Мои курсы</h3>

          {/* Clickable Course Card */}
          <button
            onClick={() => setActiveCourse(true)}
            className="w-full bg-white rounded-3xl border border-cream-border overflow-hidden shadow-soft hover:shadow-md active:scale-[0.99] transition-all text-left flex flex-col"
          >
            <div className="w-full aspect-[16/9]">
              <img 
                src="/course_cover.jpg" 
                alt="Okademalin Course" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-3">
              <div>
                <h4 className="text-[16px] font-bold text-deep">Okademalin</h4>
                <p className="text-[12px] text-deep-muted mt-1 leading-snug">
                  Учебный курс по развитию и освоению профессиональных навыков.
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-1.5 bg-cream-dark rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00A1FC] to-[#00DECC] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-deep-muted">
                  <span>{completedCount}/{lessons.length} уроков</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Branding Footer */}
        <div className="text-center py-6 text-[11px] text-deep-light">
          Сделано на 1Study
        </div>
      </div>
    );
  }

  // SCREEN 2: Course Modules & Lessons Detail (when activeCourse is true)
  return (
    <div className="max-w-lg mx-auto bg-white min-h-[calc(100vh-64px)] animate-fade-in pb-36 md:pb-8 relative">
      
      {/* Course Banner */}
      <div className="w-full aspect-[16/9] relative overflow-hidden">
        <img 
          src="/course_cover.jpg" 
          alt="Okademalin Cover" 
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => setActiveCourse(false)}
          className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-full transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Course Info */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-lg font-bold text-deep">Okademalin</h1>
        <p className="text-[13px] text-deep-muted leading-snug mt-1">
          Система, которая превращает обучение в удобный и эффективный процесс
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
      <div className="mx-5 bg-cream rounded-2xl p-4 space-y-3 border border-cream-border">
        {/* Progress bar */}
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-deep font-medium">{completedCount} из {lessons.length} уроков</span>
          <span className="text-deep-muted font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-cream-dark rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00A1FC] to-[#00DECC] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
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

      {/* Lessons List - ReelsLab Collapsible Accordion Style */}
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
          <div className="px-5 space-y-3">
            {moduleKeys.map((modName) => {
              const modLessons = groupedLessons[modName];
              const completedModLessons = modLessons.filter(l => completedLessons.includes(l.id)).length;
              const isExpanded = expandedModules[modName];

              return (
                <div key={modName} className="border border-cream-border rounded-2xl bg-white overflow-hidden shadow-sm">
                  {/* Collapsible Module Header */}
                  <button
                    onClick={() => toggleModule(modName)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-cream/35 hover:bg-cream/70 transition-colors text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[13.5px] font-bold text-deep truncate">{modName}</h4>
                      <p className="text-[10px] text-deep-muted mt-0.5">
                        {completedModLessons} из {modLessons.length} уроков
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-deep-muted transition-transform duration-200 ml-2 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Collapsible Module Lessons */}
                  {isExpanded && (
                    <div className="divide-y divide-cream-border/50 bg-white">
                      {modLessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const lType = lesson.lesson_type || 'video';

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className="w-full flex items-center px-4 py-3 hover:bg-cream-dark/20 active:bg-cream-dark/40 transition-colors text-left group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-cream flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-rose-light transition-colors">
                              {getLessonIcon(lType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12.5px] font-medium text-deep group-hover:text-rose transition-colors truncate">
                                {lesson.title}
                              </p>
                            </div>
                            {isCompleted && (
                              <span className="w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mr-2 shadow-sm">
                                <Check className="w-3 h-3 stroke-[3.5]" />
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-deep-light flex-shrink-0 group-hover:text-rose transition-transform group-hover:translate-x-0.5" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Button */}
      {lessons.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 px-5 z-30 max-w-lg mx-auto">
          <button
            onClick={handleContinueStudy}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00A1FC] to-[#00DECC] text-white font-semibold text-[15px] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Продолжить обучение
          </button>
        </div>
      )}

    </div>
  );
};
