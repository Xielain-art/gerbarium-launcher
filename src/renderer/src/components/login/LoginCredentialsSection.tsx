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
          <div className="space-y-1">
            <Label
              htmlFor="register-email"
              className="font-mono text-[10px] uppercase tracking-[1.2px] text-theme-muted"
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
              className="fantasy-input rounded-lg px-4 h-9 text-sm text-theme"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="auth-username"
              className="font-mono text-[10px] uppercase tracking-[1.2px] text-theme-muted"
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
              className="fantasy-input rounded-lg px-4 h-9 text-sm text-theme"
            />
          </div>
        </>
      )}
      {!p.isRegisterMode && (
        <div className="space-y-1">
          <Label
            htmlFor="auth-username"
            className="font-mono text-[10px] uppercase tracking-[1.2px] text-theme-muted"
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
            className="fantasy-input rounded-lg px-4 h-9 text-sm text-theme"
          />
        </div>
      )}
      {(!p.isRegisterMode || p.isRegisterPasswordStep) && (
        <div className="space-y-1">
          <Label
            htmlFor="auth-password"
            className="font-mono text-[10px] uppercase tracking-[1.2px] text-theme-muted"
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
            className="fantasy-input rounded-lg px-4 h-9 text-sm text-theme"
          />
        </div>
      )}
      {p.isRegisterMode && p.isRegisterPasswordStep && (
        <div className="space-y-1">
          <Label
            htmlFor="auth-password-confirm"
            className="font-mono text-[10px] uppercase tracking-[1.2px] text-theme-muted"
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
            className="fantasy-input rounded-lg px-4 h-9 text-sm text-theme"
          />
        </div>
      )}


      {p.isRegisterMode ? (
        <div className="flex gap-2 pt-2">
          {p.isRegisterPasswordStep && (
            <Button
              type="button"
              variant="outline"
              disabled={p.isLoading}
              onClick={p.onRegisterStepBack}
              className="fantasy-button h-9 flex-1 rounded-full text-theme font-medium text-[13px] transition-colors"
            >
              {p.t.LOGIN.REGISTER_BACK}
            </Button>
          )}
          <Button
            type="submit"
            disabled={p.isLoading}
            className="fantasy-button fantasy-button--primary h-9 flex-1 rounded-full px-8 py-2 font-medium text-[var(--theme-bg)] transition-colors"
          >
            {p.isRegisterAccountStep
              ? p.t.LOGIN.REGISTER_NEXT
              : p.t.LOGIN.CREATE_ACCOUNT}
          </Button>
        </div>
      ) : (
        <div className="pt-2">
          <Button
            type="submit"
            disabled={p.isLoading}
            className="fantasy-button fantasy-button--primary h-9 w-full rounded-full px-8 py-2 font-medium text-[var(--theme-bg)] transition-colors"
          >
            {p.t.LOGIN.SUBMIT_BUTTON}
          </Button>
        </div>
      )}
      {!p.isRegisterMode && (
        <p className="text-center text-[11px] leading-5 text-theme-muted hover:text-theme transition-colors cursor-pointer">
          {p.t.LOGIN.FORGOT_PASSWORD}
        </p>
      )}
    </>
  );
}
