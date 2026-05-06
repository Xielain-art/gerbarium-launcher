import {
  Button as ShadcnButton,
  Card as ShadcnCard,



} from "@/components/shadcn/ui";

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
    selectedNewsTagIds
  } = props;

  const hasUnsavedChanges =
    newsTab === "create" &&
    (newsTitle ||
      newsSlug ||
      newsImage ||
      newsContentHtml ||
      selectedNewsTagIds.length > 0);

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
            Управление новостями
          </h2>
          {isApplyingNewsFilters && (
            <span className="font-mono text-[10px] uppercase text-theme-muted">
              Фильтрация...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <ShadcnButton
            variant={newsTab === "all" ? "default" : "ghost"}
            onClick={() => handleTabSwitch("all")}
            disabled={newsTab === "create" && hasUnsavedChanges}
            size="sm"
          >
            Все новости
          </ShadcnButton>
          <ShadcnButton
            variant={newsTab === "tags" ? "default" : "ghost"}
            onClick={() => handleTabSwitch("tags")}
            disabled={newsTab === "create" && hasUnsavedChanges}
            size="sm"
          >
            Теги
          </ShadcnButton>
          <div className="ml-auto">
            <ShadcnButton
              variant="outline"
              onClick={() => handleTabSwitch("create")}
              size="sm"
              className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
            >
              {editingNews ? "Редактировать новость" : "Создать новость"}
            </ShadcnButton>
          </div>
        </div>
      </div>

      {newsTab === "all" && <NewsListSubTab {...props} />}

      {newsTab === "create" && <NewsFormSubTab {...props} />}

      {newsTab === "tags" && <NewsTagsSubTab {...props} />}
    </ShadcnCard>
  );
}

