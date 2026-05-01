import { Badge, Button, Input, Label } from "../shadcn/ui";
import type { TranslationType } from "../../../../shared/constants/translations";

interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

interface Props {
  t: TranslationType;
  isLoading: boolean;
  verificationCode: string;
  verificationEmail: string;
  resendCountdown: number;
  developmentCode?: string;
  onVerificationCodeChange: (value: string) => void;
  onResendCode: () => Promise<void>;
  onUseAnotherAccount: () => Promise<void>;
  onBlur: (field: "verificationCode") => void;
  validation: FieldValidation;
}

export function LoginVerificationSection({
  t,
  isLoading,
  verificationCode,
  verificationEmail,
  resendCountdown,
  developmentCode,
  onVerificationCodeChange,
  onResendCode,
  onUseAnotherAccount,
  onBlur,
  validation,
}: Props): React.JSX.Element {
  return (
    <>
      <div className="auth-section space-y-2">
        <Label
          htmlFor="email-code"
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted"
        >
          {t.LOGIN.CODE_LABEL}
        </Label>
        <Input
          id="email-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder={t.LOGIN.CODE_PLACEHOLDER}
          value={verificationCode}
          onChange={(e) => onVerificationCodeChange(e.target.value)}
          onBlur={() => onBlur("verificationCode")}
          disabled={isLoading}
          className="auth-input h-10 rounded-2xl border-white/12 bg-white/6 text-center font-minecraft text-base tracking-[0.42em]"
          error={validation.error || undefined}
        />

        <p className="text-xs leading-5 text-theme-muted">{verificationEmail}</p>
      </div>
      <div className="auth-section flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm leading-5 text-theme-muted">
            {t.LOGIN.RESEND_HINT}
          </span>
          {developmentCode && (
            <Badge
              variant="secondary"
              className="rounded-full border border-amber-300/25 bg-amber-400/12 px-3 py-1 font-minecraft text-[10px] uppercase tracking-[0.15em] text-amber-50"
            >
              {t.LOGIN.DEV_CODE_LABEL} {developmentCode}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 flex-1 rounded-2xl font-minecraft text-[11px] uppercase tracking-[0.16em] shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
          >
            {t.LOGIN.VERIFY_BUTTON}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || resendCountdown > 0}
            onClick={() => void onResendCode()}
            className="h-10 flex-1 rounded-2xl border-white/12 bg-white/4 font-minecraft text-[11px] uppercase tracking-[0.16em] hover:bg-white/8"
          >
            {resendCountdown > 0
              ? t.LOGIN.RESEND_IN(resendCountdown)
              : t.LOGIN.RESEND_BUTTON}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={() => void onUseAnotherAccount()}
          className="justify-start rounded-xl px-0 text-sm text-theme-muted hover:bg-transparent hover:text-theme"
        >
          {t.LOGIN.USE_ANOTHER_ACCOUNT}
        </Button>
      </div>
    </>
  );
}


