import { useState } from 'react';
import { useSettings } from '../hooks';
import { Button, Input, Checkbox, WindowControls, Card, Modal, ConfirmModal } from '../components';
import { useNavigate } from '@tanstack/react-router';

type SettingsTab = 'general' | 'mods' | 'profile' | 'java';

export function SettingsScreen() {
  const navigate = useNavigate();
  const {
    settings,
    updateGeneral,
    updateMods,
    updateProfile,
    saveSettings,
    resetToDefaults,
    isLoading,
    error,
    clearError,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'ОБЩИЕ' },
    { id: 'java', label: 'JAVA' },
    { id: 'mods', label: 'МОДЫ' },
    { id: 'profile', label: 'ПРОФИЛЬ' },
  ];

  const handleSave = async () => {
    clearError();
    setLocalError(null);

    const result = await saveSettings();

    if (!result.success) {
      setLocalError(result.error || 'Не удалось сохранить настройки');
    }
  };

  const handleReset = () => {
    setShowConfirmReset(true);
  };

  const handleResetConfirm = () => {
    resetToDefaults();
    setLocalError(null);
    clearError();
  };

  const handleBack = () => {
    navigate({ to: '/dashboard' });
  };

  const handleOpenGameFolder = () => {
    // TODO: Implement IPC call to open game folder
    console.log('Opening game folder...');
  };

  const errorMessage = localError || error;

  return (
    <div className="w-full h-screen bg-[#1a1a1a] overflow-hidden flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-[#2b2d31] border-b-[3px] border-[#1a1a1a] flex items-center justify-between px-4 shrink-0 title-bar-drag">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-[#e0e0e0] hover:text-[#ffffff] font-minecraft text-sm transition-colors
              border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]
              active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]
              px-4 py-2"
          >
            ← Назад
          </button>
          <h1 className="text-lg font-bold text-[#e0e0e0] font-minecraft uppercase">
            Настройки
          </h1>
        </div>

        {/* Window Controls */}
        <div className="ml-2">
          <WindowControls />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Tabs */}
        <div className="w-48 bg-[#252525] border-r-[3px] border-[#1a1a1a] flex flex-col shrink-0">
          <div className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full px-4 py-3 text-left font-minecraft text-sm font-bold uppercase transition-colors
                  border-[3px]
                  ${
                    activeTab === tab.id
                      ? 'bg-[#3a753a] text-[#e0e0e0] border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a]'
                      : 'text-[#8a8a8a] hover:bg-[#3c3c3c] hover:text-[#e0e0e0] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-[#1a1a1a] overflow-y-auto p-6">
          <Card className="max-w-2xl mx-auto p-6">
            {errorMessage && (
              <div className="mb-4 p-3 bg-[#8b2a2a]/80 border border-[#aa3a3a] text-[#ffaaaa] text-sm font-minecraft">
                {errorMessage}
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#e0e0e0] font-minecraft uppercase mb-4">
                  Общие настройки
                </h2>

                {/* Language Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide">
                    Язык
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) =>
                      updateGeneral({ language: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#2b2d31] border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] text-[#e0e0e0] font-minecraft text-base focus:outline-none focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] cursor-pointer
                      shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                {/* Auto Updates */}
                <Checkbox
                  label="Авто-обновления"
                  checked={settings.general.autoUpdates}
                  onChange={(e) =>
                    updateGeneral({ autoUpdates: e.target.checked })
                  }
                />

                {/* Close on Launch */}
                <Checkbox
                  label="Закрывать лаунчер при запуске игры"
                  checked={settings.general.closeOnLaunch}
                  onChange={(e) =>
                    updateGeneral({ closeOnLaunch: e.target.checked })
                  }
                />

                {/* Minimize to Tray */}
                <Checkbox
                  label="Сворачивать в трей"
                  checked={settings.general.minimizeToTray}
                  onChange={(e) =>
                    updateGeneral({ minimizeToTray: e.target.checked })
                  }
                />

                {/* Discord RPC */}
                <Checkbox
                  label="Показывать статус в Discord (RPC)"
                  checked={settings.general.discordRPC}
                  onChange={(e) =>
                    updateGeneral({ discordRPC: e.target.checked })
                  }
                />

                {/* Game Directory */}
                <div className="pt-4">
                  <label className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide block mb-2">
                    Директория игры
                  </label>
                  <div className="flex gap-3">
                    <Input
                      value="/.minecraft"
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleOpenGameFolder}
                    >
                      Открыть папку
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Java Tab */}
            {activeTab === 'java' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#e0e0e0] font-minecraft uppercase mb-4">
                  Настройки Java
                </h2>

                <Input
                  label="Путь к Java"
                  value={settings.general.javaPath}
                  onChange={(e) =>
                    updateGeneral({ javaPath: e.target.value })
                  }
                  placeholder="C:/Program Files/Java/jdk/bin/java.exe"
                />

                {/* RAM Allocation Slider */}
                <div className="space-y-2">
                  <label className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide">
                    Выделение ОЗУ: {settings.general.ramAllocation} ГБ
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="16"
                      step="1"
                      value={settings.general.ramAllocation}
                      onChange={(e) =>
                        updateGeneral({
                          ramAllocation: parseInt(e.target.value),
                        })
                      }
                      className="flex-1 h-3 bg-[#2b2d31] appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:h-7
                        [&::-webkit-slider-thumb]:bg-[#3a753a]
                        [&::-webkit-slider-thumb]:border-[3px]
                        [&::-webkit-slider-thumb]:border-t-[#4a9a4a]
                        [&::-webkit-slider-thumb]:border-l-[#4a9a4a]
                        [&::-webkit-slider-thumb]:border-b-[#2a5a2a]
                        [&::-webkit-slider-thumb]:border-r-[#2a5a2a]
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a]
                      "
                    />
                    <span className="text-[#e0e0e0] font-minecraft text-sm w-16 text-right">
                      {settings.general.ramAllocation} ГБ
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#6a6a6a] font-minecraft">
                    <span>1 ГБ</span>
                    <span>16 ГБ</span>
                  </div>
                </div>

                {/* JVM Arguments */}
                <div className="space-y-1.5">
                  <label className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide">
                    Аргументы JVM
                  </label>
                  <textarea
                    value={settings.general.jvmArgs || ''}
                    onChange={(e) =>
                      updateGeneral({ jvmArgs: e.target.value })
                    }
                    placeholder="-XX:+UseG1GC -XX:MaxGCPauseMillis=50"
                    rows={4}
                    className="w-full px-4 py-3 bg-[#2b2d31] border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] text-[#e0e0e0] font-minecraft text-sm focus:outline-none focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] resize-none
                      shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] placeholder-[#6a6a6a]"
                  />
                  <p className="text-xs text-[#6a6a6a] font-minecraft">
                    Дополнительные параметры для запуска Java. Оставьте пустым для значений по умолчанию.
                  </p>
                </div>
              </div>
            )}

            {/* Mods Tab */}
            {activeTab === 'mods' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#e0e0e0] font-minecraft uppercase mb-4">
                  Настройки модов
                </h2>

                {/* Mod Pack Selection */}
                <div className="space-y-1.5">
                  <label className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide">
                    Модпак
                  </label>
                  <select
                    value={settings.mods.modPack}
                    onChange={(e) =>
                      updateMods({ modPack: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#2b2d31] border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] text-[#e0e0e0] font-minecraft text-base focus:outline-none focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] cursor-pointer
                      shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]"
                  >
                    <option value="gerbarium">Gerbarium (Рекомендуемый)</option>
                    <option value="vanilla">Vanilla</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Enabled Mods List */}
                <div className="space-y-2">
                  <label className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide block">
                    Включенные моды
                  </label>
                  <div className="bg-[#2b2d31] border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] p-4 space-y-2 shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                    <p className="text-[#8a8a8a] text-sm font-minecraft text-center py-4">
                      Список модов будет доступен после выбора модпака
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#e0e0e0] font-minecraft uppercase mb-4">
                  Настройки профиля
                </h2>

                <Input
                  label="Имя пользователя"
                  value={settings.profile.username}
                  onChange={(e) =>
                    updateProfile({ username: e.target.value })
                  }
                  placeholder="Player"
                />

                <Input
                  label="URL скина"
                  value={settings.profile.skinUrl || ''}
                  onChange={(e) =>
                    updateProfile({ skinUrl: e.target.value })
                  }
                  placeholder="https://example.com/skin.png"
                />

                <Input
                  label="URL плаща"
                  value={settings.profile.capeUrl || ''}
                  onChange={(e) =>
                    updateProfile({ capeUrl: e.target.value })
                  }
                  placeholder="https://example.com/cape.png"
                />

                {/* Skin Preview */}
                <div className="space-y-2">
                  <label className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide block">
                    Предпросмотр скина
                  </label>
                  <div className="bg-[#2b2d31] border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] p-4 flex items-center justify-center shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                    <div className="w-32 h-32 bg-[#1a1a1a] flex items-center justify-center">
                      <span className="text-[#6a6a6a] text-sm font-minecraft">
                        {settings.profile.skinUrl
                          ? 'Загрузка...'
                          : 'Скин не выбран'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="max-w-2xl mx-auto mt-6 flex gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              isLoading={isLoading}
              className="flex-1 text-lg"
            >
              Сохранить
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={handleReset}
              className="flex-1 text-lg"
            >
              Сбросить
            </Button>
          </div>
        </div>
      </main>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        onConfirm={handleResetConfirm}
        title="Сброс настроек"
        message="Вы уверены, что хотите сбросить все настройки до значений по умолчанию? Это действие нельзя отменить."
        confirmText="Сбросить"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  );
}
