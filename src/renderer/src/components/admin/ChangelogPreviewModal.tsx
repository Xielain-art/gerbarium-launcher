import type { ApiChangelog } from "../../../../lib/api/changelog";
import { renderMarkdownToSafeHtml } from "../../lib/markdown";

interface ChangelogPreviewModalProps {
  changelog: ApiChangelog | null;
  onClose: () => void;
}

function stringifyChangelogChanges(changes: unknown): string {
  if (!Array.isArray(changes)) return "";
  const lines = changes.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (Array.isArray(entry)) {
      return entry.filter((value): value is string => typeof value === "string");
    }
    return [];
  });
  return lines.join("\n");
}

export function ChangelogPreviewModal({
  changelog,
  onClose,
}: ChangelogPreviewModalProps) {
  if (!changelog) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
      <div className="mc-card max-h-[85vh] w-full max-w-3xl overflow-y-auto overflow-x-hidden p-0">
        <div className="flex items-center justify-between border-b-[3px] border-theme p-4">
          <h3 className="font-minecraft text-lg text-theme">
            Changelog v{changelog.version}
          </h3>
          <button
            type="button"
            className="mc-btn mc-btn-sm"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            {changelog.mandatory && (
              <span className="rounded bg-red-500/20 px-2 py-1 font-minecraft text-[10px] uppercase text-red-400">
                Mandatory
              </span>
            )}
            <span className="font-minecraft text-xs text-theme-muted">
              {new Date(changelog.releaseDate).toLocaleDateString("ru-RU")}
            </span>
          </div>
          <div
            className="max-w-full font-minecraft text-sm leading-relaxed text-theme-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[var(--mc-accent)] [&_a]:underline"
            style={{ overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "normal" }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdownToSafeHtml(stringifyChangelogChanges(changelog.changes)),
            }}
          />
          <button
            type="button"
            className="mc-btn mc-btn-primary"
            onClick={() =>
              void window.electronAPI.system.openExternal(changelog.downloadUrl)
            }
          >
            Скачать релиз
          </button>
        </div>
      </div>
    </div>
  );
}

