import { WindowControls } from "../components";
import { useLoginScreen } from "../hooks/useLoginScreen";
import logoImage from "../assets/photo_2026-04-23_10-34-22.jpg";
import { LoginFormCard } from "../components/login";

export function LoginScreen() {
  const vm = useLoginScreen();

  if (vm.showSessionSpinner) {
    return (
      <div className="bg-theme-main-gradient relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-30" />
        <div className="absolute right-4 top-4 z-50">
          <WindowControls />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[var(--mc-accent)]" />
          <div className="font-minecraft text-sm text-theme-muted">
            {vm.t.COMMON.LOADING}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-main-gradient relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-30" />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center py-4 px-4">
        <div className="mb-4 text-center">
          <img
            src={logoImage}
            alt={vm.t.LOGIN.LOGO_ALT}
            className="h-32 w-auto object-contain drop-shadow-2xl"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        <LoginFormCard
          t={vm.t}
          isLoading={vm.isLoading}
          error={vm.localizedError}
          mode={vm.mode}
          username={vm.localUsername}
          email={vm.localEmail}
          password={vm.localPassword}
          confirmPassword={vm.localPasswordConfirm}
          showPassword={vm.showPassword}
          showConfirmPassword={vm.showConfirmPassword}
          offlineMode={vm.offlineMode}
          onUsernameChange={vm.onUsernameChange}
          onEmailChange={vm.onEmailChange}
          onPasswordChange={vm.onPasswordChange}
          onConfirmPasswordChange={vm.onConfirmPasswordChange}
          onTogglePassword={vm.onTogglePassword}
          onToggleConfirmPassword={vm.onToggleConfirmPassword}
          onToggleOfflineMode={vm.onToggleOfflineMode}
          onSwitchMode={vm.onSwitchMode}
          onSubmit={vm.onSubmit}
        />

        <div className="mt-4 text-center font-minecraft text-xs text-theme-muted">
          {vm.t.LOGIN.FOOTER_TEXT}
        </div>
      </div>
    </div>
  );
}
