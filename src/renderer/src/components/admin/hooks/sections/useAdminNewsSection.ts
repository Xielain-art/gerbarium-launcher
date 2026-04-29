import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ApiCreateNewsDto, ApiNews, ApiUpdateNewsDto } from "../../../../../../lib/api/news";
import { useAdminNewsMutations, useAdminNewsQuery, useAdminNewsTagsQuery } from "../../../../hooks/queries/useAdminQueries";
import { getErrorMessage } from "../../../../lib/queryHelpers";
import { ADMIN_TOASTS } from "./adminToasts";
import { createNewsSchema, updateNewsSchema, newsTagSchema } from "../../../../lib/validation/newsValidation";
import { ZodError } from "zod";
import { useNewsFormValidation, useNewsTagValidation } from "../../../../lib/validation/useNewsFormValidation";

type NewsSortBy = "createdAt" | "updatedAt" | "title";
type NewsOrder = "ASC" | "DESC";

const toNewsSortBy = (v: string): NewsSortBy => (v === "updatedAt" || v === "title" ? v : "createdAt");
const toNewsOrder = (v: string): NewsOrder => (v === "ASC" ? "ASC" : "DESC");

const toApiCreateNewsPayload = (payload: { title: string; slug: string; content: string; image?: string; tagIds?: string[] }): ApiCreateNewsDto => ({ ...payload, tagIds: payload.tagIds });
const toApiUpdateNewsPayload = (payload: { title?: string; slug?: string; content?: string; image?: string; tagIds?: string[] }): ApiUpdateNewsDto => ({ ...payload, tagIds: payload.tagIds });

