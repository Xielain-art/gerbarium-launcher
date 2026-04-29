import { marked } from "marked";
import { useState, useEffect } from "react";
import type { NewsItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  news: NewsItem | null;
  placeholderImage: string;
  onClose: () => void;
}

export function NewsPreviewModal({ t, news, placeholderImage, onClose }: Props) {
  const [renderedMarkdown, setRenderedMarkdown] = useState("");

  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }, []);

  useEffect(() => {
    const renderContent = async () => {
      if (news?.content) {
        try {
          const html = await marked.parse(news.content);
          setRenderedMarkdown(html);
        } catch {
          setRenderedMarkdown(news.content);
        }
      } else {
        setRenderedMarkdown("");
      }
    };
    void renderContent();
  }, [news]);

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
          <div className="prose prose-invert max-w-none font-minecraft text-sm leading-relaxed text-theme-muted [&_a]:text-[var(--mc-accent)] [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-theme [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-theme [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-theme [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_code]:bg-black/30 [&_code]:px-1 [&_code]:rounded [&_code]:text-theme [&_pre]:bg-black/30 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-theme/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
        </div>
      </div>
    </div>
  );
}
