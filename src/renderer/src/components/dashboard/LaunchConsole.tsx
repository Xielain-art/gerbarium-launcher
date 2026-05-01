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
      <h2 className="mb-4 font-minecraft text-lg font-bold uppercase tracking-wider text-theme">
        Console
      </h2>
      <div className="flex-1 overflow-y-auto rounded border-[2px] border-theme bg-[color-mix(in_srgb,var(--theme-bg)_85%,black_15%)] p-4 font-mono text-xs text-[#55ff55] shadow-inner">
        {logs.length === 0 && (
          <div className="text-theme-muted">Waiting for logs...</div>
        )}
        {logs.map((log, index) => (
          <div
            key={`${index}-${log.slice(0, 10)}`}
            className="mb-1 break-words opacity-90 hover:opacity-100"
          >
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

