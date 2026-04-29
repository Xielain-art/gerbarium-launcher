import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ApiChangelog, ApiCreateChangelogDto, ApiUpdateChangelogDto } from "../../../../../../lib/api/changelog";
import { useAdminChangelogMutations, useAdminChangelogQuery } from "../../../../hooks/queries/useAdminQueries";
import { getErrorMessage } from "../../../../lib/queryHelpers";
import { ADMIN_TOASTS } from "./adminToasts";

type ChangelogSortBy = "releaseDate" | "version" | "createdAt";
type NewsOrder = "ASC" | "DESC";
const toChangelogSortBy = (v: string): ChangelogSortBy => (v === "version" || v === "createdAt" ? v : "releaseDate");
const toNewsOrder = (v: string): NewsOrder => (v === "ASC" ? "ASC" : "DESC");

const parseChangesInput = (input: string): string[] | undefined => {
  const markdown = input.trim();
  if (!markdown) return undefined;
  return markdown.split("\n").map(line => line.trim()).filter(line => line.length > 0);
};

export const stringifyChangelogChanges = (changes: unknown): string => !Array.isArray(changes) ? "" : changes.flatMap((entry) => (typeof entry === "string" ? [entry] : Array.isArray(entry) ? entry.filter((value): value is string => typeof value === "string") : [])).join("\n");
const toApiCreateChangelogPayload = (payload: { version: string; releaseDate: string; changes: string[]; downloadUrl: string; mandatory: boolean }): ApiCreateChangelogDto => payload as unknown as ApiCreateChangelogDto;
const toApiUpdateChangelogPayload = (payload: { version?: string; releaseDate?: string; changes?: string[]; downloadUrl?: string; mandatory?: boolean }): ApiUpdateChangelogDto => payload as unknown as ApiUpdateChangelogDto;

