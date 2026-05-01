import { useWindowControls } from "../../hooks/useWindowControls";
import { useTranslation } from "../../hooks/useTranslation";

export function WindowControls(): React.JSX.Element {
  const { minimize, maximize, close, isMaximized } = useWindowControls();
  const { t } = useTranslation();

  return (
    <div className="flex -webkit-app-region-no-drag items-center gap-0">
      {/* Minimize Button */}
      <button
        onClick={minimize}
        className="group flex h-10 w-10 -webkit-app-region-no-drag items-center justify-center border-[3px] border-b-[var(--btn-border-lo)] border-l-[var(--btn-border-hi)] border-r-[var(--btn-border-lo)] border-t-[var(--btn-border-hi)] bg-[var(--btn-bg)] transition-colors hover:bg-[var(--btn-bg-hover)] active:border-b-[var(--btn-border-hi)] active:border-l-[var(--btn-border-lo)] active:border-r-[var(--btn-border-hi)] active:border-t-[var(--btn-border-lo)] active:bg-[var(--btn-bg-active)]"
        title={t.WINDOW_CONTROLS.MINIMIZE}
      >
        <svg
          className="h-4 w-4 text-[var(--btn-text)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="3"
        >
          <path strokeLinecap="square" d="M5 12h14" />
        </svg>
      </button>

      {/* Maximize/Restore Button */}
      <button
        onClick={maximize}
        className="group flex h-10 w-10 -webkit-app-region-no-drag items-center justify-center border-[3px] border-b-[var(--btn-border-lo)] border-l-[var(--btn-border-hi)] border-r-[var(--btn-border-lo)] border-t-[var(--btn-border-hi)] bg-[var(--btn-bg)] transition-colors hover:bg-[var(--btn-bg-hover)] active:border-b-[var(--btn-border-hi)] active:border-l-[var(--btn-border-lo)] active:border-r-[var(--btn-border-hi)] active:border-t-[var(--btn-border-lo)] active:bg-[var(--btn-bg-active)]"
        title={
          isMaximized ? t.WINDOW_CONTROLS.RESTORE : t.WINDOW_CONTROLS.MAXIMIZE
        }
      >
        {isMaximized ? (
          <svg
            className="h-3.5 w-3.5 text-[var(--btn-text)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="square"
              d="M8 8v8h8V8H8zm-2 0h2v2H6v8h2v2H4v-10h2zm12 0h2v10h-2v-2h2V8h-2z"
            />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5 text-[var(--btn-text)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <rect x="5" y="5" width="14" height="14" strokeLinecap="square" />
          </svg>
        )}
      </button>

      {/* Close Button */}
      <button
        onClick={close}
        className="group flex h-10 w-10 -webkit-app-region-no-drag items-center justify-center border-[3px] border-b-[var(--btn-border-lo)] border-l-[var(--btn-border-hi)] border-r-[var(--btn-border-lo)] border-t-[var(--btn-border-hi)] bg-[var(--btn-bg)] transition-colors hover:border-b-[var(--btn-danger-border-lo)] hover:border-l-[var(--btn-danger-border-hi)] hover:border-r-[var(--btn-danger-border-lo)] hover:border-t-[var(--btn-danger-border-hi)] hover:bg-[var(--mc-window-danger-hover)] active:border-b-[var(--btn-border-hi)] active:border-l-[var(--btn-border-lo)] active:border-r-[var(--btn-border-hi)] active:border-t-[var(--btn-border-lo)] active:bg-[var(--mc-window-danger-active)]"
        title={t.WINDOW_CONTROLS.CLOSE}
      >
        <svg
          className="h-4 w-4 text-[var(--btn-text)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
                >
          <path strokeLinecap="square" d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>
  );
}

