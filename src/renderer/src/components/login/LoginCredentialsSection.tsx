import { Button, Input, Label } from "../shadcn/ui";
import type { TranslationType } from "../../../../shared/constants/translations";

interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

interface Props {
  t: TranslationType;
  isLoading: boolean;
  isRegisterMode: boolean;
  isRegisterAccountStep: boolean;
  isRegisterPasswordStep: boolean;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  onEmailChange: (v: string) => void;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onRegisterStepBack: () => void;
  onBlur: (field: "username" | "email" | "password" | "passwordConfirm") => void;
  validations: {
    username: FieldValidation;
    email: FieldValidation;
    password: FieldValidation;
    passwordConfirm: FieldValidation;
  };
}

export function LoginCredentialsSection(p: Props): React.JSX.Element {
  return (
    <>
      {p.isRegisterAccountStep && (
        <>
          <div className="space-y-1.5">
            <Label
              htmlFor="register-email"
              className="font-mono text-[11px] uppercase tracking-[1.2px] text-[#898989]"
            >
              Email
            </Label>
            <Input
              id="register-email"
              type="text"
              value={p.email}
              onChange={(e) => p.onEmailChange(e.target.value)}
              onBlur={() => p.onBlur("email")}
              placeholder={p.t.LOGIN.EMAIL_PLACEHOLDER}
              disabled={p.isLoading}
              autoComplete="email"
              className="auth-input h-10 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] text-[#fafafa] transition-all focus:border-[rgba(62,207,142,0.5)] focus:ring-1 focus:ring-[rgba(62,207,142,0.3)]"
              error={p.validations.email.error || undefined}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="auth-username"
              className="font-mono text-[11px] uppercase tracking-[1.2px] text-[#898989]"
            >
              Username
            </Label>
            <Input
              id="auth-username"
              type="text"
              value={p.username}
              onChange={(e) => p.onUsernameChange(e.target.value)}
              onBlur={() => p.onBlur("username")}
              placeholder={p.t.LOGIN.REGISTER_USERNAME_PLACEHOLDER}
              disabled={p.isLoading}
              autoComplete="username"
              className="auth-input h-10 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] text-[#fafafa] transition-all focus:border-[rgba(62,207,142,0.5)] focus:ring-1 focus:ring-[rgba(62,207,142,0.3)]"
              error={p.validations.username.error || undefined}
            />
          </div>
        </>
      )}
      {!p.isRegisterMode && (
        <div className="space-y-1.5">
          <Label
            htmlFor="auth-username"
            className="font-mono text-[11px] uppercase tracking-[1.2px] text-[#898989]"
          >
            {p.t.LOGIN.USERNAME_PLACEHOLDER}
          </Label>
          <Input
            id="auth-username"
            type="text"
            value={p.username}
            onChange={(e) => p.onUsernameChange(e.target.value)}
            onBlur={() => p.onBlur("username")}
            placeholder={p.t.LOGIN.USERNAME_PLACEHOLDER}
            disabled={p.isLoading}
            autoComplete="username"
            className="auth-input h-10 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] text-[#fafafa] transition-all focus:border-[rgba(62,207,142,0.5)] focus:ring-1 focus:ring-[rgba(62,207,142,0.3)]"
            error={p.validations.username.error || undefined}
          />
        </div>
      )}
      {(!p.isRegisterMode || p.isRegisterPasswordStep) && (
        <div className="space-y-1.5">
          <Label
            htmlFor="auth-password"
            className="font-mono text-[11px] uppercase tracking-[1.2px] text-[#898989]"
          >
            {p.t.LOGIN.PASSWORD_PLACEHOLDER}
          </Label>
          <Input
            id="auth-password"
            type="password"
            value={p.password}
            onChange={(e) => p.onPasswordChange(e.target.value)}
            onBlur={() => p.onBlur("password")}
            placeholder={p.t.LOGIN.PASSWORD_PLACEHOLDER}
            disabled={p.isLoading}
            autoComplete={p.isRegisterMode ? "new-password" : "current-password"}
            className="auth-input h-10 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] text-[#fafafa] transition-all focus:border-[rgba(62,207,142,0.5)] focus:ring-1 focus:ring-[rgba(62,207,142,0.3)]"
            error={p.validations.password.error || undefined}
          />
        </div>
      )}
      {p.isRegisterMode && p.isRegisterPasswordStep && (
        <div className="space-y-1.5">
          <Label
            htmlFor="auth-password-confirm"
            className="font-mono text-[11px] uppercase tracking-[1.2px] text-[#898989]"
          >
            {p.t.LOGIN.CONFIRM_PASSWORD_PLACEHOLDER}
          </Label>
          <Input
            id="auth-password-confirm"
            type="password"
            value={p.confirmPassword}
            onChange={(e) => p.onConfirmPasswordChange(e.target.value)}
            onBlur={() => p.onBlur("passwordConfirm")}
            placeholder={p.t.LOGIN.CONFIRM_PASSWORD_PLACEHOLDER}
            disabled={p.isLoading}
            autoComplete="new-password"
            className="auth-input h-10 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] text-[#fafafa] transition-all focus:border-[rgba(62,207,142,0.5)] focus:ring-1 focus:ring-[rgba(62,207,142,0.3)]"
            error={p.validations.passwordConfirm.error || undefined}
          />
        </div>
      )}


      {p.isRegisterMode ? (
        <div className="flex gap-2">
          {p.isRegisterPasswordStep && (
            <Button
              type="button"
              variant="outline"
              disabled={p.isLoading}
              onClick={p.onRegisterStepBack}
              className="h-10 flex-1 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] text-[#fafafa] font-medium text-[14px] hover:bg-[#171717] transition-colors"
            >
              {p.t.LOGIN.REGISTER_BACK}
            </Button>
          )}
          <Button
            type="submit"
            disabled={p.isLoading}
            className="h-10 flex-1 rounded-full bg-[#fafafa] text-[#0f0f0f] font-medium text-[14px] hover:bg-[#efefef] transition-colors"
          >
            {p.isRegisterAccountStep
              ? p.t.LOGIN.REGISTER_NEXT
              : p.t.LOGIN.CREATE_ACCOUNT}
          </Button>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={p.isLoading}
          className="h-10 w-full rounded-full bg-[#fafafa] text-[#0f0f0f] font-medium text-[14px] hover:bg-[#efefef] transition-colors"
        >
          {p.t.LOGIN.SUBMIT_BUTTON}
        </Button>
      )}
      {!p.isRegisterMode && (
        <p className="text-center text-xs leading-5 text-theme-muted">
          {p.t.LOGIN.FORGOT_PASSWORD}
        </p>
      )}
    </>
  );
}
