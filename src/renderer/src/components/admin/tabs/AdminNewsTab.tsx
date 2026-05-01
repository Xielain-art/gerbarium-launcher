import {
  Button as ShadcnButton,
  Card as ShadcnCard,
  Input as ShadcnInput,
  MultiSelect,
  Select as ShadcnSelect,
} from "@/components/shadcn/ui";
import MDEditor from "@uiw/react-md-editor";
import type { ApiNews } from "../../../../../lib/api/news";
import { cn } from "@/lib/utils";

interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

interface Props {
  newsFormValidation: {
    titleValidation: FieldValidation;
    slugValidation: FieldValidation;
    contentValidation: FieldValidation;
    imageValidation: FieldValidation;
    isFormValid: boolean;
    handleBlur: (field: "title" | "slug" | "content" | "image") => void;
  };
  newsTagValidation: FieldValidation & { handleBlur: () => void };
  newsTab: "all" | "create" | "tags";
  setNewsTab: (v: "all" | "create" | "tags") => void;
  isApplyingNewsFilters: boolean;
  newsRows: ApiNews[];
  newsTags: Array<{ id: string; name: string }>;
  isLoadingNews: boolean;
  isLoadingMoreNews: boolean;
  newsEndRef: React.RefObject<HTMLDivElement | null>;
  newsSearch: string;
  setNewsSearch: (v: string) => void;
  newsTag: string;
  setNewsTag: (v: string) => void;
  newsSortDraft: string;
  setNewsSortDraft: (v: string) => void;
  newsOrderDraft: string;
  setNewsOrderDraft: (v: string) => void;
  newsFromDate: string;
  setNewsFromDate: (v: string) => void;
  newsToDate: string;
  setNewsToDate: (v: string) => void;
  editingNews: ApiNews | null;
  resetNewsForm: () => void;
  startEditNews: (n: ApiNews) => void;
  handleDeleteNews: (id: string) => void;
  newsTitle: string;
  setNewsTitle: (v: string) => void;
  newsSlug: string;
  setNewsSlug: (v: string) => void;
  newsImage: string;
  setNewsImage: (v: string) => void;
  newsContentHtml: string;
  setNewsContentHtml: (v: string) => void;
  selectedNewsTagIds: string[];
  setSelectedNewsTagIds: (v: string[]) => void;
  newNewsTagName: string;
  setNewNewsTagName: (v: string) => void;
  newsFormError: string | null;
  newsActionLoadingId: string | null;
  handleCreateNews: () => void;
  handleUpdateNews: () => void;
  filteredNewsTags: Array<{ id: string; name: string }>;
  isLoadingNewsTags: boolean;
  editingTagId: string | null;
  setEditingTagId: (v: string | null) => void;
  editingTagName: string;
  setEditingTagName: (v: string) => void;
  handleCreateNewsTag: () => void;
  handleUpdateNewsTag: () => void;
  handleDeleteNewsTag: (id: string) => void;
  isAdminApiBusy: boolean;
  newsTagFormError: string | null;
}

