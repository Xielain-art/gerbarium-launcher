import type { RefObject } from "react";

interface LaunchConsoleProps {
  logs: string[];
  logsEndRef: RefObject<HTMLDivElement | null>;
}

export function LaunchConsole({
  logs,
  logsEndRef,
}: LaunchConsoleProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col px-6">
      <h2 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-theme-muted">
        Console Output
      </h2>
      <div className="flex-1 overflow-y-auto rounded-lg border border-theme bg-[var(--theme-bg)] p-4 font-mono text-[11px] leading-relaxed text-[var(--mc-accent)]">
        {logs.length === 0 && (
          <div className="text-theme-muted opacity-50">Waiting for process logs...</div>
        )}
        {logs.map((log, index) => (
          <div
            key={`${index}-${log.slice(0, 10)}`}
            className="mb-1 break-words opacity-90 hover:opacity-100"
          >
            <span className="mr-2 opacity-30">›</span>
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
