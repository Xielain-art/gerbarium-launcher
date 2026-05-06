import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  ApiChangelog,
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
} from "../../../../../../lib/api/changelog";
import {
  useAdminChangelogMutations,
  useAdminChangelogQuery,
} from "../../../../hooks/queries/useAdminQueries";
import { getErrorMessage } from "../../../../lib/queryHelpers";
import { ADMIN_TOASTS } from "./adminToasts";

type ChangelogSortBy = "releaseDate" | "version" | "createdAt";
type NewsOrder = "ASC" | "DESC";

function toChangelogSortBy(value: string): ChangelogSortBy {
  if (value === "version" || value === "createdAt") {
    return value;
  }
  return "releaseDate";
}

function toNewsOrder(value: string): NewsOrder {
  return value === "ASC" ? "ASC" : "DESC";
}

function parseChangesInput(input: string): string[] | undefined {
  const markdown = input.trim();
  if (!markdown) {
    return undefined;
  }
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function stringifyChangelogChanges(changes: unknown): string {
  if (!Array.isArray(changes)) {
    return "";
  }
  return changes
    .flatMap((entry) => {
      if (typeof entry === "string") {
        return [entry];
      }
      if (Array.isArray(entry)) {
        return entry.filter(
          (value): value is string => typeof value === "string",
        );
      }
      return [];
    })
    .join("\n");
}

function toApiCreateChangelogPayload(payload: {
  version: string;
  releaseDate: string;
  changes: string[];
  downloadUrl: string;
  mandatory: boolean;
}): ApiCreateChangelogDto {
  return payload as unknown as ApiCreateChangelogDto;
}

function toApiUpdateChangelogPayload(payload: {
  version?: string;
  releaseDate?: string;
  changes?: string[];
  downloadUrl?: string;
  mandatory?: boolean;
}): ApiUpdateChangelogDto {
  return payload as unknown as ApiUpdateChangelogDto;
}

interface AdminChangelogFilters {
  sortBy: ChangelogSortBy;
  order: NewsOrder;
  fromDate: string | undefined;
  toDate: string | undefined;
  mandatory: boolean | undefined;
}

export function useAdminChangelogSection() {
  const [changelogTab, setChangelogTab] = useState<"all" | "create">("all");
  const [editingChangelog, setEditingChangelog] = useState<ApiChangelog | null>(
    null,
  );
  const [previewChangelog, setPreviewChangelog] = useState<ApiChangelog | null>(
    null,
  );

  // Form State
  const [changelogVersion, setChangelogVersion] = useState("");
  const [changelogReleaseDate, setChangelogReleaseDate] = useState("");
  const [changelogDownloadUrl, setChangelogDownloadUrl] = useState("");
  const [changelogChangesInput, setChangelogChangesInput] = useState("");
  const [changelogMandatory, setChangelogMandatory] = useState(false);
  const [changelogFormError, setChangelogFormError] = useState<string | null>(
    null,
  );

  // Filter State
  const [changelogFromDate, setChangelogFromDate] = useState("");
  const [changelogToDate, setChangelogToDate] = useState("");
  const [changelogSortDraft, setChangelogSortDraft] =
    useState<ChangelogSortBy>("releaseDate");
  const [changelogOrderDraft, setChangelogOrderDraft] =
    useState<NewsOrder>("DESC");
  const [changelogMandatoryDraft, setChangelogMandatoryDraft] = useState<
    "all" | "mandatory" | "optional"
  >("all");

  const [appliedChangelogFilters, setAppliedChangelogFilters] =
    useState<AdminChangelogFilters>({
      sortBy: "releaseDate",
      order: "DESC",
      fromDate: undefined,
      toDate: undefined,
      mandatory: undefined,
    });

  const changelogQuery = useAdminChangelogQuery(appliedChangelogFilters);
  const changelogMutations = useAdminChangelogMutations(
    appliedChangelogFilters,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppliedChangelogFilters((prev) => ({
        ...prev,
        fromDate: changelogFromDate
          ? new Date(changelogFromDate).toISOString()
          : undefined,
        toDate: changelogToDate
          ? new Date(changelogToDate).toISOString()
          : undefined,
        mandatory:
          changelogMandatoryDraft === "all"
            ? undefined
            : changelogMandatoryDraft === "mandatory",
        sortBy: changelogSortDraft,
        order: changelogOrderDraft,
      }));
    }, 450);
    return () => clearTimeout(timeout);
  }, [
    changelogFromDate,
    changelogToDate,
    changelogMandatoryDraft,
    changelogSortDraft,
    changelogOrderDraft,
  ]);

  function resetChangelogForm(): void {
    setEditingChangelog(null);
    setChangelogVersion("");
    setChangelogReleaseDate("");
    setChangelogDownloadUrl("");
    setChangelogChangesInput("");
    setChangelogMandatory(false);
    setChangelogFormError(null);
  }

  function startEditChangelog(item: ApiChangelog): void {
    setEditingChangelog(item);
    setChangelogVersion(item.version);
    setChangelogReleaseDate(item.releaseDate.slice(0, 10));
    setChangelogDownloadUrl(item.downloadUrl);
    setChangelogChangesInput(stringifyChangelogChanges(item.changes));
    setChangelogMandatory(item.mandatory);
    setChangelogTab("create");
  }

  async function handleCreateChangelog(): Promise<void> {
    const changes = parseChangesInput(changelogChangesInput);
    if (
      !changelogVersion ||
      !changelogReleaseDate ||
      !changes ||
      !changelogDownloadUrl
    ) {
      setChangelogFormError(
        "Version, release date, changes and download URL are required",
      );
      return;
    }

    try {
      await changelogMutations.createChangelog.mutateAsync(
        toApiCreateChangelogPayload({
          version: changelogVersion,
          releaseDate: new Date(changelogReleaseDate).toISOString(),
          changes,
          downloadUrl: changelogDownloadUrl,
          mandatory: changelogMandatory,
        }),
      );
      setChangelogTab("all");
      resetChangelogForm();
      toast.success(ADMIN_TOASTS.changelogCreated);
    } catch {
      toast.error(ADMIN_TOASTS.changelogCreateError);
    }
  }

  async function handleUpdateChangelog(): Promise<void> {
    if (!editingChangelog) {
      return;
    }

    const changes = parseChangesInput(changelogChangesInput);
    if (
      !changelogVersion ||
      !changelogReleaseDate ||
      !changes ||
      !changelogDownloadUrl
    ) {
      setChangelogFormError(
        "Version, release date, changes and download URL are required",
      );
      return;
    }

    try {
      await changelogMutations.updateChangelog.mutateAsync({
        changelogId: editingChangelog.id,
        payload: toApiUpdateChangelogPayload({
          version: changelogVersion,
          releaseDate: new Date(changelogReleaseDate).toISOString(),
          changes,
          downloadUrl: changelogDownloadUrl,
          mandatory: changelogMandatory,
        }),
      });
      setChangelogTab("all");
      resetChangelogForm();
      toast.success(ADMIN_TOASTS.changelogUpdated);
    } catch {
      toast.error(ADMIN_TOASTS.changelogUpdateError);
    }
  }

  async function handleDeleteChangelog(changelogId: string): Promise<void> {
    try {
      await changelogMutations.deleteChangelog.mutateAsync(changelogId);
      toast.success(ADMIN_TOASTS.changelogDeleted);
    } catch {
      toast.error(ADMIN_TOASTS.changelogDeleteError);
    }
  }

  return {
    changelogTab,
    setChangelogTab,
    editingChangelog,
    previewChangelog,
    setPreviewChangelog,
    changelogVersion,
    setChangelogVersion,
    changelogReleaseDate,
    setChangelogReleaseDate,
    changelogDownloadUrl,
    setChangelogDownloadUrl,
    changelogChangesInput,
    setChangelogChangesInput,
    changelogMandatory,
    setChangelogMandatory,
    changelogFormError,
    changelogFromDate,
    setChangelogFromDate,
    changelogToDate,
    setChangelogToDate,
    changelogSortDraft,
    setChangelogSortDraft: (v: string) =>
      setChangelogSortDraft(toChangelogSortBy(v)),
    changelogOrderDraft,
    setChangelogOrderDraft: (v: string) =>
      setChangelogOrderDraft(toNewsOrder(v)),
    changelogMandatoryDraft,
    setChangelogMandatoryDraft,
    changelog: changelogQuery.data ?? [],
    changelogError: changelogQuery.isError
      ? getErrorMessage(changelogQuery.error, "Failed to fetch changelog")
      : null,
    isChangelogBusy:
      changelogMutations.createChangelog.isPending ||
      changelogMutations.updateChangelog.isPending ||
      changelogMutations.deleteChangelog.isPending,
    resetChangelogForm,
    startEditChangelog,
    handleCreateChangelog,
    handleUpdateChangelog,
    handleDeleteChangelog,
  };
}

