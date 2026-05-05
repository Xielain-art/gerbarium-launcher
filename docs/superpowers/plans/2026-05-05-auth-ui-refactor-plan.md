# Auth UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the login and email verification components to a high-density, technical premium aesthetic with a 6-digit segmented OTP input.

**Architecture:** We will introduce a new reusable `InputOTP` component wrapping the `input-otp` library, and refactor the existing login components to use deep dark surfaces, emerald green accents, and pill-shaped buttons as defined in `DESIGN.md`.

**Tech Stack:** React, Tailwind CSS, input-otp, Lucide React

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install input-otp**

Run: `npm install input-otp`
Expected: Successfully installs `input-otp` and updates `package-lock.json`.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add input-otp dependency for verification component"
```

### Task 2: Create InputOTP Primitive

**Files:**
- Create: `src/renderer/src/components/ui/InputOTP.tsx`
- Modify: `src/renderer/src/components/ui/index.ts`

- [ ] **Step 1: Create the InputOTP component**

Write the following code into `src/renderer/src/components/ui/InputOTP.tsx`:

```tsx
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50 justify-center",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number, hasError?: boolean }
>(({ index, className, hasError, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-12 w-10 items-center justify-center border border-[#2e2e2e] bg-white/4 text-lg font-minecraft transition-all rounded-md",
        isActive && "z-10 border-[rgba(62,207,142,0.5)] ring-1 ring-[rgba(62,207,142,0.3)] bg-[#0f0f0f]",
        hasError && "border-red-500/50 bg-red-500/10",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-pulse bg-[#3ecf8e]" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

export { InputOTP, InputOTPGroup, InputOTPSlot }
```

- [ ] **Step 2: Export from index**

Append export to `src/renderer/src/components/ui/index.ts`:

```tsx
export * from "./InputOTP";
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/components/ui/InputOTP.tsx src/renderer/src/components/ui/index.ts
git commit -m "feat(ui): add InputOTP primitive component"
```

### Task 3: Refactor LoginVerificationSection

**Files:**
- Modify: `src/renderer/src/components/login/LoginVerificationSection.tsx`

- [ ] **Step 1: Replace text input with OTP segmented input**

Replace the current `<Input ... />` inside `LoginVerificationSection.tsx` with the new `<InputOTP ... />` group. Also, style the buttons according to the design system (Pill 9999px radius for primary, 6px for secondary). Update imports.

```tsx
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
```

- [ ] **Step 2: Check formatting with linter**

Run: `npx eslint src/renderer/src/components/login/LoginVerificationSection.tsx --fix`
Expected: Lint passes and fixes any minor code style issues.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/components/login/LoginVerificationSection.tsx
git commit -m "refactor(auth): integrate 6-digit OTP input into verification section"
```

### Task 4: Refactor LoginCredentialsSection and LoginFormCard

**Files:**
- Modify: `src/renderer/src/components/login/LoginCredentialsSection.tsx`
- Modify: `src/renderer/src/components/login/LoginFormCard.tsx`

- [ ] **Step 1: Update LoginCredentialsSection**

Update labels to be `font-mono tracking-[1.2px]`, change button styling to pill buttons, and input background to translucent. 

Run: `npx eslint src/renderer/src/components/login/LoginCredentialsSection.tsx --fix` (after saving)

(Note for agent: Edit `src/renderer/src/components/login/LoginCredentialsSection.tsx`. Find the `className` for `<Input>` components and change to `"auth-input h-10 rounded-md border-[#2e2e2e] bg-white/4 focus:border-[rgba(62,207,142,0.5)] focus:ring-[rgba(62,207,142,0.3)] transition-all"`. Find the `className` for `<Label>` components and change to `"text-[12px] font-mono uppercase tracking-[1.2px] text-[#898989]"`. Find the `className` for `<Button>` components. The primary button should have `"h-10 w-full rounded-full bg-[#fafafa] text-[#0f0f0f] hover:bg-[#efefef] font-medium text-[14px]"`. The "Back" button should have `"h-10 flex-1 rounded-md border border-[#2e2e2e] bg-[#0f0f0f] hover:bg-[#171717] font-medium text-[14px]"`. Use `replace` or full rewrite.)

- [ ] **Step 2: Update LoginFormCard**

Edit `src/renderer/src/components/login/LoginFormCard.tsx`. Update the overall card styling to align with `#171717` aesthetics.
- Card wrapper: Remove heavy gradients/shadows. Change `className` to `"w-full max-w-[420px] overflow-hidden rounded-xl border border-[#2e2e2e] bg-[#171717] shadow-none"`.
- CardTitle: Change `className` to `"text-[32px] font-normal leading-[1.00] tracking-tight text-[#fafafa]"`.
- Mode Badge/Eyebrow: Change to `"font-mono text-[12px] uppercase tracking-[1.2px] text-[#898989]"`.
- Description: Change to `"mt-3 max-w-[24rem] text-[16px] leading-[1.50] text-[#898989]"`.
- Auth Switch buttons: Keep `rounded-full` for active, update text to `font-mono text-[12px]`.

- [ ] **Step 3: Check tests and lint**

Run: `npm run lint` and `npm run test`
Expected: Everything passes.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/components/login/
git commit -m "style(auth): align login UI with premium technical design system"
```

---
