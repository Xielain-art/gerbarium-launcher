import { Card } from "../ui/Card";
import type { ChangelogItem } from "../../types";
import { useEffect, useRef } from "react";
import { renderMarkdownToSafeHtml } from "../../lib/markdown";

interface ChangelogFeedProps {
  changelog: ChangelogItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isInitialLoaded: boolean;
  onLoadMore: () => Promise<void>;
  onSelectChangelog: (item: ChangelogItem) => void;
  error?: string | null;
}

export function ChangelogFeed({
  changelog,
  isLoading,
  isLoadingMore,
  hasMore,
  isInitialLoaded,
  onLoadMore,
  onSelectChangelog,
  error,
}: ChangelogFeedProps) {
  const getMarkdown = (item: ChangelogItem): string => item.changes.join("\n").trim();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isInitialLoaded) return;
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !isLoadingMore) {
          void onLoadMore();
        }
      },
      {
        root: target.closest(".overflow-y-auto"),
        rootMargin: "0px 0px 400px 0px",
      },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isInitialLoaded, isLoadingMore, onLoadMore]);

  return (
    <div className="overflow-x-hidden px-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-minecraft text-lg font-bold uppercase tracking-wider text-theme">
          Changelog
        </h2>
      </div>

      {isLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="mc-spinner h-10 w-10 rounded-full border-2 border-[var(--mc-accent)] border-t-transparent" />
            <span className="font-minecraft text-xs text-theme-muted">Загрузка</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <div className="font-minecraft text-lg text-red-500">⚠️ Ошибка загрузки</div>
          <div className="max-w-md font-minecraft text-sm text-theme-muted">{error}</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {changelog.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-minecraft text-base font-bold text-theme">
                  v{item.version}
                </h3>
                <div className="flex items-center gap-2">
                  {item.mandatory && (
                    <span className="rounded bg-red-500/20 px-2 py-1 font-minecraft text-[10px] uppercase text-red-400">
                      Mandatory
                    </span>
                  )}
                  <span className="font-minecraft text-xs text-theme-muted">
                    {new Date(item.releaseDate).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
              <div
                className="mb-3 min-w-0 max-w-full font-minecraft text-xs leading-relaxed text-theme-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[var(--mc-accent)] [&_a]:underline"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownToSafeHtml(getMarkdown(item)),
                }}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="mc-btn mc-btn-sm mc-btn-primary"
                  onClick={() => onSelectChangelog(item)}
                >
                  Читать полностью
                </button>
                <a
                  href={item.downloadUrl}
                  className="font-minecraft text-xs text-[var(--mc-accent)] underline"
                  onClick={(e) => {
                    e.preventDefault();
                    void window.electronAPI.system.openExternal(item.downloadUrl);
                  }}
                >
                  Скачать релиз
                </a>
              </div>
            </Card>
          ))}
          {changelog.length === 0 && (
            <div className="py-10 text-center font-minecraft text-theme-muted">
              Нет записей changelog.
            </div>
          )}
        </div>
      )}
      <div ref={loadMoreRef} className="h-6 w-full" />
      {isLoadingMore && (
        <div className="py-3 text-center font-minecraft text-xs text-theme-muted">
          Загрузка еще релизов...
        </div>
      )}
      {!hasMore && changelog.length > 0 && (
        <div className="py-3 text-center font-minecraft text-xs text-theme-muted">
          Это все релизы.
        </div>
      )}
    </div>
  );
}
