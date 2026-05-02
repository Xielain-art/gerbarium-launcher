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
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 className="font-minecraft text-lg font-bold uppercase tracking-wider text-theme">
        {t.DASHBOARD.NEWS_TITLE}
      </h2>
      <div className="grid w-full max-w-xl grid-cols-1 gap-3 md:grid-cols-2">
        <ShadcnSelect
          label={t.DASHBOARD.NEWS_FILTER_SORT_LABEL}
          value={order}
          onChange={(e) =>
            onOrderChange(e.target.value === "oldest" ? "oldest" : "newest")
          }
          options={[
            { label: t.DASHBOARD.NEWS_FILTER_SORT_NEWEST, value: "newest" },
            { label: t.DASHBOARD.NEWS_FILTER_SORT_OLDEST, value: "oldest" },
          ]}
        />
        <ShadcnSelect
          label={t.DASHBOARD.NEWS_FILTER_TAG_LABEL}
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
          options={[
            { label: t.DASHBOARD.NEWS_FILTER_TAG_ALL, value: "all" },
            ...availableTags.map((tag) => ({ label: tag.name, value: tag.id })),
          ]}
        />
      </div>
    </div>
  );
}

