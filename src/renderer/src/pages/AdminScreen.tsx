import { useAdminPage } from "../hooks/useAdminPage";
import { WindowControls } from "../components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, {
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnStrikeThrough,
  BtnUnderline,
  BtnLink,
  BtnNumberedList,
  BtnBulletList,
  Separator,
} from "react-simple-wysiwyg";
import {
  Badge,
  Button as ButtonShadcn,
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
  Checkbox as ShadcnCheckbox,
  Dialog as ShadcnDialog,
  Input as ShadcnInput,
  Label as ShadcnLabel,
  Select as ShadcnSelect,
} from "@/components/shadcn/ui";
import type { ApiCreateNewsDto, ApiNews, ApiUpdateNewsDto } from "../../../lib/api/news";
import type {
  ApiChangelog,
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
} from "../../../lib/api/changelog";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../../../shared/constants/system";
import {
  useAdminChangelogMutations,
  useAdminChangelogQuery,
  useAdminNewsMutations,
  useAdminNewsQuery,
  useAdminNewsTagsQuery,
} from "../hooks/queries/useAdminQueries";
import { getErrorMessage } from "../lib/queryHelpers";

type UserRoleFilter = string;
type NewsSortBy = "createdAt" | "updatedAt" | "title";
type NewsOrder = "ASC" | "DESC";
type UserBanFilter = "all" | "banned" | "active";
type ChangelogSortBy = "releaseDate" | "version" | "createdAt";
type ChangelogMandatoryFilter = "all" | "mandatory" | "optional";

function toUserRoleFilter(value: string): UserRoleFilter | undefined {
  if (value === "all") return undefined;
  return value;
}

function toNewsSortBy(value: string): NewsSortBy {
  if (value === "updatedAt" || value === "title") {
    return value;
  }
  return "createdAt";
}

function toNewsOrder(value: string): NewsOrder {
  return value === "ASC" ? "ASC" : "DESC";
}

function toChangelogSortBy(value: string): ChangelogSortBy {
  if (value === "version" || value === "createdAt") {
    return value;
  }
  return "releaseDate";
}

function normalizeTagIdsForApi(tagIds: string[]): unknown[][] | undefined {
  if (tagIds.length === 0) return undefined;
  return tagIds.map((tagId) => [tagId]);
}

function toApiCreateNewsPayload(payload: {
  title: string;
  slug: string;
  content: string;
  image?: string;
  tagIds?: string[];
}): ApiCreateNewsDto {
  return {
    ...payload,
    tagIds: normalizeTagIdsForApi(payload.tagIds ?? []),
  } as unknown as ApiCreateNewsDto;
}

function toApiUpdateNewsPayload(payload: {
  title?: string;
  slug?: string;
  content?: string;
  image?: string;
  tagIds?: string[];
}): ApiUpdateNewsDto {
  return {
    ...payload,
    tagIds: normalizeTagIdsForApi(payload.tagIds ?? []),
  } as unknown as ApiUpdateNewsDto;
}

