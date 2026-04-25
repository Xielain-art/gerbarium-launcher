import { Card } from "../ui/Card";
import type { NewsItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    update: "bg-[#3a753a]",
    event: "bg-[#8b5a2a]",
    community: "bg-[#5a5a8b]",
    announcement: "bg-[#8b2a2a]",
  };
  return colors[category] || "bg-[#5a5a5a]";
}

interface NewsFeedProps {
  t: TranslationType;
  news: NewsItem[];
  isLoadingNews: boolean;
  placeholderImage: string;
}

export function NewsFeed({
  t,
  news,
  isLoadingNews,
  placeholderImage,
}: NewsFeedProps) {
  return (
    <div className="px-6">
      <h2 className="mb-6 font-minecraft text-lg font-bold uppercase tracking-wider text-[#e0e0e0]">
        {t.DASHBOARD.NEWS_TITLE}
      </h2>

      <div className="grid gap-5">
        {isLoadingNews
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mc-card animate-pulse">
                <div className="mb-4 h-48 bg-gray-700" />
                <div className="mb-3 h-6 w-2/3 bg-gray-700" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-700" />
                  <div className="h-4 w-5/6 bg-gray-700" />
                </div>
              </div>
            ))
          : news.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden p-0"
              >
                <div className="mb-4 h-48 w-full overflow-hidden rounded-none border-b-[3px] border-[#1a1a1a]">
                  <img
                    src={placeholderImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`px-3 py-1 font-minecraft text-xs font-bold text-[#e0e0e0] ${getCategoryColor(item.category)}`}
                  >
                    {t.NEWS.CATEGORIES[item.category as keyof typeof t.NEWS.CATEGORIES] || item.category}
                  </span>
                  <span className="font-minecraft text-xs text-[#6a6a6a]">
                    {new Date(item.date).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="mb-3 font-minecraft text-lg font-bold text-[#e0e0e0]">
                  {item.title}
                </h3>
                <p className="font-minecraft text-sm leading-relaxed text-[#a0a0a0]">
                  {item.content}
                </p>
              </Card>
            ))}
      </div>
    </div>
  );
}
