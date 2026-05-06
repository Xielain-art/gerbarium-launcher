import { useWindowControls } from "../../hooks/useWindowControls";
import { useTranslation } from "../../hooks/useTranslation";

export function WindowControls(): React.JSX.Element {
  const { minimize, maximize, close, isMaximized } = useWindowControls();
  const { t } = useTranslation();

  return (
    <div className="flex -webkit-app-region-no-drag items-center gap-0 overflow-hidden rounded-md border border-theme bg-[var(--theme-surface)]">
      {/* Minimize Button */}
      <button
        onClick={minimize}
        className="flex h-8 w-10 items-center justify-center text-theme-muted transition-colors hover:bg-[var(--theme-surface-soft)] hover:text-theme"
        title={t.WINDOW_CONTROLS.MINIMIZE}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" d="M5 12h14" />
        </svg>
      </button>

      {/* Maximize/Restore Button */}
      <button
        onClick={maximize}
        className="flex h-8 w-10 items-center justify-center text-theme-muted transition-colors hover:bg-[var(--theme-surface-soft)] hover:text-theme"
        title={isMaximized ? t.WINDOW_CONTROLS.RESTORE : t.WINDOW_CONTROLS.MAXIMIZE}
      >
        {isMaximized ? (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" d="M8 8v8h8V8H8zm-2 0h2v2H6v8h2v2H4v-10h2zm12 0h2v10h-2v-2h2V8h-2z" />
          </svg>
        ) : (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <rect x="6" y="6" width="12" height="12" rx="1" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Close Button */}
      <button
        onClick={close}
        className="flex h-8 w-10 items-center justify-center text-theme-muted transition-colors hover:bg-[color:var(--destructive)]/15 hover:text-[color:var(--destructive)]"
        title={t.WINDOW_CONTROLS.CLOSE}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>
  );
}