export function useAdminNewsSection(activeTab: string, scrollRef: React.RefObject<HTMLDivElement | null>, newsEndRef: React.RefObject<HTMLDivElement | null>) {
  const [newsTab, setNewsTab] = useState<"all" | "create" | "tags">("all");
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
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [appliedNewsFilters, setAppliedNewsFilters] = useState({ sortBy: "createdAt" as NewsSortBy, order: "DESC" as NewsOrder, search: undefined as string | undefined, tagId: undefined as string | undefined, fromDate: undefined as string | undefined, toDate: undefined as string | undefined });

  const newsQuery = useAdminNewsQuery(appliedNewsFilters);
  const newsTagsQuery = useAdminNewsTagsQuery();
  const newsMutations = useAdminNewsMutations(appliedNewsFilters);

  const news = useMemo(() => newsQuery.data?.items ?? [], [newsQuery.data]);
  const newsTags = useMemo<Array<{ id: string; name: string }>>(() => newsTagsQuery.data ?? [], [newsTagsQuery.data]);
  const filteredNewsTags = useMemo(() => newsTags, [newsTags]);

  const newsFormValidation = useNewsFormValidation(newsTitle, newsSlug, newsContentHtml, newsImage);
  const newsTagValidation = useNewsTagValidation(newNewsTagName.trim());

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedNewsFilters((prev) => ({ ...prev, search: newsSearch || undefined, tagId: newsTag || undefined, fromDate: newsFromDate ? new Date(newsFromDate).toISOString() : undefined, toDate: newsToDate ? new Date(newsToDate).toISOString() : undefined, sortBy: newsSortDraft, order: newsOrderDraft }));
    }, 450);
    return () => clearTimeout(t);
  }, [newsSearch, newsTag, newsFromDate, newsToDate, newsSortDraft, newsOrderDraft]);

  useEffect(() => {
    if (activeTab !== "news" || newsTab !== "all" || !newsQuery.hasNextPage || newsQuery.isLoading || newsQuery.isFetchingNextPage) return;
    const target = newsEndRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) void newsQuery.fetchNextPage();
    }, { root: scrollRef.current, rootMargin: "0px 0px 400px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, newsTab, newsQuery.hasNextPage, newsQuery.isLoading, newsQuery.isFetchingNextPage, newsQuery.fetchNextPage, newsEndRef, scrollRef]);

  const resetNewsForm = () => { setEditingNews(null); setNewsTitle(""); setNewsSlug(""); setNewsImage(""); setSelectedNewsTagIds([]); setNewNewsTagName(""); setNewsTagFormError(null); setNewsContentHtml(""); setNewsFormError(null); newsFormValidation.resetTouched(); newsTagValidation.resetTouched(); };
  const startEditNews = (item: ApiNews) => { setEditingNews(item); setNewsTitle(item.title); setNewsSlug(item.slug); setNewsImage(item.image || ""); setSelectedNewsTagIds(Array.isArray(item.tags) ? item.tags.map((tag: { id: string }) => tag.id).filter(Boolean) : []); setNewsContentHtml(item.content); setNewsTab("create"); };

  const handleCreateNews = async () => {
    try {
      const validatedData = createNewsSchema.parse({
        title: newsTitle,
        slug: newsSlug,
        content: newsContentHtml,
        image: newsImage || undefined,
        tagIds: selectedNewsTagIds,
      });
      await newsMutations.createNews.mutateAsync(toApiCreateNewsPayload(validatedData));
      setNewsTab("all");
      resetNewsForm();
      toast.success(ADMIN_TOASTS.newsCreated);
    } catch (error) {
      if (error instanceof ZodError) {
        setNewsFormError(error.issues[0].message);
      } else {
        const msg = getErrorMessage(error, ADMIN_TOASTS.newsCreateError);
        setNewsFormError(msg);
        toast.error(msg);
      }
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;
    try {
      const validatedData = updateNewsSchema.parse({
        title: newsTitle,
        slug: newsSlug,
        content: newsContentHtml,
        image: newsImage || undefined,
        tagIds: selectedNewsTagIds,
      });
      await newsMutations.updateNews.mutateAsync({ newsId: editingNews.id, payload: toApiUpdateNewsPayload(validatedData) });
      setNewsTab("all");
      resetNewsForm();
      toast.success(ADMIN_TOASTS.newsUpdated);
    } catch (error) {
      if (error instanceof ZodError) {
        setNewsFormError(error.issues[0].message);
      } else {
        const msg = getErrorMessage(error, ADMIN_TOASTS.newsUpdateError);
        setNewsFormError(msg);
        toast.error(msg);
      }
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    try {
      await newsMutations.deleteNews.mutateAsync(newsId);
      toast.success(ADMIN_TOASTS.newsDeleted);
    } catch (error) {
      const msg = getErrorMessage(error, ADMIN_TOASTS.newsDeleteError);
      toast.error(msg);
    }
  };

  const handleCreateNewsTag = async () => {
    try {
      const validatedData = newsTagSchema.parse({ name: newNewsTagName.trim() });
      const res = await newsMutations.createNewsTag.mutateAsync(validatedData);
      const createdTagId = res.data?.id;
      if (!createdTagId) throw new Error("Tag id missing");
      setSelectedNewsTagIds((prev) => (prev.includes(createdTagId) ? prev : [...prev, createdTagId]));
      setNewNewsTagName("");
      setNewsTagFormError(null);
      toast.success(ADMIN_TOASTS.tagCreated);
    } catch (error) {
      if (error instanceof ZodError) {
        setNewsTagFormError(error.issues[0].message);
      } else {
        const msg = getErrorMessage(error, "Failed to create news tag");
        setNewsTagFormError(msg);
        toast.error(msg);
      }
    }
  };

  const handleUpdateNewsTag = async () => {
    if (!editingTagId) return;
    try {
      const validatedData = newsTagSchema.parse({ name: editingTagName.trim() });
      await newsMutations.updateNewsTag.mutateAsync({ tagId: editingTagId, payload: validatedData });
      setEditingTagId(null);
      setEditingTagName("");
      setNewsTagFormError(null);
      toast.success(ADMIN_TOASTS.tagUpdated);
    } catch (error) {
      if (error instanceof ZodError) {
        setNewsTagFormError(error.issues[0].message);
      } else {
        const msg = getErrorMessage(error, "Failed to update news tag");
        setNewsTagFormError(msg);
        toast.error(msg);
      }
    }
  };

  const handleDeleteNewsTag = async (tagId: string) => { try { await newsMutations.deleteNewsTag.mutateAsync(tagId); setSelectedNewsTagIds((prev) => prev.filter((id) => id !== tagId)); if (newsTag === tagId) setNewsTag(""); toast.success(ADMIN_TOASTS.tagDeleted); } catch (error) { const msg = getErrorMessage(error, "Failed to delete news tag"); setNewsTagFormError(msg); toast.error(msg); } };

  return {
    newsTab, setNewsTab, 
    newsFormValidation: {
      ...newsFormValidation,
      handleBlur: newsFormValidation.handleBlur,
    },
    newsTagValidation: {
      ...newsTagValidation,
      handleBlur: newsTagValidation.handleBlur,
    },
    newsSearch, setNewsSearch, newsTag, setNewsTag, newsFromDate, setNewsFromDate, newsToDate, setNewsToDate,
    newsSortDraft, setNewsSortDraft: (v: string) => setNewsSortDraft(toNewsSortBy(v)), newsOrderDraft, setNewsOrderDraft: (v: string) => setNewsOrderDraft(toNewsOrder(v)),
    editingNews, newsTitle, setNewsTitle, newsSlug, setNewsSlug, newsImage, setNewsImage, selectedNewsTagIds, setSelectedNewsTagIds, newNewsTagName, setNewNewsTagName, newsContentHtml, setNewsContentHtml, newsFormError, newsTagFormError, editingTagId, setEditingTagId, editingTagName, setEditingTagName,
    news, newsTags, filteredNewsTags,
    isLoadingNews: newsQuery.isLoading, isLoadingMoreNews: newsQuery.isFetchingNextPage, isLoadingNewsTags: newsTagsQuery.isLoading,
    isApplyingNewsFilters: activeTab === "news" && newsTab === "all" && newsQuery.isLoading,
    isNewsBusy: newsMutations.createNews.isPending || newsMutations.updateNews.isPending || newsMutations.deleteNews.isPending || newsMutations.createNewsTag.isPending || newsMutations.updateNewsTag.isPending || newsMutations.deleteNewsTag.isPending,
    resetNewsForm, startEditNews, handleCreateNews, handleUpdateNews, handleDeleteNews, handleCreateNewsTag, handleUpdateNewsTag, handleDeleteNewsTag,
  };
}