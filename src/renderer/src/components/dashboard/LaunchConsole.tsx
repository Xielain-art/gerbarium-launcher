import type { RefObject } from "react";

interface LaunchConsoleProps {
  logs: string[];
  consoleScrollRef: RefObject<HTMLDivElement | null>;
}

export function LaunchConsole({
  logs,
  consoleScrollRef,
}: LaunchConsoleProps): React.JSX.Element {
  return (
    <div className="fantasy-panel flex h-56 flex-col p-4 shadow-2xl">
      <h2 className="fantasy-rune-label mb-4 text-[10px] font-bold">
        Console Output
      </h2>
      <div
        ref={consoleScrollRef}
        className="fantasy-card flex-1 overflow-y-auto rounded-[1rem] p-4 font-mono text-[11px] leading-relaxed text-[var(--mc-accent)]"
      >
        {logs.length === 0 && (
          <div className="text-theme-muted opacity-50">
            Waiting for process logs...
          </div>
        )}
        {logs.map((log, index) => (
          <div
            key={`${index}-${log.slice(0, 10)}`}
            className="mb-1 break-words opacity-90 hover:opacity-100"
          >
            <span className="mr-2 opacity-30">&gt;</span>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
