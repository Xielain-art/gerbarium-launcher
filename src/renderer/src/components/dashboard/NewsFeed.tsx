import { useEffect, useRef } from "react";
import type { NewsItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { NewsCards } from "./newsfeed/NewsCards";
import { NewsFeedFilters } from "./newsfeed/NewsFeedFilters";
import { NewsFeedState } from "./newsfeed/NewsFeedState";

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
  order: "newest" | "oldest";
  onOrderChange: (value: "newest" | "oldest") => void;
  selectedTag: string;
  onTagChange: (value: string) => void;
  availableTags: Array<{ id: string; name: string }>;
}

export function NewsFeed(props: NewsFeedProps) {
  const {
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
    order,
    onOrderChange,
    selectedTag,
    onTagChange,
    availableTags,
  } = props;
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
      { root: target.closest(".overflow-y-auto"), rootMargin: "0px 0px 400px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreNews, isLoadingMoreNews, isNewsInitialLoaded, onLoadMoreNews]);

  return (
    <div className="px-6">
      <NewsFeedFilters t={t} order={order} onOrderChange={onOrderChange} selectedTag={selectedTag} onTagChange={onTagChange} availableTags={availableTags} />
      <NewsFeedState isLoadingNews={isLoadingNews} newsError={newsError} loadingText={t.COMMON.LOADING} failedText={t.DASHBOARD.FAILED_TO_LOAD_NEWS} tryAgainText={t.DASHBOARD.TRY_AGAIN}>
        <NewsCards t={t} news={news} placeholderImage={placeholderImage} onSelectNews={onSelectNews} />
      </NewsFeedState>
      <div ref={loadMoreRef} className="h-6 w-full" />
      {isLoadingMoreNews && <div className="py-3 text-center text-xs text-[var(--muted-foreground)]">{t.DASHBOARD.LOADING_MORE_NEWS}</div>}
      {!hasMoreNews && news.length > 0 && <div className="py-3 text-center text-xs text-[var(--muted-foreground)]">{t.DASHBOARD.NO_MORE_NEWS}</div>}
    </div>
  );
}
