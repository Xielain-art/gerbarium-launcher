import { useMemo } from "react";
import { DashboardContentDialog } from "./DashboardContentDialog";
import { renderMarkdownToSafeHtml } from "../../lib/markdown";
import type { NewsItem } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { Button } from "../shadcn/ui";

interface Props {
  t: TranslationType;
  news: NewsItem | null;
  placeholderImage: string;
  onClose: () => void;
}

export function NewsPreviewModal({ t, news, placeholderImage, onClose }: Props) {
  const renderedMarkdown = useMemo(
    () => (news?.content ? renderMarkdownToSafeHtml(news.content) : ""),
    [news],
  );

  if (!news) return null;

  return (
    <DashboardContentDialog
      open={Boolean(news)}
      title={news.title}
      subtitle={new Date(news.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
      maxWidthClassName="max-w-4xl"
      onClose={onClose}
      footer={
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          {t.DASHBOARD.CLOSE}
        </Button>
      }
    >
      <div className="p-5 pt-4">
        <img src={news.imageUrl || placeholderImage} alt={news.title} className="mb-4 max-h-72 w-full rounded object-cover" />
        <div className="max-w-none break-words text-sm leading-relaxed text-[var(--muted-foreground)] [&_a]:text-[var(--primary)] [&_a]:underline [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[var(--foreground)] [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[var(--foreground)] [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_code]:rounded [&_code]:bg-[var(--muted)] [&_code]:px-1 [&_code]:text-[var(--foreground)] [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-[var(--muted)] [&_pre]:p-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_p]:mb-3" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
      </div>
    </DashboardContentDialog>
  );
}
