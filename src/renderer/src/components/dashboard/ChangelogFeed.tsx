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
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3ecf8e] border-t-transparent" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#898989]">
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
        <div className="max-w-md font-sans text-sm text-[#898989]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden px-6">
      <div className="mb-10">
        <h2 className="font-sans text-xl font-medium tracking-tight text-[#fafafa]">
          Changelog
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#898989]">
          Technical updates and release history.
        </p>
      </div>

      <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:h-full before:w-[1px] before:bg-[#2e2e2e]">
        {changelog.map((item) => {
          const { html, isTruncated } = getTruncatedMarkdown(item);

          return (
            <article key={item.id} className="relative pl-10">
              <div className="absolute left-0 top-1.5 h-[23px] w-[23px] rounded-full border-4 border-[#171717] bg-[#3ecf8e]" />
              
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-mono text-lg font-bold text-[#fafafa]">
                    v{item.version}
                  </h3>
                  {item.mandatory && (
                    <span className="rounded border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[color:var(--destructive)]">
                      Mandatory
                    </span>
                  )}
                </div>
                <time className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#898989]">
                  {new Date(item.releaseDate).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </time>
              </div>

              <div className="rounded-xl border border-[#2e2e2e] bg-[#0f0f0f] p-5">
                <div
                  className="prose prose-sm prose-invert mb-5 max-w-full font-sans text-xs leading-relaxed text-[#b4b4b4] [&_a]:text-[#3ecf8e] [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#2e2e2e] pt-4">
                  {isTruncated && (
                    <button
                      type="button"
                      onClick={() => onSelectChangelog(item)}
                      className="font-sans text-xs font-medium text-[#3ecf8e] hover:text-[#00c573]"
                    >
                      {t.DASHBOARD.READ_MORE}
                    </button>
                  )}
                  <a
                    href={item.downloadUrl}
                    className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-widest text-[#898989] transition-colors hover:text-[#fafafa]"
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
          <div className="py-10 text-center font-sans text-sm text-[#898989]">
            {t.DASHBOARD.NO_MORE_NEWS}
          </div>
        )}
      </div>

      <div ref={loadMoreRef} className="h-6 w-full" />
      {isLoadingMore && (
        <div className="py-3 text-center font-mono text-[10px] uppercase tracking-wider text-[#898989]">
          {t.DASHBOARD.LOADING_MORE_NEWS}
        </div>
      )}
      {!hasMore && changelog.length > 0 && (
        <div className="py-3 text-center font-mono text-[10px] uppercase tracking-wider text-[#898989]">
          {t.DASHBOARD.NO_MORE_NEWS}
        </div>
      )}
    </div>
  );
}

