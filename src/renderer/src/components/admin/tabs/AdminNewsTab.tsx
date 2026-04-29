import { Button as ShadcnButton, Card as ShadcnCard, Input as ShadcnInput, Select as ShadcnSelect, MultiSelect } from "@/components/shadcn/ui";
import MDEditor from "@uiw/react-md-editor";
import type { ApiNews } from "../../../../../lib/api/news";

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
  newsTagValidation: FieldValidation & {
    handleBlur: () => void;
  };
  newsTab: "all" | "create" | "tags";
  setNewsTab: (v: "all" | "create" | "tags") => void;
  isApplyingNewsFilters: boolean;
  newsRows: ApiNews[];
  newsTags: Array<{ id: string; name: string }>;
  isLoadingNews: boolean;
  isLoadingMoreNews: boolean;
  newsEndRef: React.RefObject<HTMLDivElement | null>;
  newsSearch: string; setNewsSearch: (v: string) => void;
  newsTag: string; setNewsTag: (v: string) => void;
  newsSortDraft: string; setNewsSortDraft: (v: string) => void;
  newsOrderDraft: string; setNewsOrderDraft: (v: string) => void;
  newsFromDate: string; setNewsFromDate: (v: string) => void;
  newsToDate: string; setNewsToDate: (v: string) => void;
  editingNews: ApiNews | null;
  resetNewsForm: () => void;
  startEditNews: (n: ApiNews) => void;
  handleDeleteNews: (id: string) => void;
  newsTitle: string; setNewsTitle: (v: string) => void;
  newsSlug: string; setNewsSlug: (v: string) => void;
  newsImage: string; setNewsImage: (v: string) => void;
  newsContentHtml: string; setNewsContentHtml: (v: string) => void;
  selectedNewsTagIds: string[]; setSelectedNewsTagIds: (v: string[]) => void;
  newNewsTagName: string; setNewNewsTagName: (v: string) => void;
  newsFormError: string | null;
  newsActionLoadingId: string | null;
  handleCreateNews: () => void;
  handleUpdateNews: () => void;
  filteredNewsTags: Array<{ id: string; name: string }>;
  isLoadingNewsTags: boolean;
  editingTagId: string | null; setEditingTagId: (v: string | null) => void;
  editingTagName: string; setEditingTagName: (v: string) => void;
  handleCreateNewsTag: () => void;
  handleUpdateNewsTag: () => void;
  handleDeleteNewsTag: (id: string) => void;
  isAdminApiBusy: boolean;
  newsTagFormError: string | null;
}

