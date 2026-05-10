import { WindowControls } from "../components/layout/WindowControls";
import { SessionLoadingScreen } from "../components/layout/SessionLoadingScreen";
import { useLoginScreen } from "../hooks/useLoginScreen";
import { LoginFormCard } from "../components/login/LoginFormCard";

export function LoginScreen(): React.JSX.Element {
  const vm = useLoginScreen();

  if (vm.showSessionSpinner) {
    return <SessionLoadingScreen message={vm.t.COMMON.LOADING} />;
  }

  return (
    <div className="fantasy-ui fantasy-shell bg-[var(--theme-bg)] relative flex h-screen w-full items-center justify-center overflow-hidden px-4 py-4">
      <div className="fantasy-orb fantasy-orb--violet left-[-9rem] top-[-5rem] h-[24rem] w-[24rem]" />
      <div className="fantasy-orb fantasy-orb--emerald right-[-7rem] bottom-[-4rem] h-[22rem] w-[22rem]" />
      <div className="fantasy-orb fantasy-orb--gold left-[36%] top-[10%] h-56 w-56" />
      <div className="absolute inset-0 bg-pattern opacity-[0.12]" />
      <div className="auth-grid-overlay opacity-[0.04]" />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center gap-4">
        <LoginFormCard
          t={vm.t}
          language={vm.language}
          isLoading={vm.isLoading}
          error={vm.localizedError}
          mode={vm.mode}
          registerStep={vm.registerStep}
          username={vm.localUsername}
          email={vm.localEmail}
          password={vm.localPassword}
          confirmPassword={vm.localPasswordConfirm}
          verificationCode={vm.verificationCode}
          verificationRequired={vm.verificationRequired}
          verificationEmail={vm.verificationEmail}
          resendCountdown={vm.resendCountdown}
          developmentCode={vm.developmentCode}
          emailWasSent={vm.emailWasSent}
          onUsernameChange={vm.onUsernameChange}
          onEmailChange={vm.onEmailChange}
          onPasswordChange={vm.onPasswordChange}
          onConfirmPasswordChange={vm.onConfirmPasswordChange}
          onVerificationCodeChange={vm.onVerificationCodeChange}
          onSwitchMode={vm.onSwitchMode}
          languageOptions={vm.t.SETTINGS.GENERAL.LANGUAGE_OPTIONS}
          onLanguageChange={vm.onLanguageChange}
          onUseAnotherAccount={vm.onUseAnotherAccount}
          onResendCode={vm.onResendCode}
          onRegisterStepBack={vm.onRegisterStepBack}
          onSubmit={vm.onSubmit}
          onBlur={vm.onBlur}
          validations={vm.validations}
        />

        <div className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-theme-muted/90">
          {vm.t.LOGIN.FOOTER_TEXT}
        </div>
      </div>
    </div>
  );
}


