import { Button } from "../../shadcn/ui";
import type { NewsItem } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";

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
    <div className="grid gap-5">
      {news.map((item) => {
        const plainText = stripMarkdown(item.content);
        const preview =
          plainText.slice(0, 260) + (plainText.length > 260 ? "..." : "");

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-0 text-[var(--card-foreground)] shadow-[var(--shadow-md)]"
          >
            <div className="mb-4 h-48 w-full overflow-hidden border-b border-[var(--border)]">
              <img
                src={item.imageUrl || placeholderImage}
                alt={item.title}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="px-4 pb-4">
              <div className="mb-3 flex items-center gap-3">
                {(item.tags?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {item.tags!.map((tag) => (
                      <span
                        key={`${item.id}-${tag}`}
                        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`rounded-[var(--radius)] px-3 py-1 text-xs font-semibold ${getCategoryColor(
                      item.category,
                    )}`}
                  >
                    {t.NEWS.CATEGORIES[
                      item.category as keyof typeof t.NEWS.CATEGORIES
                    ] || item.category}
                  </span>
                )}
                <span className="text-xs text-[var(--muted-foreground)]">
                  {new Date(item.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h3 className="mb-3 break-words text-lg font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p
                className="break-words text-sm leading-relaxed text-[var(--muted-foreground)]"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {preview}
              </p>
              <div className="mt-4">
                <Button type="button" size="sm" onClick={() => onSelectNews(item)}>
                  {t.DASHBOARD.READ_MORE}
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

