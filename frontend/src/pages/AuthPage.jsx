import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, HeartHandshake } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Пожалуйста, введите ваше полное имя');
          setLoading(false);
          return;
        }
        await register(email, password, fullName);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка при входе. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (type) => {
    if (type === 'admin') {
      setEmail('admin@alinlab.ru');
      setPassword('adminpassword');
    } else {
      setEmail('student@alinlab.ru');
      setPassword('studentpassword');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-cream via-cream-card to-rose-light/20 relative overflow-hidden">
      
      {/* Aesthetic background decorative elements */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-rose-light/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-rose/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-cream/90 backdrop-blur-xl border border-cream-border rounded-3xl p-8 shadow-soft relative z-10">
        
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-rose to-rose-hover text-white shadow-rose mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-deep tracking-wide">
            AlinLab
          </h1>
          <p className="text-sm text-deep-muted mt-1 font-medium">
            {isLogin ? 'Добро пожаловать в пространство обучения' : 'Присоединяйтесь к нашей платформе'}
          </p>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-fade-in">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-deep mb-1.5 uppercase tracking-wider">
                Ваше Имя и Фамилия
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-rose absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Елена Смирнова"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-cream-border text-deep text-sm placeholder-deep-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-deep mb-1.5 uppercase tracking-wider">
              Электронная почта
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-rose absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-cream-border text-deep text-sm placeholder-deep-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-deep mb-1.5 uppercase tracking-wider">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-rose absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-cream-border text-deep text-sm placeholder-deep-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose to-rose-hover text-white font-semibold text-sm shadow-rose hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Загрузка...' : isLogin ? 'Войти в личный кабинет' : 'Зарегистрироваться'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-deep-muted hover:text-rose transition-colors font-medium"
          >
            {isLogin ? (
              <span>Еще нет аккаунта? <strong className="text-rose font-semibold">Зарегистрироваться</strong></span>
            ) : (
              <span>Уже есть аккаунт? <strong className="text-rose font-semibold">Войти</strong></span>
            )}
          </button>
        </div>

        {/* Demo Accounts Quick Login */}
        <div className="mt-8 pt-6 border-t border-cream-border/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-deep-muted text-center mb-3">
            Демо-доступ для тестирования:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setIsLogin(true); setDemoUser('student'); }}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-light border border-cream-border text-deep text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose" />
              <span>Студент</span>
            </button>
            <button
              onClick={() => { setIsLogin(true); setDemoUser('admin'); }}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-light border border-cream-border text-deep text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose" />
              <span>Админ</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
