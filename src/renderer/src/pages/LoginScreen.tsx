import { useState } from 'react';
import { useAuth } from '../hooks';
import { Button, Input, Checkbox, WindowControls } from '../components';
import { useNavigate } from '@tanstack/react-router';
import logoImage from '../assets/photo_2026-04-23_10-34-22.jpg';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginWithMicrosoft, isLoading, error, clearError } = useAuth();

  const [credentials, setCredentials] = useState({
    login: '',
    password: '',
    savePassword: false,
    autoLogin: true,
  });

  const [showInputs, setShowInputs] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLoginClick = () => {
    setShowInputs(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!credentials.login || !credentials.password) {
      setLocalError('Введите логин и пароль');
      return;
    }

    const result = await login({
      login: credentials.login,
      password: credentials.password,
      savePassword: credentials.savePassword,
      autoLogin: credentials.autoLogin,
    });

    if (result.success) {
      navigate({ to: '/dashboard' });
    } else {
      setLocalError(result.error || 'Ошибка входа');
    }
  };

  const handleMicrosoftLogin = async () => {
    clearError();
    setLocalError(null);

    const result = await loginWithMicrosoft();

    if (result.success) {
      navigate({ to: '/dashboard' });
    } else {
      setLocalError(result.error || 'Ошибка входа через Microsoft');
    }
  };

  const errorMessage = localError || error;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#2b2d31]">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Window Controls */}
      <div className="absolute top-4 right-4 z-50">
        <WindowControls />
      </div>

      {/* Help Links (top right, below window controls) */}
      <div className="absolute top-16 right-6 z-40 text-right">
        <div className="flex flex-col gap-1 text-xs font-minecraft">
          <span className="text-[#aaaaaa] hover:text-[#ffffff] cursor-pointer transition-colors">
            Забыли пароль?
          </span>
          <a 
            href="#" 
            className="text-[#55aaff] hover:text-[#77ccff] cursor-pointer transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            У вас нет учетной записи? Создать учетную запись
          </a>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 -mt-20">
        {/* Logo */}
        <div className="mb-12">
          <img
            src={logoImage}
            alt="Minecraft Gerbarium"
            className="h-40 w-auto object-contain drop-shadow-2xl"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {!showInputs ? (
          // Initial Login Button
          <div className="flex flex-col items-center gap-6">
            <Button
              variant="minecraft"
              size="lg"
              className="min-w-[280px] text-lg"
              onClick={handleLoginClick}
            >
              Вход
            </Button>
            
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={handleMicrosoftLogin}
                isLoading={isLoading}
              >
                Войти через Microsoft
              </Button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="w-full max-w-sm">
            {errorMessage && (
              <div className="mb-4 p-3 bg-[#8b2a2a]/80 border border-[#aa3a3a] text-[#ffaaaa] text-sm font-minecraft text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label=""
                type="text"
                value={credentials.login}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, login: e.target.value }))
                }
                placeholder="E-mail или Логин"
                autoComplete="username"
                className="min-w-[280px]"
              />

              <Input
                label=""
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Пароль"
                autoComplete="current-password"
              />

              {/* Action Button */}
              <Button
                type="submit"
                variant="minecraft"
                size="lg"
                className="w-full mt-6 text-lg"
                isLoading={isLoading}
              >
                Вход
              </Button>

              {/* Checkboxes */}
              <div className="flex flex-col gap-2 pt-2">
                <Checkbox
                  label="Сохранить пароль"
                  checked={credentials.savePassword}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      savePassword: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Автоход"
                  checked={credentials.autoLogin}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      autoLogin: e.target.checked,
                    }))
                  }
                />
              </div>
            </form>

            {/* Microsoft Login Alternative */}
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                size="md"
                onClick={handleMicrosoftLogin}
                isLoading={isLoading}
              >
                Войти через Microsoft
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#555555] text-xs font-minecraft">
        Gerbarium Launcher v2.0
      </div>
    </div>
  );
}
