import { useMemo } from "react";
import { DashboardContentDialog } from "./DashboardContentDialog";
import { renderMarkdownToSafeHtml } from "../../lib/markdown";
import type { ChangelogItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { Button } from "../shadcn/ui";

interface Props {
  t: TranslationType;
  changelog: ChangelogItem | null;
  onClose: () => void;
}

export function ChangelogPreviewModal({
  t,
  changelog,
  onClose,
}: Props): React.JSX.Element | null {
  const html = useMemo(
    () =>
      changelog ? renderMarkdownToSafeHtml(changelog.changes.join("\n")) : "",
    [changelog],
  );

  if (!changelog) {
    return null;
  }

  return (
    <DashboardContentDialog
      open={Boolean(changelog)}
      title={`Changelog v${changelog.version}`}
      maxWidthClassName="max-w-3xl"
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {t.DASHBOARD.CLOSE}
          </Button>
          <Button
            type="button"
            onClick={() =>
              void window.electronAPI.system.openExternal(changelog.downloadUrl)
            }
          >
            {t.DASHBOARD.DOWNLOAD_RELEASE}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          {changelog.mandatory && (
            <span className="rounded bg-[color:var(--destructive)]/20 px-2 py-1 font-minecraft text-[10px] uppercase text-[color:var(--destructive)]">
              Mandatory
            </span>
          )}
          <span className="text-xs text-[var(--muted-foreground)]">
            {new Date(changelog.releaseDate).toLocaleDateString("ru-RU")}
          </span>
        </div>
        <div
          className="max-w-full text-sm leading-relaxed text-[var(--muted-foreground)] [&_a]:text-[var(--primary)] [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          style={{
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </DashboardContentDialog>
  );
}