function parseChangesInput(input: string): string[] | undefined {
  const changes = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return changes.length > 0 ? changes : undefined;
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

export function AdminScreen() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const usersEndRef = useRef<HTMLDivElement>(null);
  const newsEndRef = useRef<HTMLDivElement>(null);
  const vm = useAdminPage();
  const {
    users,
    isLoading,
    isLoadingMore,
    actionLoading,
    error,
    hasMore,
    search: userSearch,
    role: userRole,
    banned: userBanned,
    setFilters: setUserFilters,
    fetchUsers,
    fetchMoreUsers,
    selectedUser,
    banModalOpen,
    setBanModalOpen,
    banReason,
    setBanReason,
    unbanModalOpen,
    setUnbanModalOpen,
    rolesModalOpen,
    setRolesModalOpen,
    selectedRoles,
    actionError,
    openBanModal,
    executeBan,
    openUnbanModal,
    executeUnban,
    openRolesModal,
    toggleRole,
    executeRolesUpdate,
    availableRoles,
    createRole,
    t,
  } = vm;

  const [activeTab, setActiveTab] = useState<"users" | "news" | "changelog">("users");
  const [newsTab, setNewsTab] = useState<"all" | "create" | "tags">("all");
  const [changelogTab, setChangelogTab] = useState<"all" | "create">("all");
  const [userSearchInput, setUserSearchInput] = useState(userSearch);
  const [userRoleFilter, setUserRoleFilter] = useState<UserRoleFilter | "all">(
    userRole ?? "all",
  );
  const [userBanFilter, setUserBanFilter] = useState<UserBanFilter>(
    userBanned === undefined ? "all" : userBanned ? "banned" : "active",
  );
  const [newsSearch, setNewsSearch] = useState("");
  const [newsTag, setNewsTag] = useState("");
  const [newsFromDate, setNewsFromDate] = useState("");
  const [newsToDate, setNewsToDate] = useState("");
  const [newsSortDraft, setNewsSortDraft] = useState<NewsSortBy>("createdAt");
  const [newsOrderDraft, setNewsOrderDraft] = useState<NewsOrder>("DESC");

  const [editingNews, setEditingNews] = useState<ApiNews | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSlug, setNewsSlug] = useState("");
  const [newsImage, setNewsImage] = useState("");
  const [selectedNewsTagIds, setSelectedNewsTagIds] = useState<string[]>([]);
  const [newNewsTagName, setNewNewsTagName] = useState("");
  const [newsContentHtml, setNewsContentHtml] = useState("");
  const [newsFormError, setNewsFormError] = useState<string | null>(null);
  const [newsTagFormError, setNewsTagFormError] = useState<string | null>(null);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingChangelog, setEditingChangelog] = useState<ApiChangelog | null>(null);
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
  const [changelogMandatoryDraft, setChangelogMandatoryDraft] =
    useState<ChangelogMandatoryFilter>("all");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [roleFormError, setRoleFormError] = useState<string | null>(null);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [appliedNewsFilters, setAppliedNewsFilters] = useState<{
    search?: string;
    tagId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: NewsSortBy;
    order?: NewsOrder;
  }>({
    sortBy: "createdAt",
    order: "DESC",
  });
  const [appliedChangelogFilters, setAppliedChangelogFilters] = useState<{
    fromDate?: string;
    toDate?: string;
    mandatory?: boolean;
    sortBy?: ChangelogSortBy;
    order?: NewsOrder;
  }>({
    sortBy: "releaseDate",
    order: "DESC",
  });

  const newsQuery = useAdminNewsQuery(appliedNewsFilters);
  const newsTagsQuery = useAdminNewsTagsQuery();
  const newsMutations = useAdminNewsMutations(appliedNewsFilters);
  const changelogQuery = useAdminChangelogQuery(appliedChangelogFilters);
  const changelogMutations = useAdminChangelogMutations(appliedChangelogFilters);
  const news = useMemo(() => newsQuery.data?.items ?? [], [newsQuery.data]);
  const isLoadingNews = newsQuery.isLoading;
  const isLoadingMoreNews = newsQuery.isFetchingNextPage;
  const hasMoreNews = Boolean(newsQuery.hasNextPage);
  const newsActionLoadingId =
    newsMutations.createNews.isPending ||
    newsMutations.updateNews.isPending ||
    newsMutations.deleteNews.isPending ||
    newsMutations.createNewsTag.isPending ||
    newsMutations.updateNewsTag.isPending ||
    newsMutations.deleteNewsTag.isPending
      ? "pending"
      : null;
  const newsTags = useMemo(
    () => newsTagsQuery.data ?? [],
    [newsTagsQuery.data],
  );
  const isLoadingNewsTags = newsTagsQuery.isLoading;
  const setNewsFilters = useCallback(
    (filters: Partial<typeof appliedNewsFilters>) => {
      setAppliedNewsFilters((prev) => ({ ...prev, ...filters }));
    },
    [],
  );
  const fetchMoreNews = newsQuery.fetchNextPage;
  const createNews = async (payload: ApiCreateNewsDto) => {
    try {
      await newsMutations.createNews.mutateAsync(payload);
      return true;
    } catch {
      return false;
    }
  };
  const updateNews = async (newsId: string, payload: ApiUpdateNewsDto) => {
    try {
      await newsMutations.updateNews.mutateAsync({ newsId, payload });
      return true;
    } catch {
      return false;
    }
  };
  const deleteNews = async (newsId: string) => {
    try {
      await newsMutations.deleteNews.mutateAsync(newsId);
      return true;
    } catch {
      return false;
    }
  };
  const createNewsTag = async (name: string) => {
    try {
      const result = await newsMutations.createNewsTag.mutateAsync({ name });
      return { success: true as const, tag: result.data };
    } catch (error) {
      return {
        success: false as const,
        error: getErrorMessage(error, "Failed to create news tag"),
      };
    }
  };
  const updateNewsTag = async (tagId: string, name: string) => {
    try {
      const result = await newsMutations.updateNewsTag.mutateAsync({
        tagId,
        payload: { name },
      });
      return { success: true as const, tag: result.data };
    } catch (error) {
      return {
        success: false as const,
        error: getErrorMessage(error, "Failed to update news tag"),
      };
    }
  };
  const deleteNewsTag = async (tagId: string) => {
    try {
      await newsMutations.deleteNewsTag.mutateAsync(tagId);
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: getErrorMessage(error, "Failed to delete news tag"),
      };
    }
  };
  const changelog = changelogQuery.data ?? [];
  const isLoadingChangelog = changelogQuery.isLoading;
  const changelogActionLoadingId =
    changelogMutations.createChangelog.isPending ||
    changelogMutations.updateChangelog.isPending ||
    changelogMutations.deleteChangelog.isPending
      ? "pending"
      : null;
  const changelogError = changelogQuery.isError
    ? getErrorMessage(changelogQuery.error, "Failed to fetch changelog")
    : null;
  const setChangelogFilters = useCallback(
    (filters: Partial<typeof appliedChangelogFilters>) => {
      setAppliedChangelogFilters((prev) => ({ ...prev, ...filters }));
    },
    [],
  );
  const createChangelog = async (payload: ApiCreateChangelogDto) => {
    try {
      await changelogMutations.createChangelog.mutateAsync(payload);
      return true;
    } catch {
      return false;
    }
  };
  const updateChangelog = async (
    changelogId: string,
    payload: ApiUpdateChangelogDto,
  ) => {
    try {
      await changelogMutations.updateChangelog.mutateAsync({
        changelogId,
        payload,
      });
      return true;
    } catch {
      return false;
    }
  };
  const deleteChangelog = async (changelogId: string) => {
    try {
      await changelogMutations.deleteChangelog.mutateAsync(changelogId);
      return true;
    } catch {
      return false;
    }
  };

  // Infinite scroll for users
  useEffect(() => {
    if (activeTab !== "users" || !hasMore || isLoading || isLoadingMore) return;
    const target = usersEndRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void fetchMoreUsers();
        }
      },
      { root: scrollRef.current, rootMargin: "0px 0px 400px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, hasMore, isLoading, isLoadingMore, fetchMoreUsers]);

  // Infinite scroll for news
  useEffect(() => {
    if (activeTab !== "news" || newsTab !== "all" || !hasMoreNews || isLoadingNews || isLoadingMoreNews) return;
    const target = newsEndRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void fetchMoreNews();
        }
      },
      { root: scrollRef.current, rootMargin: "0px 0px 400px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, newsTab, hasMoreNews, isLoadingNews, isLoadingMoreNews, fetchMoreNews]);

  // Debounced users search input keeps filtering responsive and stable.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchInput !== userSearch) {
        setUserFilters({ search: userSearchInput });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [userSearchInput, userSearch, setUserFilters]);

  // Debounced news filters (search, tag, dates, sort, order).
  useEffect(() => {
    const timer = setTimeout(() => {
      setNewsFilters({ 
        search: newsSearch, 
        tagId: newsTag,
        fromDate: newsFromDate ? new Date(newsFromDate).toISOString() : undefined,
        toDate: newsToDate ? new Date(newsToDate).toISOString() : undefined,
        sortBy: newsSortDraft,
        order: newsOrderDraft,
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [
    newsSearch,
    newsTag,
    newsFromDate,
    newsToDate,
    newsSortDraft,
    newsOrderDraft,
    setNewsFilters,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChangelogFilters({
        fromDate: changelogFromDate ? new Date(changelogFromDate).toISOString() : undefined,
        toDate: changelogToDate ? new Date(changelogToDate).toISOString() : undefined,
        mandatory:
          changelogMandatoryDraft === "all"
            ? undefined
            : changelogMandatoryDraft === "mandatory",
        sortBy: changelogSortDraft,
        order: changelogOrderDraft,
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [
    changelogFromDate,
    changelogToDate,
    changelogMandatoryDraft,
    changelogSortDraft,
    changelogOrderDraft,
    setChangelogFilters,
  ]);

  const handleCreateNews = async () => {
    setNewsFormError(null);
    if (!newsTitle || !newsSlug || !newsContentHtml) {
      setNewsFormError("Title, slug and content are required");
      return;
    }
    const success = await createNews(
      toApiCreateNewsPayload({
        title: newsTitle,
        slug: newsSlug,
        content: newsContentHtml,
        image: newsImage || undefined,
        tagIds: selectedNewsTagIds,
      }),
    );
    if (success) {
      setNewsTab("all");
      resetNewsForm();
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;
    setNewsFormError(null);
    const success = await updateNews(
      editingNews.id,
      toApiUpdateNewsPayload({
        title: newsTitle,
        slug: newsSlug,
        content: newsContentHtml,
        image: newsImage || undefined,
        tagIds: selectedNewsTagIds,
      }),
    );
    if (success) {
      setNewsTab("all");
      resetNewsForm();
    }
  };

  const resetNewsForm = () => {
    setEditingNews(null);
    setNewsTitle("");
    setNewsSlug("");
    setNewsImage("");
    setSelectedNewsTagIds([]);
    setNewNewsTagName("");
    setNewsTagFormError(null);
    setNewsContentHtml("");
    setNewsFormError(null);
  };

  const handleCreateNewsTag = async () => {
    setNewsTagFormError(null);
    const name = newNewsTagName.trim();
    if (!name) {
      setNewsTagFormError("Tag name is required");
      return;
    }
    const result = await createNewsTag(name);
    if (!result.success || !result.tag) {
      setNewsTagFormError(result.error || "Failed to create tag");
      return;
    }
    const createdTag = result.tag;
    setSelectedNewsTagIds((prev) =>
      prev.includes(createdTag.id) ? prev : [...prev, createdTag.id],
    );
    setNewNewsTagName("");
  };

  const handleUpdateNewsTag = async () => {
    if (!editingTagId) return;
    setNewsTagFormError(null);
    const name = editingTagName.trim();
    if (!name) {
      setNewsTagFormError("Tag name is required");
      return;
    }
    const result = await updateNewsTag(editingTagId, name);
    if (!result.success) {
      setNewsTagFormError(result.error || "Failed to update tag");
      return;
    }
    setEditingTagId(null);
    setEditingTagName("");
  };

  const handleDeleteNewsTag = async (tagId: string) => {
    setNewsTagFormError(null);
    const result = await deleteNewsTag(tagId);
    if (!result.success) {
      setNewsTagFormError(result.error || "Failed to delete tag");
      return;
    }
    setSelectedNewsTagIds((prev) => prev.filter((id) => id !== tagId));
    if (newsTag === tagId) {
      setNewsTag("");
    }
  };

  const resetChangelogForm = () => {
    setEditingChangelog(null);
    setChangelogVersion("");
    setChangelogReleaseDate("");
    setChangelogDownloadUrl("");
    setChangelogChangesInput("");
    setChangelogMandatory(false);
    setChangelogFormError(null);
  };

  const handleCreateChangelog = async () => {
    setChangelogFormError(null);
    const changes = parseChangesInput(changelogChangesInput);
    if (!changelogVersion || !changelogReleaseDate || !changes || !changelogDownloadUrl) {
      setChangelogFormError("Version, release date, changes and download URL are required");
      return;
    }
    const success = await createChangelog(
      toApiCreateChangelogPayload({
        version: changelogVersion,
        releaseDate: new Date(changelogReleaseDate).toISOString(),
        changes,
        downloadUrl: changelogDownloadUrl,
        mandatory: changelogMandatory,
      }),
    );
    if (success) {
      setChangelogTab("all");
      resetChangelogForm();
    }
  };

  const handleUpdateChangelog = async () => {
    if (!editingChangelog) return;
    setChangelogFormError(null);
    const changes = parseChangesInput(changelogChangesInput);
    if (!changelogVersion || !changelogReleaseDate || !changes || !changelogDownloadUrl) {
      setChangelogFormError("Version, release date, changes and download URL are required");
      return;
    }
    const success = await updateChangelog(
      editingChangelog.id,
      toApiUpdateChangelogPayload({
        version: changelogVersion,
        releaseDate: new Date(changelogReleaseDate).toISOString(),
        changes,
        downloadUrl: changelogDownloadUrl,
        mandatory: changelogMandatory,
      }),
    );
    if (success) {
      setChangelogTab("all");
      resetChangelogForm();
    }
  };

  const handleCreateRole = async () => {
    setRoleFormError(null);
    const name = newRoleName.trim();
    if (!name) {
      setRoleFormError("Role name is required");
      return;
    }
    const result = await createRole({
      name,
      description: newRoleDescription.trim() || undefined,
    });
    if (!result.success) {
      setRoleFormError(result.error || "Failed to create role");
      return;
    }
    setNewRoleName("");
    setNewRoleDescription("");
  };

  const newsRows = useMemo(() => news, [news]);
  const filteredNewsTags = useMemo(() => {
    const query = tagSearchQuery.trim().toLowerCase();
    if (!query) return newsTags;
    return newsTags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [newsTags, tagSearchQuery]);
  const filteredAvailableRoles = useMemo(() => {
    const query = roleSearchQuery.trim().toLowerCase();
    if (!query) return availableRoles;
    return availableRoles.filter((role) => {
      const name = role.name.toLowerCase();
      const description =
        typeof role.description === "string" ? role.description.toLowerCase() : "";
      return name.includes(query) || description.includes(query);
    });
  }, [availableRoles, roleSearchQuery]);
  const isApplyingUserFilters = activeTab === "users" && isLoading;
  const isApplyingNewsFilters = activeTab === "news" && newsTab === "all" && isLoadingNews;
  const isAdminApiBusy = Boolean(
    actionLoading ||
      newsActionLoadingId ||
      changelogActionLoadingId ||
      isLoading ||
      isLoadingMore ||
      isLoadingNews ||
      isLoadingMoreNews ||
      isLoadingChangelog,
  );

  return (
    <div className="flex h-screen flex-col bg-theme-main-gradient p-4 text-theme lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonShadcn
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: ROUTES.DASHBOARD })}
            className="h-10 w-10 text-theme hover:bg-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </ButtonShadcn>
          <h1 className="font-minecraft text-2xl font-bold tracking-tighter">
            {t.ADMIN.TITLE}
          </h1>
        </div>
        <WindowControls />
      </div>

      <div
        ref={scrollRef}
        className={`relative z-10 flex-1 overflow-y-auto pr-2 ${isAdminApiBusy ? "pointer-events-none" : ""}`}
      >
        {isAdminApiBusy && (
          <div className="absolute inset-0 z-40 flex items-start justify-center bg-black/25 pt-8 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded border border-white/10 bg-black/70 px-3 py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-theme/60 border-t-transparent" />
              <span className="font-minecraft text-[10px] uppercase text-theme-muted">
                Выполняется запрос...
              </span>
            </div>
          </div>
        )}
        <div className="mb-6 flex gap-2">
          <ButtonShadcn
            variant={activeTab === "users" ? "default" : "secondary"}
            onClick={() => setActiveTab("users")}
            className="font-minecraft uppercase tracking-wider"
          >
            {t.ADMIN.TAB_USERS}
          </ButtonShadcn>
          <ButtonShadcn
            variant={activeTab === "news" ? "default" : "secondary"}
            onClick={() => setActiveTab("news")}
            className="font-minecraft uppercase tracking-wider"
          >
            {t.ADMIN.TAB_NEWS}
          </ButtonShadcn>
          <ButtonShadcn
            variant={activeTab === "changelog" ? "default" : "secondary"}
            onClick={() => setActiveTab("changelog")}
            className="font-minecraft uppercase tracking-wider"
          >
            Changelog
          </ButtonShadcn>
        </div>

        {activeTab === "users" && (
        <ShadcnCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-minecraft text-xl font-bold">
                {t.ADMIN.USERS_TITLE}
              </h2>
              <div className="flex items-center gap-3">
                {isApplyingUserFilters && (
                  <div className="flex items-center gap-2 text-theme-muted">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-theme/50 border-t-transparent" />
                    <span className="font-minecraft text-[10px] uppercase">Фильтрация...</span>
                  </div>
                )}
                <ButtonShadcn
                  variant="default"
                  onClick={() => fetchUsers()}
                  disabled={isLoading}
                >
                  {isLoading ? t.ADMIN.LOADING : t.ADMIN.REFRESH}
                </ButtonShadcn>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-white/10 bg-black/10 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-minecraft text-[10px] uppercase text-theme-muted">
                    Поиск пользователей
                  </label>
                  <ShadcnInput
                    placeholder="Логин или Email..."
                    value={userSearchInput}
                    onChange={(e) => setUserSearchInput(e.target.value)}
                    className="h-10 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Роль"
                    value={userRoleFilter}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setUserRoleFilter(val as UserRoleFilter | "all");
                      setUserFilters({ role: toUserRoleFilter(val) });
                    }}
                    options={[
                      { label: "Все роли", value: "all" },
                      ...availableRoles.map((role) => ({
                        label: role.name,
                        value: role.id,
                      })),
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Статус"
                    value={userBanFilter}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      const normalized = val as UserBanFilter;
                      setUserBanFilter(normalized);
                      setUserFilters({
                        banned:
                          normalized === "all"
                            ? undefined
                            : normalized === "banned",
                      });
                    }}
                    options={[
                      { label: "Все", value: "all" },
                      { label: "Забаненные", value: "banned" },
                      { label: "Активные", value: "active" },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-white/10 bg-black/10 p-4">
              <div className="mb-3 font-minecraft text-xs uppercase text-theme-muted">
                Создание роли
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ShadcnInput
                  placeholder="role-name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
                <ShadcnInput
                  placeholder="Описание (опционально)"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                />
                <ButtonShadcn
                  variant="default"
                  onClick={() => void handleCreateRole()}
                  disabled={isAdminApiBusy}
                >
                  Создать роль
                </ButtonShadcn>
              </div>
              {roleFormError && (
                <div className="mt-2 font-minecraft text-xs text-red-500">{roleFormError}</div>
              )}
            </div>

          {error && <div className="mb-4 text-red-500 font-minecraft">{error}</div>}

          <div className="grid gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded border border-white/5 bg-black/20 p-4 transition-colors hover:bg-black/30"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded bg-white/10">
                    <div className="flex h-full w-full items-center justify-center font-minecraft text-xl uppercase">
                      {user.username[0]}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-minecraft font-bold text-theme">
                        {user.username}
                      </span>
                      {user.isBanned && (
                        <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-minecraft text-[10px] font-bold text-red-500 uppercase">
                          Banned
                        </span>
                      )}
                      <div className="flex gap-1">
                        {(user.roles ?? []).map((r) => (
                          <span
                            key={r.id}
                            className="rounded bg-theme/10 px-1.5 py-0.5 font-minecraft text-[10px] font-bold text-theme-muted uppercase"
                          >
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="font-minecraft text-xs text-theme-muted">
                      {user.email} • {user.id.slice(0, 8)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ButtonShadcn
                    variant="outline"
                    size="sm"
                    onClick={() => openRolesModal(user)}
                    disabled={!!actionLoading}
                  >
                    Roles
                  </ButtonShadcn>
                  {user.isBanned ? (
                    <ButtonShadcn
                      variant="secondary"
                      size="sm"
                      onClick={() => openUnbanModal(user)}
                      disabled={!!actionLoading}
                    >
                      Unban
                    </ButtonShadcn>
                  ) : (
                    <ButtonShadcn
                      variant="destructive"
                      size="sm"
                      onClick={() => openBanModal(user)}
                      disabled={!!actionLoading}
                    >
                      Ban
                    </ButtonShadcn>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && !isLoading && (
              <div className="text-center text-theme-muted py-8 font-minecraft">
                {t.ADMIN.NO_USERS}
              </div>
            )}
            <div ref={usersEndRef} className="h-4 w-full" />
            {isLoadingMore && (
              <div className="py-4 text-center font-minecraft text-xs text-theme-muted">
                Загрузка пользователей...
              </div>
            )}
          </div>
        </ShadcnCard>
        )}

        {activeTab === "news" && (
        <ShadcnCard className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-minecraft text-xl font-bold">Управление новостями</h2>
            <div className="flex items-center gap-3">
              {isApplyingNewsFilters && (
                <div className="flex items-center gap-2 text-theme-muted">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-theme/50 border-t-transparent" />
                  <span className="font-minecraft text-[10px] uppercase">Фильтрация...</span>
                </div>
              )}
              <div className="flex gap-2">
              <ButtonShadcn
                variant={newsTab === "all" ? "default" : "secondary"}
                onClick={() => setNewsTab("all")}
                className="font-minecraft uppercase text-xs"
              >
                Все новости
              </ButtonShadcn>
              <ButtonShadcn
                variant={newsTab === "tags" ? "default" : "secondary"}
                onClick={() => setNewsTab("tags")}
                className="font-minecraft uppercase text-xs"
              >
                Теги
              </ButtonShadcn>
              {!editingNews ? (
                <ButtonShadcn
                  variant={newsTab === "create" ? "default" : "secondary"}
                  onClick={() => {
                    resetNewsForm();
                    setNewsTab("create");
                  }}
                  className="font-minecraft uppercase text-xs"
                >
                  Создать
                </ButtonShadcn>
              ) : (
                <span className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 font-minecraft text-[10px] uppercase text-amber-300">
                  Режим редактирования
                </span>
              )}
              </div>
            </div>
          </div>

          {newsTab === "all" && (
          <div className="grid gap-3">
            <div className="mb-6 rounded-lg border border-white/10 bg-black/10 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-minecraft text-[10px] uppercase text-theme-muted">
                    Поиск по контенту
                  </label>
                  <ShadcnInput
                    placeholder="Название или часть текста..."
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    className="h-10 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Тег"
                    value={newsTag}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setNewsTag(val);
                    }}
                    options={[
                      { label: "Все теги", value: "" },
                      ...newsTags.map((tag) => ({ label: tag.name, value: tag.id })),
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Сортировка"
                    value={newsSortDraft}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setNewsSortDraft(toNewsSortBy(val));
                    }}
                    options={[
                      { label: "По созданию", value: "createdAt" },
                      { label: "По обновлению", value: "updatedAt" },
                      { label: "По названию", value: "title" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block font-minecraft text-[10px] uppercase text-theme-muted">
                    От даты
                  </label>
                  <ShadcnInput
                    type="datetime-local"
                    value={newsFromDate}
                    onChange={(e) => setNewsFromDate(e.target.value)}
                    className="h-10 w-full px-2 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block font-minecraft text-[10px] uppercase text-theme-muted">
                    До даты
                  </label>
                  <ShadcnInput
                    type="datetime-local"
                    value={newsToDate}
                    onChange={(e) => setNewsToDate(e.target.value)}
                    className="h-10 w-full px-2 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Порядок"
                    value={newsOrderDraft}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setNewsOrderDraft(toNewsOrder(val));
                    }}
                    options={[
                      { label: "Новые", value: "DESC" },
                      { label: "Старые", value: "ASC" },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {newsRows.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded border border-white/5 bg-black/20 p-4 transition-colors hover:bg-black/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded bg-white/10">
                      {item.image ? (
                        <img src={item.image} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-minecraft text-[10px] text-theme-muted uppercase">
                          No Img
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-minecraft font-bold text-theme">{item.title}</div>
                      <div className="font-minecraft text-[10px] text-theme-muted uppercase tracking-tighter">
                        {item.slug} • {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ButtonShadcn
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingNews(item);
                        setNewsTitle(item.title);
                        setNewsSlug(item.slug);
                        setNewsImage(item.image || "");
                        setSelectedNewsTagIds(
                          Array.isArray(item.tags)
                            ? item.tags
                                .map((tag) =>
                                  typeof tag === "object" &&
                                  tag !== null &&
                                  "id" in tag &&
                                  typeof (tag as { id?: unknown }).id === "string"
                                    ? (tag as { id: string }).id
                                    : null,
                                )
                                .filter((id): id is string => Boolean(id))
                            : [],
                        );
                        setNewsContentHtml(item.content);
                        setNewsTab("create");
                      }}
                      className="font-minecraft text-[10px] h-8"
                    >
                      Edit
                    </ButtonShadcn>
                    <ButtonShadcn
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteNews(item.id)}
                      className="font-minecraft text-[10px] h-8"
                    >
                      Delete
                    </ButtonShadcn>
                  </div>
                </div>
              ))}
              {newsRows.length === 0 && !isLoadingNews && (
                <div className="text-center text-theme-muted py-10 font-minecraft">
                  Новости не найдены по вашим критериям.
                </div>
              )}
              <div ref={newsEndRef} className="h-4 w-full" />
              {isLoadingMoreNews && (
                <div className="py-4 text-center font-minecraft text-xs text-theme-muted">
                  Загрузка новостей...
                </div>
              )}
            </div>
          </div>
          )}

          {newsTab === "create" && (
          <ShadcnCard className="border-white/10 bg-black/10">
            <ShadcnCardHeader>
              <ShadcnCardTitle className="font-minecraft text-sm uppercase tracking-wider text-theme">
                {editingNews ? "Редактирование новости" : "Создание новости"}
              </ShadcnCardTitle>
            </ShadcnCardHeader>
            <ShadcnCardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <ShadcnLabel className="font-minecraft text-xs uppercase text-theme-muted">Заголовок</ShadcnLabel>
                  <ShadcnInput value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="Моё обновление" />
                </div>
                <div className="space-y-2">
                  <ShadcnLabel className="font-minecraft text-xs uppercase text-theme-muted">Слаг (URL)</ShadcnLabel>
                  <ShadcnInput value={newsSlug} onChange={(e) => setNewsSlug(e.target.value)} placeholder="my-update" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <ShadcnLabel className="font-minecraft text-xs uppercase text-theme-muted">Изображение (URL)</ShadcnLabel>
                  <ShadcnInput value={newsImage} onChange={(e) => setNewsImage(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <ShadcnLabel className="font-minecraft text-xs uppercase text-theme-muted">Теги</ShadcnLabel>
                  <div className="relative">
                    <ButtonShadcn
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                    >
                      <span>{selectedNewsTagIds.length > 0 ? `Выбрано: ${selectedNewsTagIds.length}` : "Выбрать теги"}</span>
                      <span className="text-xs">{isTagDropdownOpen ? "▲" : "▼"}</span>
                    </ButtonShadcn>
                    {isTagDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-md border border-white/10 bg-black/95 p-2 shadow-xl">
                        <ShadcnInput
                          placeholder="Поиск тега..."
                          value={tagSearchQuery}
                          onChange={(e) => setTagSearchQuery(e.target.value)}
                          className="mb-2 h-8"
                        />
                        <div className="max-h-44 space-y-1 overflow-y-auto">
                          {newsTags
                            .filter((tag) =>
                              tag.name.toLowerCase().includes(tagSearchQuery.trim().toLowerCase()),
                            )
                            .map((tag) => {
                              const selected = selectedNewsTagIds.includes(tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedNewsTagIds((prev) =>
                                      prev.includes(tag.id)
                                        ? prev.filter((id) => id !== tag.id)
                                        : [...prev, tag.id],
                                    )
                                  }
                                  className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs ${
                                    selected ? "bg-theme/20 text-theme" : "text-theme-muted hover:bg-white/10"
                                  }`}
                                >
                                  <span>{tag.name}</span>
                                  {selected && <span>✓</span>}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNewsTagIds.map((id) => {
                      const tagName = newsTags.find((tag) => tag.id === id)?.name ?? id;
                      return (
                        <Badge key={id} variant="secondary">
                          {tagName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <ShadcnLabel className="font-minecraft text-xs uppercase text-theme-muted">Контент (HTML)</ShadcnLabel>
                <div className="min-h-[300px] rounded-md border border-white/10 bg-black/20 p-2">
                  <Editor
                    value={newsContentHtml}
                    onChange={(e: { target: { value: string } }) =>
                      setNewsContentHtml(e.target.value)
                    }
                  >
                    <Toolbar>
                      <BtnBold />
                      <BtnItalic />
                      <BtnUnderline />
                      <BtnStrikeThrough />
                      <Separator />
                      <BtnNumberedList />
                      <BtnBulletList />
                      <Separator />
                      <BtnLink />
                    </Toolbar>
                  </Editor>
                </div>
              </div>

              {newsFormError && <div className="text-red-500 font-minecraft text-sm">{newsFormError}</div>}

              <div className="flex justify-end gap-2">
                <ButtonShadcn variant="secondary" onClick={() => setNewsTab("all")}>Отмена</ButtonShadcn>
                <ButtonShadcn
                  variant="default"
                  onClick={editingNews ? handleUpdateNews : handleCreateNews}
                  disabled={!!newsActionLoadingId}
                >
                  {newsActionLoadingId ? "Сохранение..." : editingNews ? "Обновить" : "Создать"}
                </ButtonShadcn>
              </div>
            </ShadcnCardContent>
          </ShadcnCard>
          )}
          {newsTab === "tags" && (
            <ShadcnCard className="border-white/10 bg-black/10">
              <ShadcnCardHeader>
                <ShadcnCardTitle className="font-minecraft text-sm uppercase tracking-wider text-theme">
                  Управление тегами новостей
                </ShadcnCardTitle>
              </ShadcnCardHeader>
              <ShadcnCardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
                  <ShadcnInput
                    value={newNewsTagName}
                    onChange={(e) => setNewNewsTagName(e.target.value)}
                    placeholder="Новый тег (например: season)"
                  />
                  <ButtonShadcn variant="default" onClick={handleCreateNewsTag} disabled={isAdminApiBusy}>
                    Добавить тег
                  </ButtonShadcn>
                </div>
                {newsTagFormError && <div className="text-red-500 font-minecraft text-sm">{newsTagFormError}</div>}
                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {isLoadingNewsTags && (
                    <div className="font-minecraft text-xs text-theme-muted">Загрузка тегов...</div>
                  )}
                  {!isLoadingNewsTags && filteredNewsTags.length === 0 && (
                    <div className="font-minecraft text-xs text-theme-muted">Теги не найдены.</div>
                  )}
                  {filteredNewsTags.map((tag) => (
                    <div key={tag.id} className="rounded-md border border-white/10 bg-black/20 p-3">
                      {editingTagId === tag.id ? (
                        <div className="flex items-center gap-2">
                          <ShadcnInput
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            className="h-8"
                          />
                          <ButtonShadcn size="sm" onClick={handleUpdateNewsTag}>Сохранить</ButtonShadcn>
                          <ButtonShadcn
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingTagId(null);
                              setEditingTagName("");
                            }}
                          >
                            Отмена
                          </ButtonShadcn>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <Badge variant="outline">{tag.name}</Badge>
                            <span className="truncate text-[10px] text-theme-muted">{tag.id}</span>
                          </div>
                          <div className="flex gap-2">
                            <ButtonShadcn
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTagId(tag.id);
                                setEditingTagName(tag.name);
                              }}
                            >
                              Редактировать
                            </ButtonShadcn>
                            <ButtonShadcn
                              size="sm"
                              variant="destructive"
                              onClick={() => void handleDeleteNewsTag(tag.id)}
                            >
                              Удалить
                            </ButtonShadcn>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ShadcnCardContent>
            </ShadcnCard>
          )}
        </ShadcnCard>
        )}

        {activeTab === "changelog" && (
          <ShadcnCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-minecraft text-xl font-bold">Управление changelog</h2>
              <div className="flex items-center gap-3">
                {isLoadingChangelog && (
                  <div className="flex items-center gap-2 text-theme-muted">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-theme/50 border-t-transparent" />
                    <span className="font-minecraft text-[10px] uppercase">Фильтрация...</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <ButtonShadcn
                    variant={changelogTab === "all" ? "default" : "secondary"}
                    onClick={() => setChangelogTab("all")}
                    className="font-minecraft uppercase text-xs"
                  >
                    Все записи
                  </ButtonShadcn>
                  {!editingChangelog ? (
                    <ButtonShadcn
                      variant={changelogTab === "create" ? "default" : "secondary"}
                      onClick={() => {
                        resetChangelogForm();
                        setChangelogTab("create");
                      }}
                      className="font-minecraft uppercase text-xs"
                    >
                      Создать
                    </ButtonShadcn>
                  ) : (
                    <span className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 font-minecraft text-[10px] uppercase text-amber-300">
                      Режим редактирования
                    </span>
                  )}
                </div>
              </div>
            </div>

            {changelogError && (
              <div className="mb-4 font-minecraft text-sm text-red-500">{changelogError}</div>
            )}

            {changelogTab === "all" && (
            <>
            <div className="mb-6 rounded-lg border border-white/10 bg-black/10 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-minecraft text-[10px] uppercase text-theme-muted">От даты</label>
                  <ShadcnInput
                    type="datetime-local"
                    value={changelogFromDate}
                    onChange={(e) => setChangelogFromDate(e.target.value)}
                    className="h-10 w-full px-2 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block font-minecraft text-[10px] uppercase text-theme-muted">До даты</label>
                  <ShadcnInput
                    type="datetime-local"
                    value={changelogToDate}
                    onChange={(e) => setChangelogToDate(e.target.value)}
                    className="h-10 w-full px-2 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Тип"
                    value={changelogMandatoryDraft}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setChangelogMandatoryDraft(val as ChangelogMandatoryFilter);
                    }}
                    options={[
                      { label: "Все", value: "all" },
                      { label: "Mandatory", value: "mandatory" },
                      { label: "Optional", value: "optional" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Сортировка"
                    value={changelogSortDraft}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setChangelogSortDraft(toChangelogSortBy(val));
                    }}
                    options={[
                      { label: "Release date", value: "releaseDate" },
                      { label: "Version", value: "version" },
                      { label: "Created", value: "createdAt" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <ShadcnSelect
                    label="Порядок"
                    value={changelogOrderDraft}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setChangelogOrderDraft(toNewsOrder(val));
                    }}
                    options={[
                      { label: "Новые", value: "DESC" },
                      { label: "Старые", value: "ASC" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-minecraft text-[10px] uppercase text-theme-muted">
                    Подсказка
                  </div>
                  <div className="rounded border border-white/10 bg-black/20 px-3 py-2 font-minecraft text-[10px] text-theme-muted">
                    Фильтры применяются автоматически с debounce.
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {changelog.map((item) => (
                <div
                  key={item.id}
                  className="rounded border border-white/5 bg-black/20 p-4 transition-colors hover:bg-black/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-minecraft font-bold text-theme">v{item.version}</div>
                    <div className="flex items-center gap-2">
                      {item.mandatory && (
                        <span className="rounded bg-red-500/20 px-2 py-0.5 font-minecraft text-[10px] uppercase text-red-400">
                          Mandatory
                        </span>
                      )}
                      <span className="font-minecraft text-[10px] text-theme-muted">
                        {new Date(item.releaseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ul className="mb-3 list-disc space-y-1 pl-5 font-minecraft text-xs text-theme-muted">
                    {stringifyChangelogChanges(item.changes)
                      .split("\n")
                      .filter(Boolean)
                      .map((change, idx) => (
                        <li key={`${item.id}-change-${idx}`}>{change}</li>
                      ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="font-minecraft text-[10px] text-[var(--mc-accent)] underline"
                      onClick={() => void window.electronAPI.system.openExternal(item.downloadUrl)}
                    >
                      Скачать релиз
                    </button>
                    <div className="flex gap-2">
                      <ButtonShadcn
                        variant="outline"
                        size="sm"
                        disabled={isAdminApiBusy}
                        onClick={() => {
                          setEditingChangelog(item);
                          setChangelogVersion(item.version);
                          setChangelogReleaseDate(item.releaseDate.slice(0, 10));
                          setChangelogDownloadUrl(item.downloadUrl);
                          setChangelogChangesInput(stringifyChangelogChanges(item.changes));
                          setChangelogMandatory(item.mandatory);
                          setChangelogTab("create");
                        }}
                      >
                        Edit
                      </ButtonShadcn>
                      <ButtonShadcn
                        variant="destructive"
                        size="sm"
                        disabled={isAdminApiBusy}
                        onClick={() => deleteChangelog(item.id)}
                      >
                        Delete
                      </ButtonShadcn>
                    </div>
                  </div>
                </div>
              ))}
              {changelog.length === 0 && !isLoadingChangelog && (
                <div className="py-10 text-center font-minecraft text-theme-muted">
                  Changelog записи не найдены.
                </div>
              )}
            </div>
            </>
            )}
            {changelogTab === "create" && (
              <div className="mb-6 space-y-4 rounded-lg border border-white/10 bg-black/10 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-minecraft text-xs uppercase text-theme-muted">Версия</label>
                    <ShadcnInput
                      value={changelogVersion}
                      onChange={(e) => setChangelogVersion(e.target.value)}
                      placeholder="1.4.2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-minecraft text-xs uppercase text-theme-muted">Release date</label>
                    <ShadcnInput
                      type="date"
                      value={changelogReleaseDate}
                      onChange={(e) => setChangelogReleaseDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-minecraft text-xs uppercase text-theme-muted">Download URL</label>
                    <ShadcnInput
                      value={changelogDownloadUrl}
                      onChange={(e) => setChangelogDownloadUrl(e.target.value)}
                      placeholder="https://downloads.example.com/release.zip"
                    />
                  </div>
                  <div className="flex items-end">
                    <ShadcnCheckbox
                      label="Mandatory update"
                      checked={changelogMandatory}
                      onChange={() => setChangelogMandatory((prev) => !prev)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-minecraft text-xs uppercase text-theme-muted">
                    Changes (каждая строка - отдельный пункт)
                  </label>
                  <textarea
                    value={changelogChangesInput}
                    onChange={(e) => setChangelogChangesInput(e.target.value)}
                    className="min-h-[120px] w-full rounded border border-white/10 bg-black/20 p-3 font-minecraft text-xs text-theme outline-none focus:border-theme/50"
                    placeholder={"Added server browser\nFixed auth refresh"}
                  />
                </div>
                {changelogFormError && (
                  <div className="font-minecraft text-sm text-red-500">{changelogFormError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <ButtonShadcn
                    variant="secondary"
                    onClick={() => {
                      resetChangelogForm();
                      setChangelogTab("all");
                    }}
                  >
                    Отмена
                  </ButtonShadcn>
                  <ButtonShadcn
                    variant="default"
                    onClick={editingChangelog ? handleUpdateChangelog : handleCreateChangelog}
                    disabled={!!changelogActionLoadingId}
                  >
                    {changelogActionLoadingId
                      ? "Сохранение..."
                      : editingChangelog
                        ? "Обновить"
                        : "Создать"}
                  </ButtonShadcn>
                </div>
              </div>
            )}
          </ShadcnCard>
        )}
      </div>

      <ShadcnDialog
        open={banModalOpen}
        onOpenChange={setBanModalOpen}
        title={`Ban User: ${selectedUser?.username}`}
        footer={
          <>
            <ButtonShadcn variant="secondary" onClick={() => setBanModalOpen(false)} disabled={isAdminApiBusy}>Cancel</ButtonShadcn>
            <ButtonShadcn variant="destructive" onClick={executeBan} disabled={isAdminApiBusy}>Confirm Ban</ButtonShadcn>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-theme-muted">Provide a reason for banning this user.</p>
          <ShadcnInput
            placeholder="Reason..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
          {actionError && <div className="text-red-500 text-sm">{actionError}</div>}
        </div>
      </ShadcnDialog>

      <ShadcnDialog
        open={unbanModalOpen}
        onOpenChange={setUnbanModalOpen}
        title={`Unban User: ${selectedUser?.username}`}
        footer={
          <>
            <ButtonShadcn variant="secondary" onClick={() => setUnbanModalOpen(false)} disabled={isAdminApiBusy}>Cancel</ButtonShadcn>
            <ButtonShadcn variant="default" onClick={executeUnban} disabled={isAdminApiBusy}>Confirm Unban</ButtonShadcn>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-theme-muted">Are you sure you want to unban this user?</p>
          {actionError && <div className="text-red-500 text-sm">{actionError}</div>}
        </div>
      </ShadcnDialog>

      <ShadcnDialog
        open={rolesModalOpen}
        onOpenChange={setRolesModalOpen}
        title={`Manage Roles: ${selectedUser?.username}`}
        footer={
          <>
            <ButtonShadcn variant="secondary" onClick={() => setRolesModalOpen(false)} disabled={isAdminApiBusy}>Cancel</ButtonShadcn>
            <ButtonShadcn variant="default" onClick={executeRolesUpdate} disabled={isAdminApiBusy}>Save Roles</ButtonShadcn>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded border border-white/10 bg-black/10 p-3">
            <ShadcnInput
              placeholder="Поиск роли по имени или описанию..."
              value={roleSearchQuery}
              onChange={(e) => setRoleSearchQuery(e.target.value)}
            />
            <div className="mt-2 font-minecraft text-[10px] uppercase text-theme-muted">
              Выбрано ролей: {selectedRoles.length}
            </div>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filteredAvailableRoles.map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              return (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`w-full rounded border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-theme bg-theme/10"
                      : "border-white/10 bg-black/20 hover:bg-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-minecraft text-xs uppercase text-theme">{role.name}</div>
                    <div
                      className={`font-minecraft text-[10px] uppercase ${
                        isSelected ? "text-theme" : "text-theme-muted"
                      }`}
                    >
                      {isSelected ? "selected" : "not selected"}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-theme-muted">
                    {role.description?.trim() || "Описание роли не задано"}
                  </div>
                </button>
              );
            })}
            {filteredAvailableRoles.length === 0 && (
              <div className="rounded border border-white/10 bg-black/20 px-3 py-4 text-center font-minecraft text-xs text-theme-muted">
                Роли не найдены
              </div>
            )}
          </div>
          {actionError && <div className="text-red-500 text-sm">{actionError}</div>}
        </div>
      </ShadcnDialog>
    </div>
  );
}


