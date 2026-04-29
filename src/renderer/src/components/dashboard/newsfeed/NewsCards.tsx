import { Card } from "../../ui/Card";
import type { NewsItem } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";

function getCategoryColor(category: string) {
  const colors: Record<string, string> = { update: "bg-[#3a753a]", event: "bg-[#8b5a2a]", community: "bg-[#5a5a8b]", announcement: "bg-[#8b2a2a]" };
  return colors[category] || "bg-[#5a5a5a]";
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

interface Props {
  t: TranslationType;
  news: NewsItem[];
  placeholderImage: string;
  onSelectNews: (news: NewsItem) => void;
}

export function NewsCards({ t, news, placeholderImage, onSelectNews }: Props) {
  return (
    <div className="grid gap-5">
      {news.map((item) => {
        const plainText = stripMarkdown(item.content);
        const preview = plainText.slice(0, 260) + (plainText.length > 260 ? "..." : "");
        
        return (
          <Card key={item.id} className="overflow-hidden p-0">
            <div className="mb-4 h-48 w-full overflow-hidden rounded-none border-b-[3px] border-theme"><img src={item.imageUrl || placeholderImage} alt={item.title} className="h-full w-full object-cover transition-transform hover:scale-105" style={{ imageRendering: "pixelated" }} /></div>
            <div className="mb-3 flex items-center gap-3">
              {(item.tags?.length ?? 0) > 0 ? <div className="flex flex-wrap items-center gap-2">{item.tags!.map((tag) => <span key={`${item.id}-${tag}`} className="bg-[#3b3b3b] px-3 py-1 font-minecraft text-xs font-bold text-white">{tag}</span>)}</div> : <span className={`px-3 py-1 font-minecraft text-xs font-bold text-white ${getCategoryColor(item.category)}`}>{t.NEWS.CATEGORIES[item.category as keyof typeof t.NEWS.CATEGORIES] || item.category}</span>}
              <span className="font-minecraft text-xs text-theme-muted">{new Date(item.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <h3 className="mb-3 font-minecraft text-lg font-bold text-theme">{item.title}</h3>
            <p className="font-minecraft text-sm leading-relaxed text-theme-muted">{preview}</p>
            <div className="mt-4"><button type="button" className="mc-btn mc-btn-sm mc-btn-primary" onClick={() => onSelectNews(item)}>{t.DASHBOARD.READ_MORE}</button></div>
          </Card>
        );
      })}
    </div>
  );
}
