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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!props.isNewsInitialLoaded) return;
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && props.hasMoreNews && !props.isLoadingMoreNews) {
          void props.onLoadMoreNews();
        }
      },
      { root: target.closest(".overflow-y-auto"), rootMargin: "0px 0px 400px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [props.hasMoreNews, props.isLoadingMoreNews, props.isNewsInitialLoaded, props.onLoadMoreNews]);

  return (
    <div className="px-6">
      <NewsFeedFilters t={props.t} order={props.order} onOrderChange={props.onOrderChange} selectedTag={props.selectedTag} onTagChange={props.onTagChange} availableTags={props.availableTags} />
      <NewsFeedState isLoadingNews={props.isLoadingNews} newsError={props.newsError} loadingText={props.t.COMMON.LOADING} failedText={props.t.DASHBOARD.FAILED_TO_LOAD_NEWS} tryAgainText={props.t.DASHBOARD.TRY_AGAIN}>
        <NewsCards t={props.t} news={props.news} placeholderImage={props.placeholderImage} onSelectNews={props.onSelectNews} />
      </NewsFeedState>
      <div ref={loadMoreRef} className="h-6 w-full" />
      {props.isLoadingMoreNews && <div className="py-3 text-center font-minecraft text-xs text-theme-muted">{props.t.DASHBOARD.LOADING_MORE_NEWS}</div>}
      {!props.hasMoreNews && props.news.length > 0 && <div className="py-3 text-center font-minecraft text-xs text-theme-muted">{props.t.DASHBOARD.NO_MORE_NEWS}</div>}
    </div>
  );
}
