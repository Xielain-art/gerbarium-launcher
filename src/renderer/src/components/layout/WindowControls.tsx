import { useWindowControls } from '../../hooks';
import { useTranslation } from '../../hooks/useTranslation';

export function WindowControls() {
  const { minimize, maximize, close, isMaximized } = useWindowControls();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-0 -webkit-app-region-no-drag">
      {/* Minimize Button */}
      <button
        onClick={minimize}
        className="w-10 h-10 flex items-center justify-center bg-[#3c3c3c] hover:bg-[#4a4a4a] active:bg-[#323232] transition-colors group
          border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]
          active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]
          -webkit-app-region-no-drag"
        title={t.WINDOW_CONTROLS.MINIMIZE}
      >
        <svg
          className="w-4 h-4 text-[#e0e0e0]"
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
        className="w-10 h-10 flex items-center justify-center bg-[#3c3c3c] hover:bg-[#4a4a4a] active:bg-[#323232] transition-colors group
          border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]
          active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]
          -webkit-app-region-no-drag"
        title={isMaximized ? t.WINDOW_CONTROLS.RESTORE : t.WINDOW_CONTROLS.MAXIMIZE}
      >
        {isMaximized ? (
          <svg
            className="w-3.5 h-3.5 text-[#e0e0e0]"
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
            className="w-3.5 h-3.5 text-[#e0e0e0]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <rect
              x="5"
              y="5"
              width="14"
              height="14"
              strokeLinecap="square"
            />
          </svg>
        )}
      </button>

      {/* Close Button */}
      <button
        onClick={close}
        className="w-10 h-10 flex items-center justify-center bg-[#3c3c3c] hover:bg-[#e81123] active:bg-[#c4101f] transition-colors group
          border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]
          active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]
          hover:border-t-[#aa3a3a] hover:border-l-[#aa3a3a] hover:border-b-[#5a1a1a] hover:border-r-[#5a1a1a]
          -webkit-app-region-no-drag"
        title={t.WINDOW_CONTROLS.CLOSE}
      >
        <svg
          className="w-4 h-4 text-[#e0e0e0]"
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
