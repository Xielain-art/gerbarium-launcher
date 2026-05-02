import { useEffect, useRef } from "react";
import type { ChangelogItem } from "../../types";
import { renderMarkdownToSafeHtml } from "../../lib/markdown";
import type { TranslationType } from "../../../../shared/constants/translations";
import { Button } from "../shadcn/ui";

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
          <div className="mc-spinner h-10 w-10 rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <span className="text-xs text-[var(--muted-foreground)]">
            {t.COMMON.LOADING}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-lg text-[var(--destructive)]">
          ⚠️ {t.DASHBOARD.FAILED_TO_LOAD_NEWS}
        </div>
        <div className="max-w-md text-sm text-[var(--muted-foreground)]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden px-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide text-[var(--foreground)]">
          Changelog
        </h2>
      </div>

      <div className="grid gap-4">
        {changelog.map((item) => {
          const { html, isTruncated } = getTruncatedMarkdown(item);

          return (
            <article
              key={item.id}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--card-foreground)] shadow-[var(--shadow-md)]"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  v{item.version}
                </h3>
                <div className="flex items-center gap-2">
                  {item.mandatory && (
                    <span className="rounded bg-[color:var(--destructive)]/20 px-2 py-1 text-[10px] uppercase text-[var(--destructive)]">
                      Mandatory
                    </span>
                  )}
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(item.releaseDate).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
              <div
                className="mb-3 min-w-0 max-w-full text-xs leading-relaxed text-[var(--muted-foreground)] [&_a]:text-[var(--primary)] [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                {isTruncated && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onSelectChangelog(item)}
                  >
                    {t.DASHBOARD.READ_MORE}
                  </Button>
                )}
                <a
                  href={item.downloadUrl}
                  className="text-xs text-[var(--primary)] underline"
                  onClick={(e) => {
                    e.preventDefault();
                    void window.electronAPI.system.openExternal(
                      item.downloadUrl,
                    );
                  }}
                >
                  {t.DASHBOARD.DOWNLOAD_RELEASE}
                </a>
              </div>
            </article>
          );
        })}
        {changelog.length === 0 && (
          <div className="py-10 text-center text-[var(--muted-foreground)]">
            {t.DASHBOARD.NO_MORE_NEWS}
          </div>
        )}
      </div>

      <div ref={loadMoreRef} className="h-6 w-full" />
      {isLoadingMore && (
        <div className="py-3 text-center text-xs text-[var(--muted-foreground)]">
          {t.DASHBOARD.LOADING_MORE_NEWS}
        </div>
      )}
      {!hasMore && changelog.length > 0 && (
        <div className="py-3 text-center text-xs text-[var(--muted-foreground)]">
          {t.DASHBOARD.NO_MORE_NEWS}
        </div>
      )}
    </div>
  );
}