export function AdminNewsTab(p: Props) {
  const hasUnsavedChanges = p.newsTab === "create" && (p.newsTitle || p.newsSlug || p.newsImage || p.newsContentHtml || p.selectedNewsTagIds.length > 0);

  const handleTabSwitch = (tab: "all" | "create" | "tags") => {
    if (tab === "create" && p.newsTab !== "create") {
      p.resetNewsForm();
    }
    p.setNewsTab(tab);
  };

  return (
    <ShadcnCard className="p-6">
      {/* Header with tabs */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-minecraft text-xl font-bold">Управление новостями</h2>
          {p.isApplyingNewsFilters && <span className="font-minecraft text-[10px] uppercase text-theme-muted">Фильтрация...</span>}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <ShadcnButton 
            variant={p.newsTab === "all" ? "default" : "ghost"} 
            onClick={() => handleTabSwitch("all")}
            disabled={!!(p.newsTab === "create" && hasUnsavedChanges)}
            size="sm"
          >
            📋 Все новости
          </ShadcnButton>
          <ShadcnButton 
            variant={p.newsTab === "tags" ? "default" : "ghost"} 
            onClick={() => handleTabSwitch("tags")}
            disabled={!!(p.newsTab === "create" && hasUnsavedChanges)}
            size="sm"
          >
            🏷️ Теги
          </ShadcnButton>
          <div className="ml-auto">
            <ShadcnButton 
              variant="outline"
              onClick={() => handleTabSwitch("create")}
              size="sm"
              className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
            >
              {p.editingNews ? "✏️ Редактировать новость" : "➕ Создать новость"}
            </ShadcnButton>
          </div>
        </div>
      </div>

      {p.newsTab === "all" && (
        <>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnInput label="Поиск" placeholder="Поиск по содержанию" value={p.newsSearch} onChange={(e) => p.setNewsSearch(e.target.value)} />
            <ShadcnSelect label="Тег" value={p.newsTag} onChange={(e) => p.setNewsTag(typeof e === "string" ? e : e.target.value)} options={[{ label: "Все теги", value: "" }, ...p.newsTags.map((tag) => ({ label: tag.name, value: tag.id }))]} />
            <ShadcnSelect label="Сортировка" value={p.newsSortDraft} onChange={(e) => p.setNewsSortDraft(typeof e === "string" ? e : e.target.value)} options={[{ label: "Дата создания", value: "createdAt" }, { label: "Дата обновления", value: "updatedAt" }, { label: "Заголовок", value: "title" }]} />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnInput label="От даты" type="date" value={p.newsFromDate} onChange={(e) => p.setNewsFromDate(e.target.value)} />
            <ShadcnInput label="До даты" type="date" value={p.newsToDate} onChange={(e) => p.setNewsToDate(e.target.value)} />
            <ShadcnSelect label="Порядок" value={p.newsOrderDraft} onChange={(e) => p.setNewsOrderDraft(typeof e === "string" ? e : e.target.value)} options={[{ label: "По убыванию", value: "DESC" }, { label: "По возрастанию", value: "ASC" }]} />
          </div>
          {p.isLoadingNews && <div className="font-minecraft text-xs text-theme-muted">Загрузка новостей...</div>}
          <div className="space-y-3">
            {p.newsRows.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded border border-white/10 bg-black/20 p-3">
                <div className="flex-1">
                  <div className="mb-1 font-minecraft text-sm font-bold">{item.title}</div>
                  <div className="font-minecraft text-[10px] text-theme-muted">{item.slug}</div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.tags.map((tag: { id: string; name: string }) => (
                        <span key={tag.id} className="rounded bg-theme/20 px-1 py-0.5 font-minecraft text-[9px]">{tag.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <ShadcnButton size="sm" variant="outline" onClick={() => p.startEditNews(item)}>Редактировать</ShadcnButton>
                  <ShadcnButton size="sm" variant="destructive" onClick={() => p.handleDeleteNews(item.id)} disabled={p.newsActionLoadingId === item.id}>Удалить</ShadcnButton>
                </div>
              </div>
            ))}
            <div ref={p.newsEndRef} className="h-4" />
            {p.isLoadingMoreNews && <div className="font-minecraft text-xs text-theme-muted">Загрузка...</div>}
          </div>
        </>
      )}

      {p.newsTab === "create" && (
        <div className="space-y-4">
          <div className="rounded border border-white/10 bg-black/10 p-4">
            <h3 className="mb-4 font-minecraft text-sm font-bold">{p.editingNews ? "Редактирование новости" : "Создание новости"}</h3>
            
            <div>
              <ShadcnInput
                label="Заголовок"
                placeholder="Заголовок новости"
                value={p.newsTitle}
                onChange={(e) => p.setNewsTitle(e.target.value)}
                onBlur={() => p.newsFormValidation.handleBlur("title")}
                className={p.newsFormValidation.titleValidation.touched && !p.newsFormValidation.titleValidation.isValid ? "border-red-500" : ""}
              />
              {p.newsFormValidation.titleValidation.touched && p.newsFormValidation.titleValidation.error && (
                <p className="mt-1 font-minecraft text-xs text-red-500">{p.newsFormValidation.titleValidation.error}</p>
              )}
            </div>
            
            <div>
              <ShadcnInput
                label="Slug"
                placeholder="news-slug"
                value={p.newsSlug}
                onChange={(e) => p.setNewsSlug(e.target.value)}
                onBlur={() => p.newsFormValidation.handleBlur("slug")}
                className={p.newsFormValidation.slugValidation.touched && !p.newsFormValidation.slugValidation.isValid ? "border-red-500" : ""}
              />
              {p.newsFormValidation.slugValidation.touched && p.newsFormValidation.slugValidation.error && (
                <p className="mt-1 font-minecraft text-xs text-red-500">{p.newsFormValidation.slugValidation.error}</p>
              )}
            </div>
            
            <div>
              <ShadcnInput
                label="Изображение (URL)"
                placeholder="https://example.com/image.jpg"
                value={p.newsImage}
                onChange={(e) => p.setNewsImage(e.target.value)}
                onBlur={() => p.newsFormValidation.handleBlur("image")}
                className={p.newsFormValidation.imageValidation.touched && !p.newsFormValidation.imageValidation.isValid ? "border-red-500" : ""}
              />
              {p.newsFormValidation.imageValidation.touched && p.newsFormValidation.imageValidation.error && (
                <p className="mt-1 font-minecraft text-xs text-red-500">{p.newsFormValidation.imageValidation.error}</p>
              )}
            </div>
            
            <MultiSelect
              label="Теги"
              placeholder="Выберите теги..."
              options={p.newsTags.map((tag) => ({ label: tag.name, value: tag.id }))}
              value={p.selectedNewsTagIds}
              onChange={p.setSelectedNewsTagIds}
            />

            <div>
              <div className="flex gap-2">
                <ShadcnInput
                  placeholder="Новый тег"
                  value={p.newNewsTagName}
                  onChange={(e) => p.setNewNewsTagName(e.target.value)}
                  onBlur={p.newsTagValidation.handleBlur}
                  className={p.newsTagValidation.touched && !p.newsTagValidation.isValid ? "border-red-500" : ""}
                />
                <ShadcnButton
                  size="sm"
                  variant="outline"
                  onClick={p.handleCreateNewsTag}
                  disabled={p.isAdminApiBusy || !p.newsTagValidation.isValid}
                >
                  Добавить тег
                </ShadcnButton>
              </div>
              {p.newsTagValidation.touched && p.newsTagValidation.error && (
                <p className="mt-1 font-minecraft text-xs text-red-500">{p.newsTagValidation.error}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-minecraft text-sm text-theme">Содержание (Markdown)</label>
              <div data-color-mode="dark">
                <MDEditor
                  value={p.newsContentHtml}
                  onChange={(val) => p.setNewsContentHtml(val || "")}
                  onBlur={() => p.newsFormValidation.handleBlur("content")}
                  preview="edit"
                  height={300}
                  visibleDragbar={false}
                />
              </div>
              {p.newsFormValidation.contentValidation.touched && p.newsFormValidation.contentValidation.error && (
                <p className="mt-1 font-minecraft text-xs text-red-500">{p.newsFormValidation.contentValidation.error}</p>
              )}
            </div>

            {p.newsFormError && <div className="font-minecraft text-xs text-red-500">{p.newsFormError}</div>}
            
            {/* Action Buttons - Prominent */}
            <div className="mt-6 flex justify-end gap-3 border-t-2 border-theme/20 pt-6">
              <ShadcnButton 
                variant="secondary" 
                onClick={() => p.setNewsTab("all")}
                size="default"
              >
                ✕ Отмена
              </ShadcnButton>
              <ShadcnButton 
                variant="default" 
                onClick={p.editingNews ? p.handleUpdateNews : p.handleCreateNews} 
                disabled={Boolean(p.newsActionLoadingId) || !p.newsFormValidation.isFormValid}
                size="default"
                className="min-w-[160px] bg-green-600 font-bold hover:bg-green-700"
              >
                {p.editingNews ? "💾 Обновить новость" : "✅ Создать новость"}
              </ShadcnButton>
            </div>
          </div>
        </div>
      )}

      {p.newsTab === "tags" && (
        <div className="space-y-3 rounded border border-white/10 bg-black/10 p-4">
          <div className="flex gap-2"><ShadcnInput value={p.newNewsTagName} onChange={(e) => p.setNewNewsTagName(e.target.value)} placeholder="Новый тег" /><ShadcnButton onClick={p.handleCreateNewsTag} disabled={p.isAdminApiBusy}>Добавить</ShadcnButton></div>
          {p.newsTagFormError && <div className="font-minecraft text-xs text-red-500">{p.newsTagFormError}</div>}
          {p.isLoadingNewsTags && <div className="font-minecraft text-xs text-theme-muted">Загрузка тегов...</div>}
          {p.filteredNewsTags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-2">
              {p.editingTagId === tag.id ? (
                <div className="flex w-full gap-2"><ShadcnInput value={p.editingTagName} onChange={(e) => p.setEditingTagName(e.target.value)} /><ShadcnButton size="sm" onClick={p.handleUpdateNewsTag}>Сохранить</ShadcnButton></div>
              ) : (
                <><span>{tag.name}</span><div className="flex gap-2"><ShadcnButton size="sm" variant="outline" onClick={() => { p.setEditingTagId(tag.id); p.setEditingTagName(tag.name); }}>Редактировать</ShadcnButton><ShadcnButton size="sm" variant="destructive" onClick={() => p.handleDeleteNewsTag(tag.id)}>Удалить</ShadcnButton></div></>
              )}
            </div>
          ))}
        </div>
      )}
    </ShadcnCard>
  );
}