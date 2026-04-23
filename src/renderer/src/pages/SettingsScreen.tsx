import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useJava } from '../hooks/useJava';
import { WindowControls } from '../components';

type SettingsTab = 'general' | 'java' | 'profile';

export function SettingsScreen() {
  const navigate = useNavigate();
  
  // Zustand stores
  const { general, mods, profile, updateGeneral, updateMods, updateProfile, saveSettings, resetToDefaults, isLoading, error, clearError } = useSettingsStore();
  const { logout, isAuthenticated } = useAuthStore();
  const { checkJava, findJava, downloadJRE, loading: javaLoading, error: javaError } = useJava();
  const [javaVersion, setJavaVersion] = useState<string | null>(null);

  useEffect(() => {
    if (general.javaPath) {
      checkJava(general.javaPath).then(setJavaVersion);
    }
  }, [general.javaPath, checkJava]);

  const handleDownloadJava = async () => {
    // Временный URL для примера, нужно заменить на актуальный
    const url = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jre_x64_windows_hotspot_17.0.10_7.zip';
    const targetDir = 'C:/Program Files/Gerbarium/java'; // Нужно определить правильную папку
    const success = await downloadJRE(url, targetDir);
    if (success) {
      alert('Java успешно скачана!');
      const path = `${targetDir}/bin/java.exe`;
      updateGeneral({ javaPath: path });
    }
  };

  // Local state
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [shouldLogout, setShouldLogout] = useState(false);

  // Handle logout redirect
  useEffect(() => {
    if (!isAuthenticated && shouldLogout) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, shouldLogout, navigate]);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'ОБЩИЕ' },
    { id: 'java', label: 'JAVA' },
    { id: 'profile', label: 'ПРОФИЛЬ' },
  ];

  const handleSave = async () => {
    const result = await saveSettings();
    if (!result.success) {
      // Error already set in store
    }
  };

  const handleReset = () => {
    setShowConfirmReset(true);
  };

  const handleResetConfirm = () => {
    resetToDefaults();
    setShowConfirmReset(false);
  };

  const handleBack = () => {
    navigate({ to: '/dashboard' });
  };

  const handleLogout = () => {
    setShouldLogout(true);
    logout();
    // Force clear localStorage
    localStorage.removeItem('gerbarium-auth-storage');
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#1a1a1a]">
      {/* Top Bar */}
      <header className="title-bar-drag flex h-16 shrink-0 items-center justify-between border-b-[3px] border-[#1a1a1a] bg-[#2b2d31] px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] px-4 py-2 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c] active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]"
          >
            ← Назад
          </button>
          <h1 className="font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
            Настройки
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="font-minecraft text-xs text-[#8a8a8a] transition-colors hover:text-[#ff5555]"
          >
            Выйти
          </button>
          <div>
            <WindowControls />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Tabs */}
        <div className="flex w-48 flex-col shrink-0 border-r-[3px] border-[#1a1a1a] bg-[#252525]">
          <div className="space-y-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full border-[3px] px-4 py-3 text-left font-minecraft text-sm font-bold uppercase transition-colors ${
                  activeTab === tab.id
                    ? 'border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] text-[#e0e0e0]'
                    : 'border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] text-[#8a8a8a] hover:bg-[#3c3c3c] hover:text-[#e0e0e0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] p-6">
          <div className="mx-auto max-w-2xl rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] p-6 shadow-[inset_2px_2px_0px_#5a5a5a,inset_-2px_-2px_0px_#1a1a1a]">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/15 p-3 font-minecraft text-sm text-red-300">
                {error}
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  Общие настройки
                </h2>

                {/* Language */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    Язык
                  </label>
                  <select
                    value={general.language}
                    onChange={(e) => updateGeneral({ language: e.target.value })}
                    className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={general.closeOnLaunch}
                      onChange={(e) => updateGeneral({ closeOnLaunch: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] transition-colors peer-checked:bg-[#3a753a] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                      <svg className="mx-auto h-4 w-4 text-[#e0e0e0] opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-minecraft text-sm text-[#e0e0e0]">Закрывать лаунчер при запуске игры</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={general.minimizeToTray}
                      onChange={(e) => updateGeneral({ minimizeToTray: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] transition-colors peer-checked:bg-[#3a753a] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                      <svg className="mx-auto h-4 w-4 text-[#e0e0e0] opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-minecraft text-sm text-[#e0e0e0]">Сворачивать в трей</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={general.discordRPC}
                      onChange={(e) => updateGeneral({ discordRPC: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] transition-colors peer-checked:bg-[#3a753a] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                      <svg className="mx-auto h-4 w-4 text-[#e0e0e0] opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-minecraft text-sm text-[#e0e0e0]">Показывать статус в Discord (RPC)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Java Tab */}
            {activeTab === 'java' && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  Настройки Java
                </h2>

                {/* Java Path */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    Путь к Java
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={general.javaPath}
                      onChange={(e) => updateGeneral({ javaPath: e.target.value })}
                      placeholder="C:/Program Files/Java/jdk/bin/java.exe"
                      className="flex-1 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                    <button
                      onClick={async () => {
                        const path = await findJava();
                        if (path) updateGeneral({ javaPath: path });
                      }}
                      className="rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c]"
                    >
                      Найти
                    </button>
                  </div>
                  {(javaLoading || javaError || javaVersion) && (
                    <p className={`font-minecraft text-xs ${javaError ? 'text-red-400' : 'text-[#6a6a6a]'}`}>
                      {javaLoading ? 'Поиск...' : javaError ? javaError : `Найдена версия: ${javaVersion}`}
                    </p>
                  )}
                  {!javaVersion && !javaLoading && (
                    <button
                      onClick={handleDownloadJava}
                      className="mt-2 rounded border-[3px] border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] px-4 py-2 font-minecraft text-sm text-white transition-colors hover:bg-[#4a8a4a]"
                    >
                      Скачать Java 17
                    </button>
                  )}
                </div>

                {/* RAM Allocation */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    Выделение ОЗУ: {general.ramAllocation} ГБ
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="16"
                      step="1"
                      value={general.ramAllocation}
                      onChange={(e) => updateGeneral({ ramAllocation: parseInt(e.target.value) })}
                      className="h-3 flex-1 appearance-none cursor-pointer rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-t-[#4a9a4a] [&::-webkit-slider-thumb]:border-l-[#4a9a4a] [&::-webkit-slider-thumb]:border-b-[#2a5a2a] [&::-webkit-slider-thumb]:border-r-[#2a5a2a] [&::-webkit-slider-thumb]:bg-[#3a753a] [&::-webkit-slider-thumb]:shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <span className="w-16 text-right font-minecraft text-sm text-[#e0e0e0]">
                      {general.ramAllocation} ГБ
                    </span>
                  </div>
                  <div className="flex justify-between font-minecraft text-xs text-[#6a6a6a]">
                    <span>1 ГБ</span>
                    <span>16 ГБ</span>
                  </div>
                </div>

                {/* JVM Arguments */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    Аргументы JVM
                  </label>
                  <textarea
                    value={general.jvmArgs || ''}
                    onChange={(e) => updateGeneral({ jvmArgs: e.target.value })}
                    placeholder="-XX:+UseG1GC -XX:MaxGCPauseMillis=50"
                    rows={4}
                    className="w-full resize-none rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                  />
                  <p className="font-minecraft text-xs text-[#6a6a6a]">
                    Дополнительные параметры для запуска Java
                  </p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  Настройки профиля
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => updateProfile({ username: e.target.value })}
                      placeholder="Player"
                      className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      URL скина
                    </label>
                    <input
                      type="text"
                      value={profile.skinUrl || ''}
                      onChange={(e) => updateProfile({ skinUrl: e.target.value })}
                      placeholder="https://example.com/skin.png"
                      className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      URL плаща
                    </label>
                    <input
                      type="text"
                      value={profile.capeUrl || ''}
                      onChange={(e) => updateProfile({ capeUrl: e.target.value })}
                      placeholder="https://example.com/cape.png"
                      className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                  </div>
                </div>

                {/* Skin Preview */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    Предпросмотр скина
                  </label>
                  <div className="flex items-center justify-center rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] p-4 shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                    <div className="flex h-32 w-32 items-center justify-center bg-[#1a1a1a]">
                      <span className="font-minecraft text-sm text-[#6a6a6a]">
                        {profile.skinUrl ? 'Загрузка...' : 'Скин не выбран'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mx-auto mt-6 flex max-w-2xl gap-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 rounded border-[3px] border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-gradient-to-br from-[#3a753a] to-[#2d5a2d] px-6 py-4 font-minecraft text-lg font-bold text-white shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a] transition-all duration-75 hover:from-[#4a8a4a] hover:to-[#3d6a3d] active:border-t-[#2a5a2a] active:border-l-[#2a5a2a] active:border-b-[#4a9a4a] active:border-r-[#4a9a4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 rounded border-[3px] border-t-[#7a5a5a] border-l-[#7a5a5a] border-b-[#3a1a1a] border-r-[#3a1a1a] bg-gradient-to-br from-[#8b2a2a] to-[#5a1a1a] px-6 py-4 font-minecraft text-lg font-bold text-white shadow-[inset_2px_2px_0px_#aa3a3a,inset_-2px_-2px_0px_#5a1a1a] transition-all duration-75 hover:from-[#9a3a3a] hover:to-[#6a2a2a] active:border-t-[#3a1a1a] active:border-l-[#3a1a1a] active:border-b-[#7a5a5a] active:border-r-[#7a5a5a]"
            >
              Сбросить
            </button>
          </div>
        </div>
      </main>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-4 max-w-md rounded border-[4px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] shadow-2xl">
            <div className="border-b-[3px] border-[#1a1a1a] p-4">
              <h2 className="font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
                Сброс настроек
              </h2>
            </div>
            <div className="p-6">
              <p className="font-minecraft text-sm text-[#e0e0e0]">
                Вы уверены, что хотите сбросить все настройки до значений по умолчанию? Это действие нельзя отменить.
              </p>
            </div>
            <div className="flex gap-3 border-t-[3px] border-[#1a1a1a] p-4">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 rounded border-[3px] border-t-[#7a7a7a] border-l-[#7a7a7a] border-b-[#3a3a3a] border-r-[#3a3a3a] bg-[#5a5a5a] px-4 py-3 font-minecraft text-sm font-bold text-[#e0e0e0] transition-colors hover:bg-[#6a6a6a]"
              >
                Отмена
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 rounded border-[3px] border-t-[#aa3a3a] border-l-[#aa3a3a] border-b-[#5a1a1a] border-r-[#5a1a1a] bg-[#8b2a2a] px-4 py-3 font-minecraft text-sm font-bold text-white transition-colors hover:bg-[#9a3a3a]"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
