import { marked } from "marked";
import { useEffect, useState } from "react";
import { DashboardContentDialog } from "./DashboardContentDialog";
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
    <DashboardContentDialog
      open={Boolean(news)}
      title={news.title}
      subtitle={new Date(news.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
      maxWidthClassName="max-w-4xl"
      onClose={onClose}
      footer={
        <button type="button" className="mc-btn mc-btn-sm" onClick={onClose}>
          {t.DASHBOARD.CLOSE}
        </button>
      }
    >
      <div className="p-5 pt-4">
        <img src={news.imageUrl || placeholderImage} alt={news.title} className="mb-4 max-h-72 w-full rounded object-cover" />
        <div className="prose prose-invert max-w-none break-words font-minecraft text-sm leading-relaxed text-theme-muted [&_a]:text-[var(--mc-accent)] [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-theme [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-theme [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-theme [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_code]:bg-black/30 [&_code]:px-1 [&_code]:rounded [&_code]:text-theme [&_pre]:bg-black/30 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-theme/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_p]:mb-2" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
      </div>
    </DashboardContentDialog>
  );
}
