import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string;
  return DOMPurify.sanitize(rawHtml);
}