export function AdminNewsTab(props: Props): React.JSX.Element {
  const {
    newsFormValidation,
    newsTagValidation,
    newsTab,
    setNewsTab,
    isApplyingNewsFilters,
    newsRows,
    newsTags,
    isLoadingNews,
    isLoadingMoreNews,
    newsEndRef,
    newsSearch,
    setNewsSearch,
    newsTag,
    setNewsTag,
    newsSortDraft,
    setNewsSortDraft,
    newsOrderDraft,
    setNewsOrderDraft,
    newsFromDate,
    setNewsFromDate,
    newsToDate,
    setNewsToDate,
    editingNews,
    resetNewsForm,
    startEditNews,
    handleDeleteNews,
    newsTitle,
    setNewsTitle,
    newsSlug,
    setNewsSlug,
    newsImage,
    setNewsImage,
    newsContentHtml,
    setNewsContentHtml,
    selectedNewsTagIds,
    setSelectedNewsTagIds,
    newNewsTagName,
    setNewNewsTagName,
    newsFormError,
    newsActionLoadingId,
    handleCreateNews,
    handleUpdateNews,
    filteredNewsTags,
    isLoadingNewsTags,
    editingTagId,
    setEditingTagId,
    editingTagName,
    setEditingTagName,
    handleCreateNewsTag,
    handleUpdateNewsTag,
    handleDeleteNewsTag,
    isAdminApiBusy,
    newsTagFormError,
  } = props;

  const hasUnsavedChanges =
    newsTab === "create" &&
    (newsTitle ||
      newsSlug ||
      newsImage ||
      newsContentHtml ||
      selectedNewsTagIds.length > 0);

  function handleTabSwitch(tab: "all" | "create" | "tags"): void {
    if (tab === "create" && newsTab !== "create") {
      resetNewsForm();
    }
    setNewsTab(tab);
  }

  return (
    <ShadcnCard className="p-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-minecraft text-xl font-bold">
            Управление новостями
          </h2>
          {isApplyingNewsFilters && (
            <span className="font-minecraft text-[10px] uppercase text-theme-muted">
              Фильтрация...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <ShadcnButton
            variant={newsTab === "all" ? "default" : "ghost"}
            onClick={() => handleTabSwitch("all")}
            disabled={newsTab === "create" && hasUnsavedChanges}
            size="sm"
          >
            Все новости
          </ShadcnButton>
          <ShadcnButton
            variant={newsTab === "tags" ? "default" : "ghost"}
            onClick={() => handleTabSwitch("tags")}
            disabled={newsTab === "create" && hasUnsavedChanges}
            size="sm"
          >
            Теги
          </ShadcnButton>
          <div className="ml-auto">
            <ShadcnButton
              variant="outline"
              onClick={() => handleTabSwitch("create")}
              size="sm"
              className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
            >
              {editingNews ? "Редактировать новость" : "Создать новость"}
            </ShadcnButton>
          </div>
        </div>
      </div>

      {newsTab === "all" && (
        <>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnInput
              label="Поиск"
              placeholder="Поиск по содержанию"
              value={newsSearch}
              onChange={(e) => setNewsSearch(e.target.value)}
            />
            <ShadcnSelect
              label="Тег"
              value={newsTag}
              onChange={(e) =>
                setNewsTag(typeof e === "string" ? e : e.target.value)
              }
              options={[
                { label: "Все теги", value: "" },
                ...newsTags.map((tag) => ({ label: tag.name, value: tag.id })),
              ]}
            />
            <ShadcnSelect
              label="Сортировка"
              value={newsSortDraft}
              onChange={(e) =>
                setNewsSortDraft(typeof e === "string" ? e : e.target.value)
              }
              options={[
                { label: "Дата создания", value: "createdAt" },
                { label: "Дата обновления", value: "updatedAt" },
                { label: "Заголовок", value: "title" },
              ]}
            />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnInput
              label="От даты"
              type="date"
              value={newsFromDate}
              onChange={(e) => setNewsFromDate(e.target.value)}
            />
            <ShadcnInput
              label="До даты"
              type="date"
              value={newsToDate}
              onChange={(e) => setNewsToDate(e.target.value)}
            />
            <ShadcnSelect
              label="Порядок"
              value={newsOrderDraft}
              onChange={(e) =>
                setNewsOrderDraft(typeof e === "string" ? e : e.target.value)
              }
              options={[
                { label: "По убыванию", value: "DESC" },
                { label: "По возрастанию", value: "ASC" },
              ]}
            />
          </div>
          {isLoadingNews && (
            <div className="font-minecraft text-xs text-theme-muted">
              Загрузка новостей...
            </div>
          )}
          <div className="space-y-3">
            {newsRows.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded border border-white/10 bg-black/20 p-3"
              >
                <div className="flex-1">
                  <div className="mb-1 font-minecraft text-sm font-bold">
                    {item.title}
                  </div>
                  <div className="font-minecraft text-[10px] text-theme-muted">
                    {item.slug}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.tags.map((tag: { id: string; name: string }) => (
                        <span
                          key={tag.id}
                          className="rounded bg-theme/20 px-1 py-0.5 font-minecraft text-[9px]"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <ShadcnButton
                    size="sm"
                    variant="outline"
                    onClick={() => startEditNews(item)}
                  >
                    Редактировать
                  </ShadcnButton>
                  <ShadcnButton
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteNews(item.id)}
                    disabled={newsActionLoadingId === item.id}
                  >
                    Удалить
                  </ShadcnButton>
                </div>
              </div>
            ))}
            <div ref={newsEndRef} className="h-4" />
            {isLoadingMoreNews && (
              <div className="font-minecraft text-xs text-theme-muted">
                Загрузка...
              </div>
            )}
          </div>
        </>
      )}

      {newsTab === "create" && (
        <div className="space-y-4">
          <div className="rounded border border-white/10 bg-black/10 p-4">
            <h3 className="mb-4 font-minecraft text-sm font-bold">
              {editingNews ? "Редактирование новости" : "Создание новости"}
            </h3>

            <div>
              <ShadcnInput
                label="Заголовок"
                placeholder="Заголовок новости"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                onBlur={() => newsFormValidation.handleBlur("title")}
                className={cn(
                  newsFormValidation.titleValidation.touched &&
                    !newsFormValidation.titleValidation.isValid &&
                    "border-red-500",
                )}
              />
              {newsFormValidation.titleValidation.touched &&
                newsFormValidation.titleValidation.error && (
                  <p className="mt-1 font-minecraft text-xs text-red-500">
                    {newsFormValidation.titleValidation.error}
                  </p>
                )}
            </div>

            <div>
              <ShadcnInput
                label="Slug"
                placeholder="news-slug"
                value={newsSlug}
                onChange={(e) => setNewsSlug(e.target.value)}
                onBlur={() => newsFormValidation.handleBlur("slug")}
                className={cn(
                  newsFormValidation.slugValidation.touched &&
                    !newsFormValidation.slugValidation.isValid &&
                    "border-red-500",
                )}
              />
              {newsFormValidation.slugValidation.touched &&
                newsFormValidation.slugValidation.error && (
                  <p className="mt-1 font-minecraft text-xs text-red-500">
                    {newsFormValidation.slugValidation.error}
                  </p>
                )}
            </div>

            <div>
              <ShadcnInput
                label="Изображение (URL)"
                placeholder="https://example.com/image.jpg"
                value={newsImage}
                onChange={(e) => setNewsImage(e.target.value)}
                onBlur={() => newsFormValidation.handleBlur("image")}
                className={cn(
                  newsFormValidation.imageValidation.touched &&
                    !newsFormValidation.imageValidation.isValid &&
                    "border-red-500",
                )}
              />
              {newsFormValidation.imageValidation.touched &&
                newsFormValidation.imageValidation.error && (
                  <p className="mt-1 font-minecraft text-xs text-red-500">
                    {newsFormValidation.imageValidation.error}
                  </p>
                )}
            </div>

            <MultiSelect
              label="Теги"
              placeholder="Выберите теги..."
              options={newsTags.map((tag) => ({
                label: tag.name,
                value: tag.id,
              }))}
              value={selectedNewsTagIds}
              onChange={setSelectedNewsTagIds}
            />

            <div>
              <div className="flex gap-2">
                <ShadcnInput
                  placeholder="Новый тег"
                  value={newNewsTagName}
                  onChange={(e) => setNewNewsTagName(e.target.value)}
                  onBlur={newsTagValidation.handleBlur}
                  className={cn(
                    newsTagValidation.touched &&
                      !newsTagValidation.isValid &&
                      "border-red-500",
                  )}
                />
                <ShadcnButton
                  size="sm"
                  variant="outline"
                  onClick={handleCreateNewsTag}
                  disabled={isAdminApiBusy || !newsTagValidation.isValid}
                >
                  Добавить тег
                </ShadcnButton>
              </div>
              {newsTagValidation.touched && newsTagValidation.error && (
                <p className="mt-1 font-minecraft text-xs text-red-500">
                  {newsTagValidation.error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-minecraft text-sm text-theme">
                Содержание (Markdown)
              </label>
              <div data-color-mode="dark">
                <MDEditor
                  value={newsContentHtml}
                  onChange={(val) => setNewsContentHtml(val || "")}
                  onBlur={() => newsFormValidation.handleBlur("content")}
                  preview="edit"
                  height={300}
                  visibleDragbar={false}
                />
              </div>
              {newsFormValidation.contentValidation.touched &&
                newsFormValidation.contentValidation.error && (
                  <p className="mt-1 font-minecraft text-xs text-red-500">
                    {newsFormValidation.contentValidation.error}
                  </p>
                )}
            </div>

            {newsFormError && (
              <div className="font-minecraft text-xs text-red-500">
                {newsFormError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t-2 border-theme/20 pt-6">
              <ShadcnButton
                variant="secondary"
                onClick={() => setNewsTab("all")}
                size="default"
              >
                Отмена
              </ShadcnButton>
              <ShadcnButton
                variant="default"
                onClick={editingNews ? handleUpdateNews : handleCreateNews}
                disabled={
                  Boolean(newsActionLoadingId) || !newsFormValidation.isFormValid
                }
                size="default"
                className="min-w-[160px] bg-green-600 font-bold hover:bg-green-700"
              >
                {editingNews ? "Обновить новость" : "Создать новость"}
              </ShadcnButton>
            </div>
          </div>
        </div>
      )}

      {newsTab === "tags" && (
        <div className="space-y-3 rounded border border-white/10 bg-black/10 p-4">
          <div className="flex gap-2">
            <ShadcnInput
              value={newNewsTagName}
              onChange={(e) => setNewNewsTagName(e.target.value)}
              placeholder="Новый тег"
            />
            <ShadcnButton onClick={handleCreateNewsTag} disabled={isAdminApiBusy}>
              Добавить
            </ShadcnButton>
          </div>
          {newsTagFormError && (
            <div className="font-minecraft text-xs text-red-500">
              {newsTagFormError}
            </div>
          )}
          {isLoadingNewsTags && (
            <div className="font-minecraft text-xs text-theme-muted">
              Загрузка тегов...
            </div>
          )}
          {filteredNewsTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-2"
            >
              {editingTagId === tag.id ? (
                <div className="flex w-full gap-2">
                  <ShadcnInput
                    value={editingTagName}
                    onChange={(e) => setEditingTagName(e.target.value)}
                  />
                  <ShadcnButton size="sm" onClick={handleUpdateNewsTag}>
                    Сохранить
                  </ShadcnButton>
                </div>
              ) : (
                <>
                  <span>{tag.name}</span>
                  <div className="flex gap-2">
                    <ShadcnButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTagId(tag.id);
                        setEditingTagName(tag.name);
                      }}
                    >
                      Редактировать
                    </ShadcnButton>
                    <ShadcnButton
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteNewsTag(tag.id)}
                    >
                      Удалить
                    </ShadcnButton>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </ShadcnCard>
  );
}

