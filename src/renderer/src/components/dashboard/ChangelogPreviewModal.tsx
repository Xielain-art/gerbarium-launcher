import { useMemo } from "react";
import { DashboardContentDialog } from "./DashboardContentDialog";
import { renderMarkdownToSafeHtml } from "../../lib/markdown";
import type { ChangelogItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  changelog: ChangelogItem | null;
  onClose: () => void;
}

export function ChangelogPreviewModal({ t, changelog, onClose }: Props) {
  const html = useMemo(
    () => (changelog ? renderMarkdownToSafeHtml(changelog.changes.join("\n")) : ""),
    [changelog],
  );

  if (!changelog) return null;

  return (
    <DashboardContentDialog
      open={Boolean(changelog)}
      title={`Changelog v${changelog.version}`}
      maxWidthClassName="max-w-3xl"
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <button type="button" className="mc-btn mc-btn-sm" onClick={onClose}>{t.DASHBOARD.CLOSE}</button>
          <button type="button" className="mc-btn mc-btn-primary" onClick={() => void window.electronAPI.system.openExternal(changelog.downloadUrl)}>{t.DASHBOARD.DOWNLOAD_RELEASE}</button>
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          {changelog.mandatory && <span className="rounded bg-red-500/20 px-2 py-1 font-minecraft text-[10px] uppercase text-red-400">Mandatory</span>}
          <span className="font-minecraft text-xs text-theme-muted">{new Date(changelog.releaseDate).toLocaleDateString("ru-RU")}</span>
        </div>
        <div className="max-w-full font-minecraft text-sm leading-relaxed text-theme-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[var(--mc-accent)] [&_a]:underline" style={{ overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </DashboardContentDialog>
  );
}
