import { Button } from "../../shadcn/ui";

interface Props {
  isLoadingNews: boolean;
  newsError?: string | null;
  loadingText: string;
  failedText: string;
  tryAgainText: string;
  children: React.ReactNode;
}

export function NewsFeedState({
  isLoadingNews,
  newsError,
  loadingText,
  failedText,
  tryAgainText,
  children,
}: Props): React.JSX.Element {
  if (isLoadingNews) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--mc-accent)] border-t-transparent" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-theme-muted">
            {loadingText}
          </span>
        </div>
      </div>
    );
  }

  if (newsError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="font-sans text-lg font-medium text-[color:var(--destructive)]">{failedText}</div>
        <div className="max-w-md font-sans text-sm text-theme-muted">
          {newsError}
        </div>
        <Button onClick={() => window.location.reload()} className="mt-2 border-theme bg-[var(--theme-surface-soft)] hover:bg-[var(--theme-surface)]">
          {tryAgainText}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
