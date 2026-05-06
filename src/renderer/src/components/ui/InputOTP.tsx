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

function InputOTPGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex items-center gap-1", className)} {...props} />
}

function InputOTPSlot({
  index,
  className,
  hasError,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { index: number; hasError?: boolean }) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      className={cn(
        "relative flex h-12 w-10 items-center justify-center rounded-md border border-theme bg-[var(--theme-bg)] text-lg font-medium text-theme transition-all",
        isActive && "z-10 border-[rgba(62,207,142,0.5)] ring-1 ring-[rgba(62,207,142,0.3)]",
        hasError && "border-red-500/50 bg-red-500/10",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-pulse bg-[var(--mc-accent)]" />
        </div>
      )}
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot }
