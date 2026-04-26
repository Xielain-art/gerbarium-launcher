import type { RefObject } from "react";

interface LaunchConsoleProps {
  logs: string[];
  logsEndRef: RefObject<HTMLDivElement | null>;
}

export function LaunchConsole({ logs, logsEndRef }: LaunchConsoleProps) {
  return (
    <div className="px-6 h-full flex flex-col">
      <h2 className="mb-4 font-minecraft text-lg font-bold uppercase tracking-wider text-theme">
        Console
      </h2>
      <div className="flex-1 bg-[color-mix(in_srgb,var(--theme-bg)_85%,black_15%)] border-[2px] border-theme rounded p-4 font-mono text-xs text-[#55ff55] overflow-y-auto shadow-inner">
        {logs.length === 0 && <div className="text-theme-muted">Waiting for logs...</div>}
        {logs.map((log, i) => (
          <div key={`${i}-${log.slice(0, 10)}`} className="break-words mb-1 opacity-90 hover:opacity-100">
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
