import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import type { NewsItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNewsStore } from "../../stores/useNewsStore";

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    update: "bg-[#3a753a]",
    event: "bg-[#8b5a2a]",
    community: "bg-[#5a5a8b]",
    announcement: "bg-[#8b2a2a]",
  };
  return colors[category] || "bg-[#5a5a5a]";
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

interface NewsFeedProps {
  t: TranslationType;
  news: NewsItem[];
  isLoadingNews: boolean;
  isLoadingMoreNews: boolean;
  hasMoreNews: boolean;
  isNewsInitialLoaded: boolean;
  onLoadMoreNews: () => Promise<void>;
  placeholderImage: string;
  newsError?: string | null;
  onSelectNews: (news: NewsItem) => void;
}

export function NewsFeed({
  t,
  news,
  isLoadingNews,
  isLoadingMoreNews,
  hasMoreNews,
  isNewsInitialLoaded,
  onLoadMoreNews,
  placeholderImage,
  newsError,
  onSelectNews,
}: NewsFeedProps) {
  const { searchQuery, setFilters } = useNewsStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ searchQuery: localSearch });
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, setFilters]);


  const loadMoreRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!isNewsInitialLoaded) return;
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMoreNews && !isLoadingMoreNews) {
          void onLoadMoreNews();
        }
      },
      { 
        root: target.closest(".overflow-y-auto"),
        rootMargin: "0px 0px 400px 0px" 
      },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreNews, isLoadingMoreNews, isNewsInitialLoaded, onLoadMoreNews]);

  return (
    <div className="px-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-minecraft text-lg font-bold uppercase tracking-wider text-theme">
          {t.DASHBOARD.NEWS_TITLE}
        </h2>
      </div>

      {isLoadingNews ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="mc-spinner border-2 border-[var(--mc-accent)] border-t-transparent rounded-full h-10 w-10" />
            <span className="font-minecraft text-xs text-theme-muted">Загрузка</span>
          </div>
        </div>
      ) : newsError ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <div className="text-red-500 font-minecraft text-lg">⚠️ Ошибка загрузки</div>
          <div className="text-theme-muted font-minecraft text-sm max-w-md">{newsError}</div>
          <button
            onClick={() => window.location.reload()}
            className="mc-btn mc-btn-primary mt-2"
          >
            Попробовать снова
          </button>
        </div>
      ) : (
      <div className="grid gap-5">
        {news.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden p-0"
              >
                <div className="mb-4 h-48 w-full overflow-hidden rounded-none border-b-[3px] border-theme">
                  <img
                    src={item.imageUrl || placeholderImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`px-3 py-1 font-minecraft text-xs font-bold text-white ${getCategoryColor(item.category)}`}
                  >
                    {t.NEWS.CATEGORIES[item.category as keyof typeof t.NEWS.CATEGORIES] || item.category}
                  </span>
                  <span className="font-minecraft text-xs text-theme-muted">
                    {new Date(item.date).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="mb-3 font-minecraft text-lg font-bold text-theme">
                  {item.title}
                </h3>
                <p className="font-minecraft text-sm leading-relaxed text-theme-muted">
                  {(item.htmlContent ? stripHtml(item.htmlContent) : item.content).slice(0, 260)}
                  {(item.htmlContent ? stripHtml(item.htmlContent) : item.content).length > 260 ? "..." : ""}
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    className="mc-btn mc-btn-sm mc-btn-primary"
                    onClick={() => onSelectNews(item)}
                  >
                    Читать полностью
                  </button>
                </div>
              </Card>
            ))}
      </div>
      )}

      <div ref={loadMoreRef} className="h-6 w-full" />
      {isLoadingMoreNews && (
        <div className="py-3 text-center font-minecraft text-xs text-theme-muted">
          Загрузка еще новостей...
        </div>
      )}
      {!hasMoreNews && news.length > 0 && (
        <div className="py-3 text-center font-minecraft text-xs text-theme-muted">
          Это все новости.
        </div>
      )}


    </div>
  );
}
