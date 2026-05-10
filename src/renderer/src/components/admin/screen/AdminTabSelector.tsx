import { Button as ButtonShadcn } from "@/components/shadcn/ui/button";
import type { AdminTab } from "../hooks/useAdminScreenModel";
import type { TranslationType } from "../../../../shared/constants/translations";

interface AdminTabSelectorProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  t: TranslationType;
}

export function AdminTabSelector({
  activeTab,
  setActiveTab,
  t,
}: AdminTabSelectorProps): React.JSX.Element {
  return (
    <div className="mb-6 flex gap-2">
      <ButtonShadcn
        variant={activeTab === "users" ? "default" : "secondary"}
        onClick={() => setActiveTab("users")}
        className="font-mono uppercase tracking-wider"
      >
        {t.ADMIN.TAB_USERS}
      </ButtonShadcn>
      <ButtonShadcn
        variant={activeTab === "news" ? "default" : "secondary"}
        onClick={() => setActiveTab("news")}
        className="font-mono uppercase tracking-wider"
      >
        {t.ADMIN.TAB_NEWS}
      </ButtonShadcn>
      <ButtonShadcn
        variant={activeTab === "changelog" ? "default" : "secondary"}
        onClick={() => setActiveTab("changelog")}
        className="font-mono uppercase tracking-wider"
      >
        Changelog
      </ButtonShadcn>
      <ButtonShadcn
        variant={activeTab === "stats" ? "default" : "secondary"}
        onClick={() => setActiveTab("stats")}
        className="font-mono uppercase tracking-wider"
      >
        Stats
      </ButtonShadcn>
    </div>
  );
}
