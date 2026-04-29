interface Props {
  isLoadingNews: boolean;
  newsError?: string | null;
  loadingText: string;
  failedText: string;
  tryAgainText: string;
  children: React.ReactNode;
}

export function NewsFeedState({ isLoadingNews, newsError, loadingText, failedText, tryAgainText, children }: Props) {
  if (isLoadingNews) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="mc-spinner h-10 w-10 rounded-full border-2 border-[var(--mc-accent)] border-t-transparent" />
          <span className="font-minecraft text-xs text-theme-muted">{loadingText}</span>
        </div>
      </div>
    );
  }
  if (newsError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="font-minecraft text-lg text-red-500">{failedText}</div>
        <div className="max-w-md font-minecraft text-sm text-theme-muted">{newsError}</div>
        <button onClick={() => window.location.reload()} className="mc-btn mc-btn-primary mt-2">{tryAgainText}</button>
      </div>
    );
  }
  return <>{children}</>;
}
