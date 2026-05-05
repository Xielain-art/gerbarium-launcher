# Spec: Core UI Redesign (Supabase-Inspired)

## 1. Overview
Redesign the Login, Update Search, and Integrity Check screens to align with the professional, technical aesthetic defined in `DESIGN.md`. Replace existing Minecraft-themed elements with sleek, high-density, dark-mode-native components.

## 2. Visual Direction
- **Backgrounds**: `#0f0f0f` (containers), `#171717` (page canvas).
- **Accents**: Supabase Emerald Green (`#3ecf8e`).
- **Typography**: 
  - Primary: `Circular` (or sans-serif fallback).
  - Technical/Labels: `Source Code Pro` (monospace), uppercase with 1.2px tracking.
- **Borders**: `1px solid #2e2e2e` (standard), `#363636` (prominent).
- **Radius**: `9999px` for primary pills, `6px` for secondary elements, `8px` for cards.
- **Shadows**: Minimize shadows; use border contrast for depth.

## 3. Component Specifications

### 3.1 Login Screen (`LoginScreen.tsx`, `LoginFormCard.tsx`)
- **Container**: Centered card with `#171717` background and `1px solid #2e2e2e` border.
- **Header**: Hero text with 1.00 line-height.
- **Inputs**: 
  - Background: `transparent` or slightly lighter than surface.
  - Border: `1px solid #363636`.
  - Focus: `1px solid #3ecf8e`.
- **Button**: Pill-shaped primary button with emerald green accent.
- **Footer**: Muted technical labels in monospace.

### 3.2 Integrity Check Screen (`IntegrityCheckScreen.tsx`)
- **Concept**: "Security Preflight".
- **Progress Bar**: Sleek 2px height linear bar (`#3ecf8e` fill on `#2e2e2e` track).
- **Labels**: All phase texts and percentages in Source Code Pro, uppercase.
- **Layout**: Minimalist, no heavy shadows or Minecraft gradients.

### 3.3 Update Screen & Card (`UpdateScreen.tsx`, `UpdateStatusCard.tsx`)
- **Concept**: "System Update".
- **Status Log**: Optional small log area showing technical details in monospace.
- **Progress**: Consistent with the Integrity Check linear bar.
- **Icons**: Replace pixelated icons with Lucide icons (e.g., `ShieldCheck`, `RefreshCw`).

## 4. Implementation Details
- Use Tailwind CSS for styling.
- Ensure `Source Code Pro` is used for all technical markers.
- Replace `font-minecraft` usage with `font-mono` or `font-sans` as appropriate.
- Maintain existing IPC and state logic; update only the visual layer.

## 5. Success Criteria
- The interface feels like a premium developer tool (Supabase-like).
- No "Minecraft-themed" (pixelated) elements remain in these screens.
- Consistent emerald green accent throughout the utility flow.
