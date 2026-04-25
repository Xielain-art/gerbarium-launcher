import type { RefObject } from "react";

interface LaunchConsoleProps {
  logs: string[];
  logsEndRef: RefObject<HTMLDivElement | null>;
}

export function LaunchConsole({ logs, logsEndRef }: LaunchConsoleProps) {
  return (
    <div className="px-6 h-full flex flex-col">
      <h2 className="mb-4 font-minecraft text-lg font-bold uppercase tracking-wider text-[#e0e0e0]">
        Console
      </h2>
      <div className="flex-1 bg-[#101010] border-[2px] border-[#1a1a1a] rounded p-4 font-mono text-xs text-[#55ff55] overflow-y-auto shadow-inner">
        {logs.length === 0 && <div className="text-gray-500">Waiting for logs...</div>}
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
