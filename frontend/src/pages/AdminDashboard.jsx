import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Shield, Users, BookOpen, Plus, Calendar, Clock, CheckCircle, XCircle, Trash2, Edit3, Sparkles, X, Link, Play, Upload, FileText } from 'lucide-react';


export const AdminDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState('students'); // 'students' | 'lessons'
  
  // Students & Access State
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [accessModalStudent, setAccessModalStudent] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('30'); // '7', '30', '90', '365', 'unlimited', 'custom'
  const [customDays, setCustomDays] = useState('14');
  const [accessLoading, setAccessLoading] = useState(false);

  // Lessons State
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonType, setLessonType] = useState('video'); // 'video' | 'file' | 'gallery'
  const [sourceType, setSourceType] = useState('url'); // 'url' | 'upload'
  const [galleryUrls, setGalleryUrls] = useState('');
  const [lessonSubmitLoading, setLessonSubmitLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      let uploadedUrl = res.data.url;
      if (uploadedUrl && uploadedUrl.startsWith('/')) {
        const backendBase = (import.meta.env.VITE_API_URL || 'https://alinlab-backend.onrender.com/api').replace(/\/api\/?$/, '');
        uploadedUrl = `${backendBase}${uploadedUrl}`;
      }

      if (lessonType === 'gallery') {
        setGalleryUrls(prev => (prev ? `${prev}\n${uploadedUrl}` : uploadedUrl));
      } else {
        setLessonVideoUrl(uploadedUrl);
      }
      setFileUploading(false);
    } catch (uploadErr) {
      console.warn('Backend file upload failed, applying FileReader DataURL fallback:', uploadErr);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        if (lessonType === 'gallery') {
          setGalleryUrls(prev => (prev ? `${prev}\n${dataUrl}` : dataUrl));
        } else {
          setLessonVideoUrl(dataUrl);
        }
        setFileUploading(false);
      };
      reader.onerror = () => {
        alert('Не удалось прочесть файл с компьютера');
        setFileUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };




  // Fetch Data
  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/users');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await api.get('/admin/lessons');
      setLessons(res.data);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLessonsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchLessons();
  }, []);

  // --- GRANT / MODIFY ACCESS ---
  const handleOpenAccessModal = (student) => {
    setAccessModalStudent(student);
    setSelectedDuration('30');
    setCustomDays('14');
  };

  const handleSaveAccess = async (e) => {
    e.preventDefault();
    if (!accessModalStudent) return;
    setAccessLoading(true);

    let days = null;
    if (selectedDuration === 'unlimited') {
      days = null;
    } else if (selectedDuration === 'custom') {
      days = parseInt(customDays, 10) || 30;
    } else {
      days = parseInt(selectedDuration, 10);
    }

    try {
      await api.post('/admin/access', {
        user_id: accessModalStudent.id,
        duration_days: days,
        is_active: true
      });
      setAccessModalStudent(null);
      fetchStudents();
    } catch (err) {
      alert('Ошибка при выдаче доступа: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAccessLoading(false);
    }
  };

  const handleRevokeAccess = async (studentId) => {
    if (!window.confirm('Вы действительно хотите отменить доступ для этого ученика?')) return;
    try {
      await api.post(`/admin/access/revoke/${studentId}`);
      fetchStudents();
    } catch (err) {
      alert('Ошибка при отмене доступа');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Вы уверены, что хотите полностью удалить ученика «${studentName}»? Это действие необратимо.`)) return;
    try {
      await api.delete(`/admin/users/${studentId}`);
      fetchStudents();
    } catch (err) {
      alert('Ошибка при удалении ученика: ' + (err.response?.data?.detail || err.message));
    }
  };


  // --- LESSONS CRUD ---
  const handleOpenCreateLesson = () => {
    setEditingLesson(null);
    setLessonTitle('');
    setLessonDesc('');
    setLessonVideoUrl('');
    setLessonType('video');
    setSourceType('url');
    setGalleryUrls('');
    setUploadedFileName('');
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDesc(lesson.description || '');
    setLessonVideoUrl(lesson.video_url || '');
    setLessonType(lesson.lesson_type || 'video');
    setSourceType(lesson.video_url?.startsWith('/uploads') ? 'upload' : 'url');
    setGalleryUrls(lesson.gallery_urls || '');
    setUploadedFileName(lesson.video_url?.startsWith('/uploads') ? 'Загруженный файл' : '');
    setLessonModalOpen(true);
  };


  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setLessonSubmitLoading(true);

    try {
      const payload = {
        title: lessonTitle,
        description: lessonDesc,
        video_url: lessonVideoUrl,
        lesson_type: lessonType,
        gallery_urls: galleryUrls
      };

      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, payload);
      } else {
        await api.post('/admin/lessons', payload);
      }
      setLessonModalOpen(false);
      fetchLessons();
    } catch (err) {
      alert('Ошибка при сохранении материала: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLessonSubmitLoading(false);
    }
  };


  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот урок?')) return;
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      fetchLessons();
    } catch (err) {
      alert('Ошибка при удалении урока');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12 animate-fade-in space-y-8">
      
      {/* Admin Header */}
      <div className="bg-cream-card border border-cream-border rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-rose to-rose-hover text-white flex items-center justify-center shadow-rose">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep">
              Панель Администратора
            </h1>
            <p className="text-xs text-deep-muted mt-0.5">Управление учениками, доступом и учебными видеоуроками</p>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center space-x-2 bg-white/80 p-1.5 rounded-2xl border border-cream-border w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
              activeSubTab === 'students' ? 'bg-rose text-white shadow-rose' : 'text-deep-muted hover:text-deep'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ученики ({students.length})</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('lessons')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
              activeSubTab === 'lessons' ? 'bg-rose text-white shadow-rose' : 'text-deep-muted hover:text-deep'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Уроки ({lessons.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STUDENTS & ACCESS */}
      {activeSubTab === 'students' && (
        <div className="bg-white border border-cream-border rounded-3xl overflow-hidden shadow-soft">
          
          <div className="p-6 border-b border-cream-border bg-cream-card/50 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-deep">
                Список зарегистрированных учеников
              </h2>
              <p className="text-xs text-deep-muted">Выдавайте и продлевайте доступ к учебной программе в клик</p>
            </div>
          </div>

          {studentsLoading ? (
            <div className="p-12 text-center text-sm text-deep-muted">Загрузка списка учеников...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-sm text-deep-muted">Зарегистрированных учеников пока нет.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-deep">
                <thead className="bg-cream-dark/50 text-[11px] font-bold uppercase tracking-wider text-deep-muted border-b border-cream-border">
                  <tr>
                    <th className="py-4 px-6">Ученик</th>
                    <th className="py-4 px-6">Дата регистрации</th>
                    <th className="py-4 px-6">Текущий доступ</th>
                    <th className="py-4 px-6 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border">
                  {students.map((st) => {
                    const access = st.access;
                    const isActive = access?.is_active;
                    const isUnlimited = access?.is_unlimited;
                    const days = access?.days_remaining;

                    return (
                      <tr key={st.id} className="hover:bg-cream-card/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-rose-light text-rose-dark font-semibold text-xs flex items-center justify-center">
                              {st.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-deep">{st.full_name}</p>
                              <p className="text-xs text-deep-muted">{st.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-xs text-deep-muted">
                          {new Date(st.created_at).toLocaleDateString('ru-RU')}
                        </td>

                        <td className="py-4 px-6">
                          {isActive ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{isUnlimited ? 'Бессрочно' : `${days} дн.`}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Закрыт</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenAccessModal(st)}
                              className="px-3.5 py-1.5 rounded-xl bg-rose text-white text-xs font-semibold hover:bg-rose-hover transition-colors shadow-sm"
                            >
                              {isActive ? 'Продлить / Изменить' : 'Выдать доступ'}
                            </button>

                            {isActive && (
                              <button
                                onClick={() => handleRevokeAccess(st.id)}
                                title="Отменить доступ"
                                className="p-1.5 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteStudent(st.id, st.full_name)}
                              title="Удалить ученика"
                              className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: LESSONS MANAGEMENT */}
      {activeSubTab === 'lessons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-deep">
                Каталог Видеоуроков
              </h2>
              <p className="text-xs text-deep-muted">Всего материалов: {lessons.length}</p>
            </div>
            <button
              onClick={handleOpenCreateLesson}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose to-rose-hover text-white text-xs font-semibold shadow-rose hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить видеоурок</span>
            </button>
          </div>

          {lessonsLoading ? (
            <div className="p-12 text-center text-sm text-deep-muted bg-white rounded-3xl">Загрузка уроков...</div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center text-sm text-deep-muted bg-white rounded-3xl border border-cream-border">Уроков пока нет. Создайте первый урок прямо сейчас!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="bg-white border border-cream-border rounded-3xl p-6 shadow-soft flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-dark bg-rose-light px-2.5 py-1 rounded-full mb-3 inline-block">
                        Урок #{lesson.id}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditLesson(lesson)}
                          className="p-2 rounded-xl text-deep-muted hover:text-rose hover:bg-rose-light transition-colors"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 rounded-xl text-deep-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-deep mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-deep-muted line-clamp-3 leading-relaxed mb-3">
                      {lesson.description || 'Описание отсутствует.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-cream-border flex items-center justify-between text-xs text-deep-muted">
                    <span className="truncate max-w-[240px] flex items-center space-x-1">
                      <Link className="w-3.5 h-3.5 text-rose flex-shrink-0" />
                      <span className="truncate">{lesson.video_url}</span>
                    </span>
                    <span>{new Date(lesson.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- GRANT ACCESS MODAL --- */}
      {accessModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-cream rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-border space-y-6">
            <div className="flex items-center justify-between border-b border-cream-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-light text-rose-dark flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-deep">Выдать доступ</h3>
                  <p className="text-xs text-deep-muted">{accessModalStudent.full_name}</p>
                </div>
              </div>
              <button onClick={() => setAccessModalStudent(null)} className="p-1 rounded-full text-deep-muted hover:text-deep">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-deep mb-2 uppercase tracking-wider">
                  Выберите срок действия
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '7 Дней', val: '7' },
                    { label: '30 Дней', val: '30' },
                    { label: '90 Дней', val: '90' },
                    { label: '365 Дней', val: '365' },
                    { label: 'Бессрочно', val: 'unlimited' },
                    { label: 'Свой срок', val: 'custom' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSelectedDuration(opt.val)}
                      className={`py-3 px-3 rounded-2xl text-xs font-semibold transition-all border ${
                        selectedDuration === opt.val
                          ? 'bg-rose text-white border-rose shadow-rose'
                          : 'bg-white text-deep border-cream-border hover:bg-cream-card'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDuration === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-deep mb-1">
                    Укажите количество дней:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-cream-border text-deep text-sm focus:outline-none focus:border-rose"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={accessLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose to-rose-hover text-white font-semibold text-sm shadow-rose hover:shadow-lg transition-all disabled:opacity-50 mt-2"
              >
                {accessLoading ? 'Сохранение...' : 'Подтвердить и открыть доступ'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT LESSON MODAL --- */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-deep/70 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fade-in">
          <div className="bg-cream rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cream-border my-auto max-h-[85vh] overflow-y-auto space-y-6 scrollbar-thin">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cream-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-light text-rose-dark flex items-center justify-center shadow-inner">
                  <Play className="w-5 h-5 fill-rose-dark" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-deep leading-tight">
                    {editingLesson ? 'Редактировать материал' : 'Добавить новый материал'}
                  </h3>
                  <p className="text-xs text-deep-muted mt-0.5">
                    Материал сразу появится в программе обучения
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setLessonModalOpen(false)} 
                className="p-2 rounded-full text-deep-muted hover:text-deep hover:bg-cream-card transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              
              {/* Source Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-deep mb-2 uppercase tracking-wider">
                  Способ добавления материала
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceType('url')}
                    className={`py-3 px-4 rounded-2xl text-xs font-semibold transition-all duration-200 border flex items-center justify-center space-x-2 ${
                      sourceType === 'url'
                        ? 'bg-rose text-white border-rose shadow-rose font-bold'
                        : 'bg-white text-deep-muted border-cream-border hover:bg-cream-card hover:text-deep'
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    <span>Указать ссылку (URL)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('upload')}
                    className={`py-3 px-4 rounded-2xl text-xs font-semibold transition-all duration-200 border flex items-center justify-center space-x-2 ${
                      sourceType === 'upload'
                        ? 'bg-rose text-white border-rose shadow-rose font-bold'
                        : 'bg-white text-deep-muted border-cream-border hover:bg-cream-card hover:text-deep'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Загрузить файл с ПК</span>
                  </button>
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-semibold text-deep mb-1.5 uppercase tracking-wider">
                  Название материала
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Урок 1. Заголовок курса..."
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-cream-border text-deep text-sm placeholder-deep-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
                />
              </div>

              {/* URL Mode */}
              {sourceType === 'url' && (
                <div>
                  <label className="block text-xs font-semibold text-deep mb-1.5 uppercase tracking-wider">
                    Ссылка на файл или видео (YouTube / Vimeo / MP4 / PDF)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... или https://..."
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-cream-border text-deep text-sm placeholder-deep-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
                  />
                </div>
              )}

              {/* Upload Mode */}
              {sourceType === 'upload' && (
                <div>
                  <label className="block text-xs font-semibold text-deep mb-1.5 uppercase tracking-wider">
                    Загрузка файла с вашего компьютера
                  </label>
                  <div className="relative border-2 border-dashed border-rose/30 hover:border-rose rounded-2xl p-6 text-center bg-cream-card/60 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept="video/*,image/*,application/pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-rose-light text-rose mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-deep">
                        {fileUploading ? '⏳ Идет загрузка файла на сервер...' : 'Нажмите или перетащите файл сюда'}
                      </p>
                      <p className="text-[11px] text-deep-muted">
                        Видео (MP4, MOV), фотографии или документы
                      </p>
                    </div>
                  </div>
                  {uploadedFileName && (
                    <p className="text-xs text-emerald-700 font-semibold mt-2.5 flex items-center space-x-1.5 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">Выбран файл: <strong>{uploadedFileName}</strong></span>
                    </p>
                  )}
                </div>
              )}

              {/* Description Field */}
              <div>
                <label className="block text-xs font-semibold text-deep mb-1.5 uppercase tracking-wider">
                  Описание и инструкции
                </label>
                <textarea
                  rows="3"
                  placeholder="Подробное описание к материалу и задания..."
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-cream-border text-deep text-sm placeholder-deep-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={lessonSubmitLoading || fileUploading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose to-rose-hover text-white font-semibold text-sm shadow-rose hover:shadow-lg transition-all duration-200 disabled:opacity-50 mt-2"
              >
                {lessonSubmitLoading ? 'Сохранение...' : editingLesson ? 'Сохранить изменения' : 'Опубликовать и оповестить учеников'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

