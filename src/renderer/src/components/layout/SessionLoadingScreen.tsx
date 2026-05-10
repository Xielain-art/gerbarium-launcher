import { ProgressBar } from "../ui/ProgressBar";
import { WindowControls } from "./WindowControls";

interface SessionLoadingScreenProps {
  title?: string;
  message?: string;
}

export function SessionLoadingScreen({
  title = "Session Restore",
  message = "Refreshing secure session...",
}: SessionLoadingScreenProps): React.JSX.Element {
  return (
    <div className="fantasy-ui fantasy-shell relative flex h-screen w-full flex-col overflow-hidden bg-[var(--theme-surface)]">
      <div className="fantasy-orb fantasy-orb--violet left-[-7rem] top-[-5rem] h-[20rem] w-[20rem]" />
      <div className="fantasy-orb fantasy-orb--violet right-[-6rem] bottom-[-7rem] h-[22rem] w-[22rem] opacity-70" />
      <div className="auth-grid-overlay opacity-[0.05]" />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-8">
        <div
          className="fantasy-card fantasy-card--hero w-full max-w-md p-8"
          style={
            {
              "--mc-accent": "var(--fantasy-crystal-violet)",
              "--mc-accent-hi": "#c7b7ff",
            } as React.CSSProperties
          }
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl border border-[var(--fantasy-border-soft)] bg-[var(--mc-accent)]/10 p-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--mc-accent)]/25 border-t-[var(--mc-accent)]" />
            </div>
            <div>
              <div className="fantasy-rune-label text-[10px] text-[var(--mc-accent)]">
                {title}
              </div>
              <h1 className="fantasy-hero-title font-sans text-lg font-medium text-theme">
                Gerbarium Launcher
              </h1>
            </div>
          </div>

          <ProgressBar progress={72} status={message} />

          <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-widest text-theme-muted/60">
            Verifying ward seals...
          </p>
        </div>
      </div>
    </div>
  );
}
