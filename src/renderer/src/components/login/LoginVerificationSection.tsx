import { Badge } from "../shadcn/ui";
import { Button } from "../ui";
import { Label } from "../shadcn/ui";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/InputOTP";
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
      <div className="auth-section space-y-4 text-center flex flex-col items-center">
        <Label
          htmlFor="email-code"
          className="text-[12px] font-mono uppercase tracking-[1.2px] text-theme-muted"
        >
          {t.LOGIN.CODE_LABEL}
        </Label>
        
        <InputOTP
          maxLength={6}
          value={verificationCode}
          onChange={(val) => onVerificationCodeChange(val)}
          disabled={isLoading}
          onBlur={() => onBlur("verificationCode")}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} hasError={!!validation.error} />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {validation.error && (
          <p className="text-xs text-red-400">{validation.error}</p>
        )}
        
        <p className="text-sm leading-5 text-[#898989]">{verificationEmail}</p>
      </div>
      <div className="auth-section flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm leading-5 text-[#898989]">
            {t.LOGIN.RESEND_HINT}
          </span>
          {developmentCode && (
            <Badge
              variant="secondary"
              className="rounded-md border border-[#363636] bg-[#242424] px-2 py-1 font-mono text-[10px] uppercase tracking-[1.2px] text-[#fafafa]"
            >
              {t.LOGIN.DEV_CODE_LABEL} {developmentCode}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            disabled={isLoading || verificationCode.length < 6}
            className="h-10 flex-1 rounded-full bg-[#fafafa] text-[#0f0f0f] hover:bg-[#efefef] font-medium text-[14px]"
          >
            {t.LOGIN.VERIFY_BUTTON}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || resendCountdown > 0}
            onClick={() => void onResendCode()}
            className="h-10 flex-1 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] hover:bg-[#171717] font-medium text-[14px]"
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
          className="justify-center rounded-md px-0 text-sm text-[#898989] hover:text-[#fafafa] hover:bg-transparent"
        >
          {t.LOGIN.USE_ANOTHER_ACCOUNT}
        </Button>
      </div>
    </>
  );
}
