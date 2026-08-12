import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, LogOut, CheckCircle, Shield, Sparkles } from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);

    try {
      const res = await api.put('/auth/profile', { full_name: fullName, email });
      updateUser(res.data);
      setProfileMsg({ type: 'success', text: 'Данные профиля успешно обновлены!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Ошибка при обновлении профиля' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    setPwdLoading(true);

    try {
      await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPwdMsg({ type: 'success', text: 'Пароль успешно изменен!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.detail || 'Ошибка при смене пароля' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-12 animate-fade-in space-y-8">
      
      {/* Profile Header */}
      <div className="bg-cream-card border border-cream-border rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose to-rose-hover text-white font-serif font-bold text-2xl flex items-center justify-center shadow-rose flex-shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-deep">
              {user?.full_name}
            </h1>
            <p className="text-xs text-deep-muted mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-rose-light text-rose-dark text-xs font-semibold">
              {user?.role === 'admin' ? 'Администратор платформы' : 'Студент курсов'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-5 py-3 rounded-2xl bg-white hover:bg-rose-light border border-cream-border text-deep text-xs font-semibold transition-all flex items-center space-x-2 shadow-sm"
        >
          <LogOut className="w-4 h-4 text-rose" />
          <span>Выйти из аккаунта</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Details Form */}
        <div className="bg-white border border-cream-border rounded-3xl p-6 shadow-soft space-y-6">
          <div className="flex items-center space-x-3 border-b border-cream-border pb-4">
            <User className="w-5 h-5 text-rose" />
            <h2 className="font-serif text-lg font-bold text-deep">
              Личные данные
            </h2>
          </div>

          {profileMsg.text && (
            <div className={`p-4 rounded-2xl text-xs font-medium ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-deep mb-1 uppercase tracking-wider">
                Имя и Фамилия
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-cream border border-cream-border text-deep text-sm focus:outline-none focus:border-rose transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep mb-1 uppercase tracking-wider">
                Электронная почта
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-cream border border-cream-border text-deep text-sm focus:outline-none focus:border-rose transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-3.5 rounded-2xl bg-rose text-white font-semibold text-sm hover:bg-rose-hover transition-colors shadow-rose disabled:opacity-50"
            >
              {profileLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-cream-border rounded-3xl p-6 shadow-soft space-y-6">
          <div className="flex items-center space-x-3 border-b border-cream-border pb-4">
            <Lock className="w-5 h-5 text-rose" />
            <h2 className="font-serif text-lg font-bold text-deep">
              Безопасность и Пароль
            </h2>
          </div>

          {pwdMsg.text && (
            <div className={`p-4 rounded-2xl text-xs font-medium ${
              pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-deep mb-1 uppercase tracking-wider">
                Текущий пароль
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-cream border border-cream-border text-deep text-sm focus:outline-none focus:border-rose transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep mb-1 uppercase tracking-wider">
                Новый пароль
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-cream border border-cream-border text-deep text-sm focus:outline-none focus:border-rose transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full py-3.5 rounded-2xl bg-deep text-white font-semibold text-sm hover:bg-deep-muted transition-colors shadow-sm disabled:opacity-50"
            >
              {pwdLoading ? 'Изменение...' : 'Обновить пароль'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
