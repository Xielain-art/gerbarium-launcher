# Core UI Redesign (Supabase-Inspired) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Login, Update, and Integrity Check screens to align with the Supabase-inspired professional technical aesthetic defined in `DESIGN.md`.

**Architecture:** Component-level visual overrides using Tailwind CSS and existing design tokens. We will replace Minecraft-themed utility classes and components with sleek, high-density, dark-mode-native equivalents.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React, Source Code Pro (Monospace).

---

### Task 1: Redesign Technical ProgressBar Component

**Files:**
- Modify: `src/renderer/src/components/ui/ProgressBar.tsx`

- [ ] **Step 1: Replace implementation with sleek technical version**

```tsx
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  progress: number; // 0-100
  status?: string;
  speed?: string;
  eta?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  status,
  speed,
  eta,
  className = "",
}: ProgressBarProps): React.JSX.Element {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-[2px] w-full bg-[#2e2e2e] overflow-hidden">
        <div
          className="h-full bg-[#3ecf8e] transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-wider text-[#898989]">
        <div className="flex gap-3">
          {status && <span>{status}</span>}
          {speed && <span className="text-[#3ecf8e]">{speed}</span>}
        </div>
        <div className="flex gap-3">
          {eta && <span>{eta}</span>}
          <span>{clampedProgress}%</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/renderer/src/components/ui/ProgressBar.tsx
git commit -m "style: redesign ProgressBar to sleek technical version"
```

---

### Task 2: Redesign Integrity Check Screen (Security Preflight)

**Files:**
- Modify: `src/renderer/src/pages/IntegrityCheckScreen.tsx`

- [ ] **Step 1: Replace Minecrafty layout with technical "Preflight" UI**

```tsx
import { ShieldCheck } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useIntegrityCheckScreen } from "../hooks/useIntegrityCheckScreen";

export function IntegrityCheckScreen(): React.JSX.Element {
  const vm = useIntegrityCheckScreen();

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[#171717] overflow-hidden">
      <div className="auth-grid-overlay opacity-[0.05]" />
      
      <div className="relative w-full max-w-md p-8 border border-[#2e2e2e] bg-[#0f0f0f] rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded bg-[#3ecf8e]/10">
            <ShieldCheck size={20} className="text-[#3ecf8e]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3ecf8e]">
              Security Preflight
            </div>
            <h1 className="font-sans text-lg font-medium text-[#fafafa] leading-tight">
              Verifying Integrity
            </h1>
          </div>
        </div>

        <ProgressBar
          progress={vm.progress}
          status={vm.phaseText}
          className="mb-4"
        />

        <div className="font-mono text-[9px] text-[#4d4d4d] leading-relaxed">
          {vm.statusMessage}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/renderer/src/pages/IntegrityCheckScreen.tsx
git commit -m "style: redesign IntegrityCheckScreen to Supabase aesthetic"
```

---

### Task 3: Redesign Update Status Card

**Files:**
- Modify: `src/renderer/src/components/update/UpdateStatusCard.tsx`

- [ ] **Step 1: Replace Minecrafty card with technical System Update card**

```tsx
import { RefreshCw } from "lucide-react";
import { UI_STRINGS } from "../../../../shared/constants/ui-strings";
import { ProgressBar } from "../ui/ProgressBar";

interface UpdateStatusCardProps {
  appVersion: string;
  updateMessage: string;
  updateProgress: number;
}

export function UpdateStatusCard({
  appVersion,
  updateMessage,
  updateProgress,
}: UpdateStatusCardProps) {
  return (
    <div className="w-full max-w-md p-8 border border-[#2e2e2e] bg-[#0f0f0f] rounded-lg">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded bg-[#3ecf8e]/10">
          <RefreshCw size={20} className="text-[#3ecf8e] animate-spin-slow" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3ecf8e]">
            System Update
          </div>
          <h1 className="font-sans text-lg font-medium text-[#fafafa] leading-tight">
            Gerbarium Launcher
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <ProgressBar
          progress={updateProgress}
          status={updateMessage}
        />

        {appVersion && (
          <div className="flex justify-between items-center border-t border-[#2e2e2e] pt-4 font-mono text-[10px] uppercase tracking-wider text-[#4d4d4d]">
            <span>{UI_STRINGS.COMMON.VERSION}</span>
            <span>{appVersion}</span>
          </div>
        )}
      </div>

      <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-widest text-[#4d4d4d]/60">
        {UI_STRINGS.UPDATE_SCREEN.COPYRIGHT}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/renderer/src/components/update/UpdateStatusCard.tsx
git commit -m "style: redesign UpdateStatusCard to Supabase aesthetic"
```

