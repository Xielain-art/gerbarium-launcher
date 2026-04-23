import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/useAuthStore';
import { WindowControls } from '../components';
import logoImage from '../assets/photo_2026-04-23_10-34-22.jpg';

export function LoginScreen() {
  const navigate = useNavigate();
  
  // Zustand store
  const { 
    isLoading, 
    error, 
    showPassword,
    isAuthenticated,
    login, 
    loginOffline,
    clearError,
    setShowPassword
  } = useAuthStore();

  // Local state for form inputs
  const [localUsername, setLocalUsername] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = offlineMode 
      ? await loginOffline(localUsername)
      : await login({ login: localUsername, password: localPassword });

    if (result.success) {
      // Redirect will happen via useEffect when isAuthenticated changes
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1c20] via-[#2b2d31] to-[#1a1c20]">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Window Controls */}
      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center justify-center px-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src={logoImage}
            alt="Minecraft Gerbarium"
            className="h-44 w-auto object-contain drop-shadow-2xl"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Login Form */}
        <div className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#141619]/85 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/15 p-3.5 text-red-300 font-minecraft text-sm animate-shake">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="Логин"
                className="w-full rounded-lg border border-white/8 bg-[#1e2023]/80 px-4 py-3.5 text-[#e5e5e5] font-minecraft text-[15px] placeholder-white/40 transition-all duration-200 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,255,255,0.1),0_0_8px_rgba(0,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full rounded-lg border border-white/8 bg-[#1e2023]/80 px-4 py-3.5 pr-12 text-[#e5e5e5] font-minecraft text-[15px] placeholder-white/40 transition-all duration-200 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,255,255,0.1),0_0_8px_rgba(0,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                autoComplete="current-password"
              />
              {/* Password Visibility Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors duration-200 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.591a9.98 9.98 0 012.053-1.14m3.097-2.187a9.954 9.954 0 013.543 2.187M6.375 6.375C4.5 8.25 3 10.5 3 12c0 1.5 1.5 3.75 3.375 5.625m3.75 3.75a10.05 10.05 0 001.875-.175M18 12a6 6 0 11-12 0 6 6 0 0112 0z" />
                    <path strokeLinecap="square" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="square" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-gradient-to-br from-[#3a753a] to-[#2d5a2d] px-6 py-4 font-minecraft text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-200 hover:from-[#4a8a4a] hover:to-[#3d6a3d] hover:border-cyan-400/30 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,255,255,0.15)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="h-[18px] w-[18px] animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Авторизация...
                </>
              ) : (
                'Вход'
              )}
            </button>

            {/* Offline Mode Toggle */}
            <div className="flex items-center justify-center pt-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="peer sr-only"
                  disabled={isLoading}
                />
                <div className="h-5 w-5 rounded border-2 border-gray-600 bg-[#1e2023] transition-colors duration-200 peer-checked:border-green-500 peer-checked:bg-green-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  <svg className="mx-auto h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-minecraft text-xs text-gray-400 transition-colors duration-200 peer-checked:text-green-400">Оффлайн режим</span>
              </label>
            </div>

            {/* Help Links */}
            <div className="mt-4 flex flex-col items-center gap-2 text-center">
              <a 
                href="#" 
                className="font-minecraft text-[13px] text-gray-400 transition-colors duration-200 hover:text-cyan-400 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Забыли пароль?
              </a>
              <a 
                href="#" 
                className="font-minecraft text-[13px] text-cyan-400 transition-colors duration-200 hover:text-cyan-300 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Создать аккаунт
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center font-minecraft text-xs text-gray-600">
          Gerbarium Launcher v2.0
        </div>
      </div>
    </div>
  );
}
