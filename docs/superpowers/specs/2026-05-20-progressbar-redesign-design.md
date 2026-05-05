# ProgressBar Redesign Design

**Goal:** Redesign the `ProgressBar` component to a sleek technical version and update its callers to utilize the new integrated labels.

## Components

### 1. ProgressBar.tsx
The core component will be simplified to a 2px high bar with integrated labels below it.

**Props:**
- `progress`: number (0-100)
- `status`?: string
- `speed`?: string
- `eta`?: string
- `className`?: string

**Styling:**
- Progress Bar: `h-[2px] bg-[#2e2e2e]` with a `bg-[#3ecf8e]` fill.
- Labels: `font-mono text-[10px] uppercase tracking-wider text-[#898989]`.
- Speed: `text-[#3ecf8e]`.

### 2. DownloadingActionState.tsx
Update to remove the manual labels rendered above the `ProgressBar` and pass them as props instead.

### 3. LaunchingActionState.tsx
Update to remove the manual labels and percentage display, passing them to `ProgressBar`.

### 4. IntegrityCheckScreen.tsx
Update to remove the manual `statusMessage` and percentage display, passing them to `ProgressBar`.

## Success Criteria
- `ProgressBar` matches the technical aesthetic provided by the user.
- No redundant labels in callers.
- Component is responsive and handles long status strings gracefully.
- TDD is followed for the `ProgressBar` component if a test environment is viable, or at least verified via integrity tests.
