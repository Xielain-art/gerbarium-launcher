import DOMPurify from "dompurify";
import { useMemo } from "react";
import type { NewsItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  news: NewsItem | null;
  placeholderImage: string;
  onClose: () => void;
}

export function NewsPreviewModal({ t, news, placeholderImage, onClose }: Props) {
  const sanitizedFullHtml = useMemo(
    () => (news?.htmlContent ? DOMPurify.sanitize(news.htmlContent) : ""),
    [news],
  );

  if (!news) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
      <div className="mc-card max-h-[85vh] w-full max-w-4xl overflow-y-auto overflow-x-hidden p-0">
        <div className="flex items-center justify-between border-b-[3px] border-theme p-4">
          <h3 className="font-minecraft text-lg text-theme">{news.title}</h3>
          <button type="button" className="mc-btn mc-btn-sm" onClick={onClose}>{t.DASHBOARD.CLOSE}</button>
        </div>
        <div className="p-5">
          <img src={news.imageUrl || placeholderImage} alt={news.title} className="mb-4 max-h-72 w-full rounded object-cover" />
          <div className="font-minecraft text-sm leading-relaxed text-theme-muted [&_a]:text-[var(--mc-accent)] [&_a]:underline" dangerouslySetInnerHTML={{ __html: sanitizedFullHtml || news.content }} />
        </div>
      </div>
    </div>
  );
}
