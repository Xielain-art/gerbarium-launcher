import { Button } from "../../shadcn/ui";
import type { NewsItem } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    update: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    event: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
    community: "bg-[var(--accent)] text-[var(--accent-foreground)]",
    announcement: "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
  };
  return colors[category] || "bg-[var(--muted)] text-[var(--muted-foreground)]";
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
    .replace(/\*(.+?)\*/g, "$1") // Italic
    .replace(/__(.+?)__/g, "$1") // Underline
    .replace(/_(.+?)_/g, "$1") // Alternative italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links
    .replace(/`(.+?)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/^>\s+/gm, "") // Blockquotes
    .replace(/^[-*+]\s+/gm, "") // Unordered lists
    .replace(/^\d+\.\s+/gm, "") // Ordered lists
    .replace(/\n+/g, " ") // Newlines to spaces
    .trim();
}

interface Props {
  t: TranslationType;
  news: NewsItem[];
  placeholderImage: string;
  onSelectNews: (news: NewsItem) => void;
}

export function NewsCards({
  t,
  news,
  placeholderImage,
  onSelectNews,
}: Props): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
      {news.map((item) => {
        const plainText = stripMarkdown(item.content);
        const preview =
          plainText.slice(0, 160) + (plainText.length > 160 ? "..." : "");

        return (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-[#2e2e2e] bg-[#171717] transition-all hover:border-[#363636]"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={item.imageUrl || placeholderImage}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(item.tags?.length ?? 0) > 0 ? (
                    item.tags!.map((tag) => (
                      <span
                        key={`${item.id}-${tag}`}
                        className="rounded border border-[#2e2e2e] bg-[#0f0f0f] px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-[#898989]"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white",
                        getCategoryColor(item.category),
                      )}
                    >
                      {t.NEWS.CATEGORIES[
                        item.category as keyof typeof t.NEWS.CATEGORIES
                      ] || item.category}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] font-medium text-[#898989]">
                  {new Date(item.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <h3 className="mb-2 line-clamp-2 font-sans text-base font-medium text-[#fafafa]">
                {item.title}
              </h3>
              <p className="mb-4 line-clamp-3 flex-1 font-sans text-xs leading-relaxed text-[#898989]">
                {preview}
              </p>
              <div className="mt-auto">
                <button
                  type="button"
                  onClick={() => onSelectNews(item)}
                  className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#3ecf8e] transition-all hover:gap-3 hover:text-[#00c573]"
                >
                  {t.DASHBOARD.READ_MORE}
                  <span className="text-lg leading-none">→</span>
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

