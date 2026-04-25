import { useEffect, useMemo, useState } from "react";
import type { CrashReportPayload } from "../../../../shared/constants/ipc-chanels";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
}

export function CrashNoticeBanner() {
  const [report, setReport] = useState<CrashReportPayload | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadReport = async () => {
      const response = await window.electronAPI.getLastCrashReport();
      if (!isMounted || !response.success) {
        return;
      }
      setReport(response.report ?? null);
    };

    void loadReport();
    return () => {
      isMounted = false;
    };
  }, []);

  const formattedTime = useMemo(
    () => (report ? formatTimestamp(report.timestamp) : ""),
    [report],
  );

  if (!report) {
    return null;
  }

  const handleDismiss = async () => {
    await window.electronAPI.clearLastCrashReport();
    setReport(null);
    setError(null);
  };

  const handleSendReport = async () => {
    setIsSending(true);
    setError(null);
    try {
      const result = await window.electronAPI.logs.exportAndReport();
      if (!result.success) {
        setError(result.error || "Не удалось сформировать отчёт.");
        return;
      }
      await handleDismiss();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Не удалось отправить отчёт.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pointer-events-auto absolute left-4 right-4 top-4 z-[120] rounded-xl border border-red-500/50 bg-red-950/90 p-4 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="font-minecraft text-sm text-red-200">
            Лаунчер завершился с ошибкой ({formattedTime})
          </div>
          <div className="max-h-20 overflow-y-auto font-minecraft text-xs text-red-100/90">
            {report.title}: {report.message}
          </div>
          {error ? (
            <div className="font-minecraft text-xs text-amber-300">{error}</div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="mc-btn mc-btn-sm mc-btn-danger"
            onClick={() => void handleSendReport()}
            disabled={isSending}
          >
            {isSending ? "Отправка..." : "Отправить ошибку"}
          </button>
          <button
            type="button"
            className="mc-btn mc-btn-sm"
            onClick={() => void handleDismiss()}
            disabled={isSending}
          >
            Скрыть
          </button>
        </div>
      </div>
    </div>
  );
}