export function useAdminChangelogSection() {
  const [changelogTab, setChangelogTab] = useState<"all" | "create">("all");
  const [editingChangelog, setEditingChangelog] = useState<ApiChangelog | null>(null);
  const [previewChangelog, setPreviewChangelog] = useState<ApiChangelog | null>(null);
  const [changelogVersion, setChangelogVersion] = useState("");
  const [changelogReleaseDate, setChangelogReleaseDate] = useState("");
  const [changelogDownloadUrl, setChangelogDownloadUrl] = useState("");
  const [changelogChangesInput, setChangelogChangesInput] = useState("");
  const [changelogMandatory, setChangelogMandatory] = useState(false);
  const [changelogFormError, setChangelogFormError] = useState<string | null>(null);
  const [changelogFromDate, setChangelogFromDate] = useState("");
  const [changelogToDate, setChangelogToDate] = useState("");
  const [changelogSortDraft, setChangelogSortDraft] = useState<ChangelogSortBy>("releaseDate");
  const [changelogOrderDraft, setChangelogOrderDraft] = useState<NewsOrder>("DESC");
  const [changelogMandatoryDraft, setChangelogMandatoryDraft] = useState<"all" | "mandatory" | "optional">("all");
  const [appliedChangelogFilters, setAppliedChangelogFilters] = useState({ sortBy: "releaseDate" as ChangelogSortBy, order: "DESC" as NewsOrder, fromDate: undefined as string | undefined, toDate: undefined as string | undefined, mandatory: undefined as boolean | undefined });

  const changelogQuery = useAdminChangelogQuery(appliedChangelogFilters);
  const changelogMutations = useAdminChangelogMutations(appliedChangelogFilters);

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedChangelogFilters((prev) => ({ ...prev, fromDate: changelogFromDate ? new Date(changelogFromDate).toISOString() : undefined, toDate: changelogToDate ? new Date(changelogToDate).toISOString() : undefined, mandatory: changelogMandatoryDraft === "all" ? undefined : changelogMandatoryDraft === "mandatory", sortBy: changelogSortDraft, order: changelogOrderDraft }));
    }, 450);
    return () => clearTimeout(t);
  }, [changelogFromDate, changelogToDate, changelogMandatoryDraft, changelogSortDraft, changelogOrderDraft]);

  const resetChangelogForm = () => { setEditingChangelog(null); setChangelogVersion(""); setChangelogReleaseDate(""); setChangelogDownloadUrl(""); setChangelogChangesInput(""); setChangelogMandatory(false); setChangelogFormError(null); };
  const startEditChangelog = (item: ApiChangelog) => { setEditingChangelog(item); setChangelogVersion(item.version); setChangelogReleaseDate(item.releaseDate.slice(0, 10)); setChangelogDownloadUrl(item.downloadUrl); setChangelogChangesInput(stringifyChangelogChanges(item.changes)); setChangelogMandatory(item.mandatory); setChangelogTab("create"); };

  const handleCreateChangelog = async () => { const changes = parseChangesInput(changelogChangesInput); if (!changelogVersion || !changelogReleaseDate || !changes || !changelogDownloadUrl) return setChangelogFormError("Version, release date, changes and download URL are required"); try { await changelogMutations.createChangelog.mutateAsync(toApiCreateChangelogPayload({ version: changelogVersion, releaseDate: new Date(changelogReleaseDate).toISOString(), changes, downloadUrl: changelogDownloadUrl, mandatory: changelogMandatory })); setChangelogTab("all"); resetChangelogForm(); toast.success(ADMIN_TOASTS.changelogCreated); } catch { toast.error(ADMIN_TOASTS.changelogCreateError); } };
  const handleUpdateChangelog = async () => { if (!editingChangelog) return; const changes = parseChangesInput(changelogChangesInput); if (!changelogVersion || !changelogReleaseDate || !changes || !changelogDownloadUrl) return setChangelogFormError("Version, release date, changes and download URL are required"); try { await changelogMutations.updateChangelog.mutateAsync({ changelogId: editingChangelog.id, payload: toApiUpdateChangelogPayload({ version: changelogVersion, releaseDate: new Date(changelogReleaseDate).toISOString(), changes, downloadUrl: changelogDownloadUrl, mandatory: changelogMandatory }) }); setChangelogTab("all"); resetChangelogForm(); toast.success(ADMIN_TOASTS.changelogUpdated); } catch { toast.error(ADMIN_TOASTS.changelogUpdateError); } };
  const handleDeleteChangelog = async (changelogId: string) => { try { await changelogMutations.deleteChangelog.mutateAsync(changelogId); toast.success(ADMIN_TOASTS.changelogDeleted); } catch { toast.error(ADMIN_TOASTS.changelogDeleteError); } };

  return {
    changelogTab, setChangelogTab, editingChangelog, previewChangelog, setPreviewChangelog,
    changelogVersion, setChangelogVersion, changelogReleaseDate, setChangelogReleaseDate, changelogDownloadUrl, setChangelogDownloadUrl,
    changelogChangesInput, setChangelogChangesInput, changelogMandatory, setChangelogMandatory, changelogFormError,
    changelogFromDate, setChangelogFromDate, changelogToDate, setChangelogToDate,
    changelogSortDraft, setChangelogSortDraft: (v: string) => setChangelogSortDraft(toChangelogSortBy(v)),
    changelogOrderDraft, setChangelogOrderDraft: (v: string) => setChangelogOrderDraft(toNewsOrder(v)),
    changelogMandatoryDraft, setChangelogMandatoryDraft,
    changelog: changelogQuery.data ?? [], changelogError: changelogQuery.isError ? getErrorMessage(changelogQuery.error, "Failed to fetch changelog") : null,
    isChangelogBusy: changelogMutations.createChangelog.isPending || changelogMutations.updateChangelog.isPending || changelogMutations.deleteChangelog.isPending,
    resetChangelogForm, startEditChangelog, handleCreateChangelog, handleUpdateChangelog, handleDeleteChangelog,
  };
}
