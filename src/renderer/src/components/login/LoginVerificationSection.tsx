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
      <div className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-[#2e2e2e] rounded-xl">
        <Label
          htmlFor="email-code"
          className="text-[10px] font-mono uppercase tracking-[1.2px] text-[#898989]"
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
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot 
                key={i} 
                index={i} 
                hasError={!!validation.error} 
                className="w-9 h-11 bg-white/5 border-[#363636] rounded-lg text-[#fafafa] font-mono text-lg focus-visible:border-[#3ecf8e]"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {validation.error && (
          <p className="text-[11px] text-red-400 font-medium">{validation.error}</p>
        )}
        
        <p className="text-[13px] leading-snug text-[#fafafa] font-medium">{verificationEmail}</p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-[#898989]">
            {t.LOGIN.RESEND_HINT}
          </span>
          {developmentCode && (
            <Badge
              variant="secondary"
              className="rounded-full border border-[#363636] bg-[#171717] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#3ecf8e]"
            >
              {t.LOGIN.DEV_CODE_LABEL}: {developmentCode}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            disabled={isLoading || verificationCode.length < 6}
            className="h-9 flex-1 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-[#0f0f0f] font-medium rounded-full py-2 px-8 transition-colors"
          >
            {t.LOGIN.VERIFY_BUTTON}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || resendCountdown > 0}
            onClick={() => void onResendCode()}
            className="h-9 flex-1 rounded-full border border-[#2e2e2e] bg-transparent hover:bg-white/5 font-medium text-[13px] text-[#fafafa] transition-all"
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
          className="h-8 justify-center rounded-full text-[12px] text-[#898989] hover:text-[#fafafa] hover:bg-white/5 transition-all"
        >
          {t.LOGIN.USE_ANOTHER_ACCOUNT}
        </Button>
      </div>
    </>
  );
}
