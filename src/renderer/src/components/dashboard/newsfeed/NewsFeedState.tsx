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
          <div className="mc-spinner h-10 w-10 rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <span className="text-xs text-[var(--muted-foreground)]">
            {loadingText}
          </span>
        </div>
      </div>
    );
  }

  if (newsError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-lg text-[var(--destructive)]">{failedText}</div>
        <div className="max-w-md text-sm text-[var(--muted-foreground)]">
          {newsError}
        </div>
        <Button onClick={() => window.location.reload()} className="mt-2">
          {tryAgainText}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

