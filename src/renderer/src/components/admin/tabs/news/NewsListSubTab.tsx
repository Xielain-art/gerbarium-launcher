import { Button as ShadcnButton } from "@/components/shadcn/ui/button";
import { Input as ShadcnInput } from "@/components/shadcn/ui/input";
import { Select as ShadcnSelect } from "@/components/shadcn/ui/select";


import type { AdminNewsTabProps } from "./types";

export function NewsListSubTab(props: AdminNewsTabProps) {
  const { newsRows, newsTags, isLoadingNews, isLoadingMoreNews, newsEndRef, newsSearch, setNewsSearch, newsTag, setNewsTag, newsSortDraft, setNewsSortDraft, newsOrderDraft, setNewsOrderDraft, newsFromDate, setNewsFromDate, newsToDate, setNewsToDate, startEditNews, handleDeleteNews, newsActionLoadingId } = props;
  return (<>

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
            <div className="font-mono text-xs text-theme-muted">
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
                  <div className="mb-1 font-mono text-sm font-bold">
                    {item.title}
                  </div>
                  <div className="font-mono text-[10px] text-theme-muted">
                    {item.slug}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.tags.map((tag: { id: string; name: string }) => (
                        <span
                          key={tag.id}
                          className="rounded bg-theme/20 px-1 py-0.5 font-mono text-[9px]"
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
              <div className="font-mono text-xs text-theme-muted">
                Загрузка...
              </div>
            )}
          </div>
        </>

  </>);
}