---

### Task 4: Redesign Update Screen Layout

**Files:**
- Modify: `src/renderer/src/pages/UpdateScreen.tsx`

- [ ] **Step 1: Remove legacy patterns and align background with redesign**

```tsx
import { WindowControls } from "../components";
import { useUpdateScreen } from "../hooks/useUpdateScreen";
import { UpdateStatusCard } from "../components/update";

export function UpdateScreen(): React.JSX.Element {
  const vm = useUpdateScreen();

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#171717] overflow-hidden">
      <div className="auth-grid-overlay opacity-[0.05]" />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="flex flex-1 items-center justify-center px-8 relative z-10">
        <UpdateStatusCard
          appVersion={vm.appVersion}
          updateMessage={vm.updateMessage}
          updateProgress={vm.updateProgress}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/renderer/src/pages/UpdateScreen.tsx
git commit -m "style: finalize UpdateScreen layout"
```

---

### Task 5: Redesign Login Form Card

**Files:**
- Modify: `src/renderer/src/components/login/LoginFormCard.tsx`

- [ ] **Step 1: Replace Minecrafty containers and styles with Supabase-inspired ones**

```tsx
// Partial replacement focused on visual structure
// Look for card wrapper and replace with:
<div className="relative z-10 w-full max-w-[420px] p-10 border border-[#2e2e2e] bg-[#0f0f0f] rounded-xl shadow-2xl">
  <div className="flex flex-col items-center mb-8">
    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#3ecf8e] mb-2">
      Authentication
    </div>
    <h1 className="text-3xl font-sans font-medium text-[#fafafa] tracking-tight leading-[1.00]">
      Welcome Back
    </h1>
  </div>
  {/* Replace inputs and buttons with sleek technical variants defined in Step 2 */}
</div>
```

- [ ] **Step 2: Update Input and Button styles in the same file**
- Replace `mc-input` with `bg-transparent border border-[#363636] focus:border-[#3ecf8e] rounded-md transition-all px-4 py-2 text-sm`
- Replace `mc-btn-primary` with `bg-[#3ecf8e] hover:bg-[#00c573] text-[#0f0f0f] font-medium rounded-full py-2 px-8 transition-colors`

- [ ] **Step 3: Commit changes**

```bash
git add src/renderer/src/components/login/LoginFormCard.tsx
git commit -m "style: redesign LoginFormCard to Supabase aesthetic"
```

---

### Task 6: Final Login Screen Alignment

**Files:**
- Modify: `src/renderer/src/pages/LoginScreen.tsx`

- [ ] **Step 1: Align page wrapper and background**

```tsx
// Update main container to:
<div className="relative flex h-screen w-full items-center justify-center bg-[#171717] overflow-hidden px-4">
  <div className="auth-grid-overlay opacity-[0.05]" />
  <div className="absolute right-4 top-4 z-50">
    <WindowControls />
  </div>
  {/* LoginFormCard is already updated */}
</div>
```

- [ ] **Step 2: Commit changes**

```bash
git add src/renderer/src/pages/LoginScreen.tsx
git commit -m "style: finalize LoginScreen layout"
```
