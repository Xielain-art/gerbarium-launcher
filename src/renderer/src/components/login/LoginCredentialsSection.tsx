import { Button, Input, Label } from "../shadcn/ui";
import type { TranslationType } from "../../../../shared/constants/translations";

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
}

export function LoginCredentialsSection(p: Props) {
  return (
    <>
      {p.isRegisterAccountStep && (
        <>
          <div className="space-y-1.5"><Label htmlFor="register-email" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted">Email</Label><Input id="register-email" type="text" value={p.email} onChange={(e) => p.onEmailChange(e.target.value)} placeholder={p.t.LOGIN.EMAIL_PLACEHOLDER} disabled={p.isLoading} autoComplete="email" className="auth-input h-10 rounded-2xl border-white/12 bg-white/6" /></div>
          <div className="space-y-1.5"><Label htmlFor="auth-username" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted">Username</Label><Input id="auth-username" type="text" value={p.username} onChange={(e) => p.onUsernameChange(e.target.value)} placeholder={p.t.LOGIN.REGISTER_USERNAME_PLACEHOLDER} disabled={p.isLoading} autoComplete="username" className="auth-input h-10 rounded-2xl border-white/12 bg-white/6" /></div>
        </>
      )}
      {!p.isRegisterMode && <div className="space-y-1.5"><Label htmlFor="auth-username" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted">{p.t.LOGIN.USERNAME_PLACEHOLDER}</Label><Input id="auth-username" type="text" value={p.username} onChange={(e) => p.onUsernameChange(e.target.value)} placeholder={p.t.LOGIN.USERNAME_PLACEHOLDER} disabled={p.isLoading} autoComplete="username" className="auth-input h-10 rounded-2xl border-white/12 bg-white/6" /></div>}
      {(!p.isRegisterMode || p.isRegisterPasswordStep) && <div className="space-y-1.5"><Label htmlFor="auth-password" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted">{p.t.LOGIN.PASSWORD_PLACEHOLDER}</Label><Input id="auth-password" type="password" value={p.password} onChange={(e) => p.onPasswordChange(e.target.value)} placeholder={p.t.LOGIN.PASSWORD_PLACEHOLDER} disabled={p.isLoading} autoComplete={p.isRegisterMode ? "new-password" : "current-password"} className="auth-input h-10 rounded-2xl border-white/12 bg-white/6" /></div>}
      {p.isRegisterMode && p.isRegisterPasswordStep && <div className="space-y-1.5"><Label htmlFor="auth-password-confirm" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted">{p.t.LOGIN.CONFIRM_PASSWORD_PLACEHOLDER}</Label><Input id="auth-password-confirm" type="password" value={p.confirmPassword} onChange={(e) => p.onConfirmPasswordChange(e.target.value)} placeholder={p.t.LOGIN.CONFIRM_PASSWORD_PLACEHOLDER} disabled={p.isLoading} autoComplete="new-password" className="auth-input h-10 rounded-2xl border-white/12 bg-white/6" /></div>}

      {p.isRegisterMode ? (
        <div className="flex gap-2">
          {p.isRegisterPasswordStep ? <Button type="button" variant="outline" disabled={p.isLoading} onClick={p.onRegisterStepBack} className="h-10 flex-1 rounded-2xl border-white/12 bg-white/4 font-minecraft text-[11px] uppercase tracking-[0.16em] hover:bg-white/8">{p.t.LOGIN.REGISTER_BACK}</Button> : null}
          <Button type="submit" disabled={p.isLoading} className="h-10 flex-1 rounded-2xl font-minecraft text-[11px] uppercase tracking-[0.16em] shadow-[0_18px_44px_rgba(0,0,0,0.24)]">{p.isRegisterAccountStep ? p.t.LOGIN.REGISTER_NEXT : p.t.LOGIN.CREATE_ACCOUNT}</Button>
        </div>
      ) : (
        <Button type="submit" disabled={p.isLoading} className="h-10 w-full rounded-2xl font-minecraft text-[11px] uppercase tracking-[0.16em] shadow-[0_18px_44px_rgba(0,0,0,0.24)]">{p.t.LOGIN.SUBMIT_BUTTON}</Button>
      )}
      {!p.isRegisterMode && <p className="text-center text-xs leading-5 text-theme-muted">{p.t.LOGIN.FORGOT_PASSWORD}</p>}
    </>
  );
}
