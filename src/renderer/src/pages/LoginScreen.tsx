import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/useAuthStore';
import { WindowControls } from '../components';
import logoImage from '../assets/photo_2026-04-23_10-34-22.jpg';

// Social provider icons
const SocialIcons = {
  google: (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  vk: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0077FF">
      <path d="M15.073 2H8.937C5.009 2 2 5.009 2 8.937v6.125C2 18.991 5.009 22 8.937 22h6.125C18.991 22 22 18.991 22 15.062V8.937C22 5.009 18.991 2 15.073 2zM17.8 13.28c.66.66.77.95 1.57.95h1.12c.84 0 1.26-.42 1.02-1.25-.25-.83-1.15-2.05-2.34-3.11-.45-.4-.63-.58-.63-.82 0-.23.17-.58.86-.58h2.33c.7 0 .94-.35.76-1.05-.21-.83-.98-2.05-2.01-3.08-.57-.55-1.06-.82-1.82-.82h-2.55c-.73 0-1.07.38-1.07.81 0 .85 1.2 2.02 2.65 3.47 1.09 1.09 1.28 1.62 1.28 1.77 0 .25-.44.35-1.31.35h-2.15c-.73 0-1.07-.38-1.07-.81 0-.85-1.2-2.02-2.65-3.47-.57-.57-.81-1.05-.81-1.3 0-.24.17-.43.45-.43h2.55c.73 0 1.07-.38 1.07-.81 0-.85-1.2-2.02-2.65-3.47-.57-.57-.81-1.05-.81-1.3 0-.24.17-.43.45-.43h2.55c.73 0 1.07-.38 1.07-.81 0-.85-1.2-2.02-2.65-3.47-.57-.57-.81-1.05-.81-1.3 0-.24.17-.43.45-.43h.01c.73 0 1.07.38 1.07.81 0 .85 1.2 2.02 2.65 3.47 1.09 1.09 1.28 1.62 1.28 1.77 0 .25-.44.35-1.31.35h-2.15c-.73 0-1.07-.38-1.07-.81 0-.85-1.2-2.02-2.65-3.47-.57-.57-.81-1.05-.81-1.3 0-.24.17-.43.45-.43h2.55c.73 0 1.07-.38 1.07-.81 0-.85-1.2-2.02-2.65-3.47-.57-.57-.81-1.05-.81-1.3 0-.24.17-.43.45-.43z"/>
    </svg>
  ),
  telegram: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#229ED9">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  yandex: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#FC3F1D">
      <path d="M6.09 19.58H.78L10.97 2.94h5.28L6.09 19.58zm12.84-6.36v8.43h-5.28V13.22L8.28 2.94h5.53l5.12 10.28z"/>
    </svg>
  ),
};

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
    loginWithGoogle,
    loginWithVK,
    loginWithTelegram,
    loginWithYandex,
    clearError,
    setShowPassword,
  } = useAuthStore();

  // Local state
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
      // Redirect via useEffect
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'vk' | 'telegram' | 'yandex') => {
    clearError();
    const handlers = {
      google: loginWithGoogle,
      vk: loginWithVK,
      telegram: loginWithTelegram,
      yandex: loginWithYandex,
    };
    const result = await handlers[provider]();
    if (result.success) {
      // Redirect via useEffect
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1c20] via-[#2b2d31] to-[#1a1c20]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-30" />

      {/* Window Controls */}
      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center px-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src={logoImage}
            alt="Minecraft Gerbarium"
            className="h-40 w-auto object-contain drop-shadow-2xl"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Login Form */}
        <div className="w-full rounded-2xl mc-panel p-8 backdrop-blur-md">
          {/* Error Message */}
          {error && (
            <div className="mc-error mb-6" role="alert">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Username Input */}
            <input
              type="text"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Логин"
              className="mc-input"
              disabled={isLoading}
              autoComplete="username"
            />

            {/* Password Input */}
            {!offlineMode && (
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={localPassword}
                  onChange={(e) => setLocalPassword(e.target.value)}
                  placeholder="Пароль"
                  className="mc-input pr-12"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {/* Password Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="mc-btn mc-btn-primary mc-btn-lg mt-2 w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="mc-spinner" viewBox="0 0 24 24">
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
              <label className="mc-checkbox-label">
                <input
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="mc-checkbox"
                  disabled={isLoading}
                />
                <div className="mc-checkbox-box">
                  <svg className="h-4 w-4 text-white opacity-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-minecraft text-xs text-gray-400">Оффлайн режим</span>
              </label>
            </div>

            {/* Divider with text */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#202225] px-4 font-minecraft text-xs text-gray-500">ИЛИ</span>
              </div>
            </div>

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="mc-social-btn"
                disabled={isLoading}
                title="Войти через Google"
              >
                {SocialIcons.google}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('vk')}
                className="mc-social-btn"
                disabled={isLoading}
                title="Войти через VK"
              >
                {SocialIcons.vk}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('telegram')}
                className="mc-social-btn"
                disabled={isLoading}
                title="Войти через Telegram"
              >
                {SocialIcons.telegram}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('yandex')}
                className="mc-social-btn"
                disabled={isLoading}
                title="Войти через Yandex"
              >
                {SocialIcons.yandex}
              </button>
            </div>

            {/* Help Links */}
            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <a
                href="#"
                className="font-minecraft text-[13px] text-gray-400 transition-colors hover:text-cyan-400 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Забыли пароль?
              </a>
              <a
                href="#"
                className="font-minecraft text-[13px] text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Создать аккаунт
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center font-minecraft text-xs text-gray-600">
          Gerbarium Launcher v2.0
        </div>
      </div>
    </div>
  );
}
