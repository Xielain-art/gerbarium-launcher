# Design Spec: Auth UI Refactor (Technical Premium)

**Date:** 2026-05-05  
**Topic:** Refactoring Login and Email Verification components  
**Status:** Approved (Approach 1)

## 1. Overview
Refactor the current auth UI to align with the "Supabase-inspired" technical premium aesthetic defined in `DESIGN.md`. The goal is to move from a standard form-based UI to a high-density, technical interface that feels like a professional developer tool.

## 2. Visual Theme & Atmosphere
- **Register:** `product`
- **Background:** Near-black native (`#171717`).
- **Accent:** Emerald green (`#3ecf8e`) for identity markers and primary focus.
- **Depth:** Created through translucent border hierarchy (alpha channels), not shadows.
- **Typography:**
  - **Display Titles:** Compressed 1.00 line-height (Circular).
  - **Technical Labels:** Monospace (Source Code Pro), 12px, Uppercase, 1.2px letter-spacing.

## 3. Key Component Changes

### 3.1 Login Verification (OTP)
- **Current:** Single text field.
- **New:** 6-digit segmented OTP input.
- **Behavior:**
  - Auto-focus next cell on input.
  - Backspace handles previous cell focus.
  - Support for pasting codes.
  - Focus state: Subtle emerald glow (`rgba(62, 207, 142, 0.3)` border).

### 3.2 Login Credentials
- **Inputs:** Translucent backgrounds (`bg-white/4` or `#0f0f0f`) with `#2e2e2e` borders.
- **Buttons:**
  - **Primary:** Pill-shaped (9999px radius), emerald accent or white-on-dark.
  - **Secondary/Back:** Subtle ghost/outline buttons with 6px radius.
- **Form Layout:** High-density, reduced vertical margins, focus on rhythmic spacing.

## 4. Architecture & File Structure
- **Target Files:**
  - `src/renderer/src/components/login/LoginFormCard.tsx` (Refactor structure/styling)
  - `src/renderer/src/components/login/LoginCredentialsSection.tsx` (Refactor styling/layout)
  - `src/renderer/src/components/login/LoginVerificationSection.tsx` (Implement 6-slot OTP)
- **New Components:**
  - `src/renderer/src/components/ui/InputOTP.tsx` (New reusable primitive)

## 5. Success Criteria
1. UI follows the Supabase/Technical aesthetic exactly.
2. OTP verification is functional and significantly improves user experience.
3. No regressions in existing auth logic (Zustand state integration remains intact).
4. Responsive behavior maintained for small windows.
