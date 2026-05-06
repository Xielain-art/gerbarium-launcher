import { Button as ShadcnButton } from "@/components/shadcn/ui/button";
import { Card as ShadcnCard } from "@/components/shadcn/ui/card";

import type { AdminNewsTabProps as Props } from "./news/types";
import { NewsListSubTab } from "./news/NewsListSubTab";
import { NewsFormSubTab } from "./news/NewsFormSubTab";
import { NewsTagsSubTab } from "./news/NewsTagsSubTab";

export function AdminNewsTab(props: Props): React.JSX.Element {
  const {
    newsTab,
    setNewsTab,
    isApplyingNewsFilters,
    editingNews,
    resetNewsForm,
    newsTitle,
    newsSlug,
    newsImage,
    newsContentHtml,
    selectedNewsTagIds,
  } = props;

  const hasUnsavedChanges = Boolean(
    newsTab === "create" &&
    (newsTitle ||
      newsSlug ||
      newsImage ||
      newsContentHtml ||
      selectedNewsTagIds.length > 0)
  );

  function handleTabSwitch(tab: "all" | "create" | "tags"): void {
    if (tab === "create" && newsTab !== "create") {
      resetNewsForm();
    }
    setNewsTab(tab);
  }

  return (
    <ShadcnCard className="p-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xl font-bold">
            Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ Ð½Ð¾Ð²Ð¾ÑÑ‚ÑÐ¼Ð¸
          </h2>
          {isApplyingNewsFilters ? (
            <span className="font-mono text-[10px] uppercase text-theme-muted">
              Ð¤Ð¸Ð»ÑŒÑ‚Ñ€Ð°Ñ†Ð¸Ñ...
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <ShadcnButton
            variant={newsTab === "all" ? "default" : "ghost"}
            onClick={() => handleTabSwitch("all")}
            disabled={hasUnsavedChanges}
            size="sm"
          >
            Ð’ÑÐµ Ð½Ð¾Ð²Ð¾ÑÑ‚Ð¸
          </ShadcnButton>
          <ShadcnButton
            variant={newsTab === "tags" ? "default" : "ghost"}
            onClick={() => handleTabSwitch("tags")}
            disabled={hasUnsavedChanges}
            size="sm"
          >
            Ð¢ÐµÐ³Ð¸
          </ShadcnButton>
          <div className="ml-auto">
            <ShadcnButton
              variant="outline"
              onClick={() => handleTabSwitch("create")}
              size="sm"
              className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
            >
              {editingNews ? "Ð ÐµÐ´Ð°ÐºÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð½Ð¾Ð²Ð¾ÑÑ‚ÑŒ" : "Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð½Ð¾Ð²Ð¾ÑÑ‚ÑŒ"}
            </ShadcnButton>
          </div>
        </div>
      </div>

      {newsTab === "all" ? <NewsListSubTab {...props} /> : null}

      {newsTab === "create" ? <NewsFormSubTab {...props} /> : null}

      {newsTab === "tags" ? <NewsTagsSubTab {...props} /> : null}
    </ShadcnCard>
  );
}

