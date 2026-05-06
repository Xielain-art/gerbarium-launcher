import { useEffect, useRef } from "react";
import type { ChangelogItem } from "../../types";
import { renderMarkdownToSafeHtml } from "../../lib/markdown";
import type { TranslationType } from "../../../../shared/constants/translations";

interface ChangelogFeedProps {
  t: TranslationType;
  changelog: ChangelogItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isInitialLoaded: boolean;
  onLoadMore: () => Promise<void>;
  onSelectChangelog: (item: ChangelogItem) => void;
  error?: string | null;
}

const MAX_PREVIEW_LENGTH = 300;

function getMarkdown(item: ChangelogItem): string {
  return item.changes.join("\n").trim();
}

function getTruncatedMarkdown(item: ChangelogItem): {
  html: string;
  isTruncated: boolean;
} {
  const fullMarkdown = getMarkdown(item);
  const fullHtml = renderMarkdownToSafeHtml(fullMarkdown);

  if (typeof document === "undefined") {
    return { html: fullHtml, isTruncated: false };
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = fullHtml;
  const plainText = tempDiv.textContent || tempDiv.innerText || "";

  if (plainText.length <= MAX_PREVIEW_LENGTH) {
    return { html: fullHtml, isTruncated: false };
  }

  const truncatedText = plainText.slice(0, MAX_PREVIEW_LENGTH);
  const searchAnchor = truncatedText.slice(-50);
  const anchorIndex = fullMarkdown.indexOf(searchAnchor);

  const truncatedMarkdown =
    anchorIndex !== -1
      ? fullMarkdown.slice(0, anchorIndex + 50)
      : fullMarkdown.slice(0, MAX_PREVIEW_LENGTH);

  return {
    html: renderMarkdownToSafeHtml(truncatedMarkdown) + "...",
    isTruncated: true,
  };
}

export function ChangelogFeed({
  t,
  changelog,
  isLoading,
  isLoadingMore,
  hasMore,
  isInitialLoaded,
  onLoadMore,
  onSelectChangelog,
  error,
}: ChangelogFeedProps): React.JSX.Element {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isInitialLoaded) {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

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

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--mc-accent)] border-t-transparent" />
          <span className="fantasy-rune-label text-[10px] font-medium">
            {t.COMMON.LOADING}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="font-sans text-lg font-medium text-[color:var(--destructive)]">
          {t.DASHBOARD.FAILED_TO_LOAD_NEWS}
        </div>
        <div className="max-w-md font-sans text-sm text-theme-muted">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden px-6">
      <div className="mb-10">
        <h2 className="fantasy-hero-title font-sans text-xl font-medium text-theme">
          Changelog
        </h2>
        <p className="fantasy-rune-label text-[10px]">
          Technical updates and release history.
        </p>
      </div>

      <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:h-full before:w-[1px] before:bg-[var(--fantasy-border-soft)]">
        {changelog.map((item) => {
          const { html, isTruncated } = getTruncatedMarkdown(item);

          return (
            <article key={item.id} className="relative pl-10">
              <div className="absolute left-0 top-1.5 h-[23px] w-[23px] rounded-full border-4 border-[var(--theme-bg)] bg-[var(--mc-accent)]" />
              
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="fantasy-rune-label text-lg font-bold text-theme">
                    v{item.version}
                  </h3>
                  {item.mandatory && (
                  <span className="rounded border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[color:var(--destructive)]">
                    Mandatory
                  </span>
                )}
              </div>
                <time className="fantasy-rune-label text-[10px] font-medium">
                  {new Date(item.releaseDate).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </time>
              </div>

              <div className="fantasy-card rounded-[1.25rem] p-5">
                <div
                  className="prose prose-sm mb-5 max-w-full font-sans text-xs leading-relaxed text-theme-muted [&_a]:text-[var(--mc-accent)] [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--fantasy-border-soft)] pt-4">
                  {isTruncated && (
                    <button
                      type="button"
                      onClick={() => onSelectChangelog(item)}
                      className="font-sans text-xs font-medium text-[var(--mc-accent)] hover:text-[var(--mc-accent-hi)]"
                    >
                      {t.DASHBOARD.READ_MORE}
                    </button>
                  )}
                  <a
                    href={item.downloadUrl}
                    className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-widest text-theme-muted transition-colors hover:text-theme"
                    onClick={(e) => {
                      e.preventDefault();
                      void window.electronAPI.system.openExternal(
                        item.downloadUrl,
                      );
                    }}
                  >
                    <span className="text-sm">↓</span>
                    {t.DASHBOARD.DOWNLOAD_RELEASE}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
        {changelog.length === 0 && (
          <div className="py-10 text-center font-sans text-sm text-theme-muted">
            {t.DASHBOARD.NO_MORE_NEWS}
          </div>
        )}
      </div>

      <div ref={loadMoreRef} className="h-6 w-full" />
      {isLoadingMore && (
        <div className="py-3 text-center font-mono text-[10px] uppercase tracking-wider text-theme-muted">
          {t.DASHBOARD.LOADING_MORE_NEWS}
        </div>
      )}
      {!hasMore && changelog.length > 0 && (
        <div className="py-3 text-center font-mono text-[10px] uppercase tracking-wider text-theme-muted">
          {t.DASHBOARD.NO_MORE_NEWS}
        </div>
      )}
    </div>
  );
}

