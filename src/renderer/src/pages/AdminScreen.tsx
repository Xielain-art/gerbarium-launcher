import { useAdminPage } from "../hooks/useAdminPage";
import { WindowControls } from "../components";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Button as ButtonShadcn } from "@/components/shadcn/ui";
import { Input, Select, Checkbox, Card, Button, Modal, ModalActions } from "../components";
import { useAdminNewsStore } from "../stores/useAdminNewsStore";
import type { ApiNews } from "../../../lib/api/news";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../../../shared/constants/system";

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
    t,
  } = vm;

  const [activeTab, setActiveTab] = useState<"users" | "news">("users");
  const [newsTab, setNewsTab] = useState<"all" | "create">("all");
  const [newsSearch, setNewsSearch] = useState("");
  const [newsTag, setNewsTag] = useState("");
  const [newsFromDate, setNewsFromDate] = useState("");
  const [newsToDate, setNewsToDate] = useState("");

  const [editingNews, setEditingNews] = useState<ApiNews | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSlug, setNewsSlug] = useState("");
  const [newsImage, setNewsImage] = useState("");
  const [newsTagsInput, setNewsTagsInput] = useState("");
  const [newsContentHtml, setNewsContentHtml] = useState("");
  const [newsFormError, setNewsFormError] = useState<string | null>(null);

  const {
    news,
    isLoading: isLoadingNews,
    isLoadingMore: isLoadingMoreNews,
    hasMore: hasMoreNews,
    actionLoadingId: newsActionLoadingId,
    error: newsError,
    sortBy: newsSortBy,
    order: newsOrder,
    setFilters: setNewsFilters,
    fetchNews,
    fetchMoreNews,
    createNews,
    updateNews,
    deleteNews,
  } = useAdminNewsStore();

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

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  // Debounced news search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setNewsFilters({ 
        search: newsSearch, 
        tag: newsTag,
        fromDate: newsFromDate ? new Date(newsFromDate).toISOString() : undefined,
        toDate: newsToDate ? new Date(newsToDate).toISOString() : undefined
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [newsSearch, newsTag, newsFromDate, newsToDate, setNewsFilters]);

  const handleCreateNews = async () => {
    setNewsFormError(null);
    if (!newsTitle || !newsSlug || !newsContentHtml) {
      setNewsFormError("Title, slug and content are required");
      return;
    }
    const success = await createNews({
      title: newsTitle,
      slug: newsSlug,
      content: newsContentHtml,
      image: newsImage || undefined,
      tags: newsTagsInput ? (newsTagsInput.split(",").map((t) => t.trim()) as any) : undefined,
    });
    if (success) {
      setNewsTab("all");
      resetNewsForm();
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;
    setNewsFormError(null);
    const success = await updateNews(editingNews.id, {
      title: newsTitle,
      slug: newsSlug,
      content: newsContentHtml,
      image: newsImage || undefined,
      tags: newsTagsInput ? (newsTagsInput.split(",").map((t) => t.trim()) as any) : undefined,
    });
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
    setNewsTagsInput("");
    setNewsContentHtml("");
    setNewsFormError(null);
  };

  const newsRows = useMemo(() => news, [news]);

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

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 relative z-10">
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
        </div>

        {activeTab === "users" && (
        <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-minecraft text-xl font-bold">
                {t.ADMIN.USERS_TITLE}
              </h2>
              <Button
                variant="minecraft"
                onClick={() => fetchUsers()}
                disabled={isLoading}
              >
                {isLoading ? t.ADMIN.LOADING : t.ADMIN.REFRESH}
              </Button>
            </div>

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block font-minecraft text-[10px] uppercase text-theme-muted">Поиск пользователей</label>
                <Input
                  placeholder="Логин или Email..."
                  value={userSearch}
                  onChange={(e) => setUserFilters({ search: e.target.value })}
                  className="w-full h-10"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="mb-1.5 block font-minecraft text-[10px] uppercase text-theme-muted">Роль (admin, user...)</label>
                <Input
                  placeholder="Все"
                  value={userRole || ""}
                  onChange={(e) => setUserFilters({ role: e.target.value === "" ? undefined : (e.target.value as any) })}
                  className="w-full h-10"
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  label="Статус"
                  value={userBanned === undefined ? "all" : userBanned ? "banned" : "active"}
                  onChange={(e) => {
                    const val = typeof e === "string" ? e : e.target.value;
                    setUserFilters({ banned: val === "all" ? undefined : val === "banned" });
                  }}
                  options={[
                    { label: "Все", value: "all" },
                    { label: "Бан", value: "banned" },
                    { label: "Ок", value: "active" },
                  ]}
                />
              </div>
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
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className="rounded bg-theme/10 px-1.5 py-0.5 font-minecraft text-[10px] font-bold text-theme-muted uppercase"
                          >
                            {r}
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
        </Card>
        )}

        {activeTab === "news" && (
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-minecraft text-xl font-bold">Управление новостями</h2>
            <div className="flex gap-2">
              <ButtonShadcn
                variant={newsTab === "all" ? "default" : "secondary"}
                onClick={() => setNewsTab("all")}
                className="font-minecraft uppercase text-xs"
              >
                Все новости
              </ButtonShadcn>
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
            </div>
          </div>

          {newsTab === "all" && (
          <div className="grid gap-3">
            <div className="mb-6 space-y-4 rounded-lg bg-black/10 p-4 border border-white/5">
              {/* Row 1: Search and Tag */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-[2]">
                  <label className="mb-1.5 block font-minecraft text-[10px] uppercase text-theme-muted">Поиск по контенту</label>
                  <Input
                    placeholder="Название или часть текста..."
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block font-minecraft text-[10px] uppercase text-theme-muted">Тег</label>
                  <Input
                    placeholder=" survival..."
                    value={newsTag}
                    onChange={(e) => setNewsTag(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>

              {/* Row 2: Dates and Sorting */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block font-minecraft text-[10px] uppercase text-theme-muted">От даты</label>
                  <Input
                    type="datetime-local"
                    value={newsFromDate}
                    onChange={(e) => setNewsFromDate(e.target.value)}
                    className="h-10 text-xs px-2 w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block font-minecraft text-[10px] uppercase text-theme-muted">До даты</label>
                  <Input
                    type="datetime-local"
                    value={newsToDate}
                    onChange={(e) => setNewsToDate(e.target.value)}
                    className="h-10 text-xs px-2 w-full"
                  />
                </div>
                <div className="flex-1">
                  <Select
                    label="Сортировка"
                    value={newsSortBy}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setNewsFilters({ sortBy: val as any });
                    }}
                    options={[
                      { label: "По созданию", value: "createdAt" },
                      { label: "По обновлению", value: "updatedAt" },
                      { label: "По названию", value: "title" },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    label="Порядок"
                    value={newsOrder}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : e.target.value;
                      setNewsFilters({ order: val as any });
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
                        setNewsTagsInput(item.tags?.join(", ") || "");
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-minecraft text-xs uppercase text-theme-muted">Заголовок</label>
                <Input value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="Моё обновление" />
              </div>
              <div className="space-y-2">
                <label className="font-minecraft text-xs uppercase text-theme-muted">Слаг (URL)</label>
                <Input value={newsSlug} onChange={(e) => setNewsSlug(e.target.value)} placeholder="my-update" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-minecraft text-xs uppercase text-theme-muted">Изображение (URL)</label>
                <Input value={newsImage} onChange={(e) => setNewsImage(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="font-minecraft text-xs uppercase text-theme-muted">Теги (через запятую)</label>
                <Input value={newsTagsInput} onChange={(e) => setNewsTagsInput(e.target.value)} placeholder="update, fabric, event" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-minecraft text-xs uppercase text-theme-muted">Контент (HTML)</label>
              <div className="min-h-[300px] rounded border border-white/10 bg-black/20 p-2">
                <Editor value={newsContentHtml} onChange={(e) => setNewsContentHtml(e.target.value)}>
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
          </div>
          )}
        </Card>
        )}
      </div>

      <Modal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title={`Ban User: ${selectedUser?.username}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-theme-muted">Provide a reason for banning this user.</p>
          <Input
            placeholder="Reason..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
          {actionError && <div className="text-red-500 text-sm">{actionError}</div>}
        </div>
        <ModalActions>
          <Button variant="secondary" onClick={() => setBanModalOpen(false)}>Cancel</Button>
          <Button variant="minecraft" onClick={executeBan}>Confirm Ban</Button>
        </ModalActions>
      </Modal>

      <Modal
        isOpen={unbanModalOpen}
        onClose={() => setUnbanModalOpen(false)}
        title={`Unban User: ${selectedUser?.username}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-theme-muted">Are you sure you want to unban this user?</p>
          {actionError && <div className="text-red-500 text-sm">{actionError}</div>}
        </div>
        <ModalActions>
          <Button variant="secondary" onClick={() => setUnbanModalOpen(false)}>Cancel</Button>
          <Button variant="minecraft" onClick={executeUnban}>Confirm Unban</Button>
        </ModalActions>
      </Modal>

      <Modal
        isOpen={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        title={`Manage Roles: ${selectedUser?.username}`}
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            {availableRoles.map((role) => (
                <Checkbox
                  key={role}
                  label={role.toUpperCase()}
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
            ))}
          </div>
          {actionError && <div className="text-red-500 text-sm">{actionError}</div>}
        </div>
        <ModalActions>
          <Button variant="secondary" onClick={() => setRolesModalOpen(false)}>Cancel</Button>
          <Button variant="minecraft" onClick={executeRolesUpdate}>Save Roles</Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
