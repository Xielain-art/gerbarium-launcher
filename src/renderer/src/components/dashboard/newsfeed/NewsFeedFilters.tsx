import { Select as ShadcnSelect } from "@/components/shadcn/ui";
import type { TranslationType } from "../../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  order: "newest" | "oldest";
  onOrderChange: (value: "newest" | "oldest") => void;
  selectedTag: string;
  onTagChange: (value: string) => void;
  availableTags: Array<{ id: string; name: string }>;
}

export function NewsFeedFilters({
  t,
  order,
  onOrderChange,
  selectedTag,
  onTagChange,
  availableTags,
}: Props): React.JSX.Element {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="font-sans text-xl font-medium tracking-tight text-[#fafafa]">
          {t.DASHBOARD.NEWS_TITLE}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#898989]">
          Stay updated with the latest changes and community news.
        </p>
      </div>
      <div className="flex w-full items-center gap-3 md:max-w-md">
        <div className="flex-1">
          <ShadcnSelect
            value={order}
            onChange={(e) =>
              onOrderChange(e.target.value === "oldest" ? "oldest" : "newest")
            }
            className="h-9 rounded-md border-[#2e2e2e] bg-[#0f0f0f] font-sans text-xs text-[#fafafa] transition-colors hover:border-[#363636] focus:ring-0"
            options={[
              { label: t.DASHBOARD.NEWS_FILTER_SORT_NEWEST, value: "newest" },
              { label: t.DASHBOARD.NEWS_FILTER_SORT_OLDEST, value: "oldest" },
            ]}
          />
        </div>
        <div className="flex-1">
          <ShadcnSelect
            value={selectedTag}
            onChange={(e) => onTagChange(e.target.value)}
            className="h-9 rounded-md border-[#2e2e2e] bg-[#0f0f0f] font-sans text-xs text-[#fafafa] transition-colors hover:border-[#363636] focus:ring-0"
            options={[
              { label: t.DASHBOARD.NEWS_FILTER_TAG_ALL, value: "all" },
              ...availableTags.map((tag) => ({ label: tag.name, value: tag.id })),
            ]}
          />
        </div>
      </div>
    </div>
  );
}

