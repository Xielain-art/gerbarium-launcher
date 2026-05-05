import { WindowControls } from "../components";
import { useLoginScreen } from "../hooks/useLoginScreen";
import { LoginFormCard } from "../components/login";

export function LoginScreen(): React.JSX.Element {
  const vm = useLoginScreen();

  if (vm.showSessionSpinner) {
    return (
      <div className="bg-[#0f0f0f] relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.1]" />
        <div className="absolute right-4 top-4 z-50">
          <WindowControls />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3ecf8e]/20 border-t-[#3ecf8e]" />
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#898989]">
            {vm.t.COMMON.LOADING}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] relative flex h-screen w-full items-center justify-center overflow-hidden px-4 py-4">
      <div className="absolute inset-0 bg-pattern opacity-[0.15]" />
      <div className="auth-grid-overlay opacity-[0.03]" />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-4">
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


        <div className="text-center font-sans text-[11px] uppercase tracking-[0.16em] text-theme-muted/90">
          {vm.t.LOGIN.FOOTER_TEXT}
        </div>
      </div>
    </div>
  );
}

