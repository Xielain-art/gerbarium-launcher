import { Button as ShadcnButton, Card as ShadcnCard, Input as ShadcnInput, Select as ShadcnSelect } from "@/components/shadcn/ui";
import type { ApiNews } from "../../../../../lib/api/news";

interface Props {
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
  newsFormError: string | null;
  newsActionLoadingId: string | null;
  handleCreateNews: () => void;
  handleUpdateNews: () => void;
  newNewsTagName: string; setNewNewsTagName: (v: string) => void;
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
  return (
    <ShadcnCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-minecraft text-xl font-bold">Управление новостями</h2>
        <div className="flex items-center gap-2">
          {p.isApplyingNewsFilters && <span className="font-minecraft text-[10px] uppercase text-theme-muted">Фильтрация...</span>}
          <ShadcnButton variant={p.newsTab === "all" ? "default" : "secondary"} onClick={() => p.setNewsTab("all")}>Все</ShadcnButton>
          <ShadcnButton variant={p.newsTab === "tags" ? "default" : "secondary"} onClick={() => p.setNewsTab("tags")}>Теги</ShadcnButton>
          <ShadcnButton variant={p.newsTab === "create" ? "default" : "secondary"} onClick={() => { if (p.newsTab !== "create") p.resetNewsForm(); p.setNewsTab("create"); }}>{p.editingNews ? "Редактировать" : "Создать"}</ShadcnButton>
        </div>
      </div>

      {p.newsTab === "all" && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnInput placeholder="Поиск" value={p.newsSearch} onChange={(e) => p.setNewsSearch(e.target.value)} />
            <ShadcnSelect label="Тег" value={p.newsTag} onChange={(e) => p.setNewsTag(typeof e === "string" ? e : e.target.value)} options={[{ label: "Все теги", value: "" }, ...p.newsTags.map((tag) => ({ label: tag.name, value: tag.id }))]} />
            <ShadcnSelect label="Порядок" value={p.newsOrderDraft} onChange={(e) => p.setNewsOrderDraft(typeof e === "string" ? e : e.target.value)} options={[{ label: "Новые", value: "DESC" }, { label: "Старые", value: "ASC" }]} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnSelect label="Сортировка" value={p.newsSortDraft} onChange={(e) => p.setNewsSortDraft(typeof e === "string" ? e : e.target.value)} options={[{ label: "По созданию", value: "createdAt" }, { label: "По обновлению", value: "updatedAt" }, { label: "По названию", value: "title" }]} />
            <ShadcnInput type="datetime-local" value={p.newsFromDate} onChange={(e) => p.setNewsFromDate(e.target.value)} />
            <ShadcnInput type="datetime-local" value={p.newsToDate} onChange={(e) => p.setNewsToDate(e.target.value)} />
          </div>
          <div className="mt-4 grid gap-3">
            {p.newsRows.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-3">
                <div><div className="font-minecraft text-sm text-theme">{item.title}</div><div className="font-minecraft text-[10px] text-theme-muted">{item.slug}</div></div>
                <div className="flex gap-2"><ShadcnButton size="sm" variant="outline" onClick={() => p.startEditNews(item)}>Edit</ShadcnButton><ShadcnButton size="sm" variant="destructive" onClick={() => p.handleDeleteNews(item.id)}>Delete</ShadcnButton></div>
              </div>
            ))}
          </div>
          {p.newsRows.length === 0 && !p.isLoadingNews && <div className="py-8 text-center font-minecraft text-theme-muted">Новости не найдены.</div>}
          <div ref={p.newsEndRef} className="h-4" />
          {p.isLoadingMoreNews && <div className="py-2 text-center font-minecraft text-xs text-theme-muted">Загрузка новостей...</div>}
        </>
      )}

      {p.newsTab === "create" && (
        <div className="space-y-3 rounded border border-white/10 bg-black/10 p-4">
          <ShadcnInput placeholder="Заголовок" value={p.newsTitle} onChange={(e) => p.setNewsTitle(e.target.value)} />
          <ShadcnInput placeholder="Слаг" value={p.newsSlug} onChange={(e) => p.setNewsSlug(e.target.value)} />
          <ShadcnInput placeholder="Изображение URL" value={p.newsImage} onChange={(e) => p.setNewsImage(e.target.value)} />
          <textarea className="min-h-[180px] w-full rounded border border-white/10 bg-black/20 p-2 text-sm" value={p.newsContentHtml} onChange={(e) => p.setNewsContentHtml(e.target.value)} />
          {p.newsFormError && <div className="font-minecraft text-xs text-red-500">{p.newsFormError}</div>}
          <div className="flex justify-end gap-2"><ShadcnButton variant="secondary" onClick={() => p.setNewsTab("all")}>Отмена</ShadcnButton><ShadcnButton variant="default" onClick={p.editingNews ? p.handleUpdateNews : p.handleCreateNews} disabled={Boolean(p.newsActionLoadingId)}>{p.editingNews ? "Обновить" : "Создать"}</ShadcnButton></div>
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
