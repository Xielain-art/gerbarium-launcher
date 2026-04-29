import { Button as ShadcnButton, Card as ShadcnCard, Checkbox as ShadcnCheckbox, Input as ShadcnInput, Select as ShadcnSelect } from "@/components/shadcn/ui";
import type { ApiChangelog } from "../../../../../lib/api/changelog";
import { stringifyChangelogChanges } from "../hooks/sections/useAdminChangelogSection";

interface Props {
  changelogTab: "all" | "create";
  setChangelogTab: (v: "all" | "create") => void;
  changelog: ApiChangelog[];
  changelogError: string | null;
  isLoadingChangelog: boolean;
  isAdminApiBusy: boolean;
  changelogFromDate: string; setChangelogFromDate: (v: string) => void;
  changelogToDate: string; setChangelogToDate: (v: string) => void;
  changelogMandatoryDraft: "all" | "mandatory" | "optional"; setChangelogMandatoryDraft: (v: "all" | "mandatory" | "optional") => void;
  changelogSortDraft: string; setChangelogSortDraft: (v: string) => void;
  changelogOrderDraft: string; setChangelogOrderDraft: (v: string) => void;
  setPreviewChangelog: (c: ApiChangelog) => void;
  startEditChangelog: (c: ApiChangelog) => void;
  handleDeleteChangelog: (id: string) => void;
  editingChangelog: ApiChangelog | null;
  changelogVersion: string; setChangelogVersion: (v: string) => void;
  changelogReleaseDate: string; setChangelogReleaseDate: (v: string) => void;
  changelogDownloadUrl: string; setChangelogDownloadUrl: (v: string) => void;
  changelogMandatory: boolean; setChangelogMandatory: React.Dispatch<React.SetStateAction<boolean>>;
  changelogChangesInput: string; setChangelogChangesInput: (v: string) => void;
  changelogFormError: string | null;
  resetChangelogForm: () => void;
  handleCreateChangelog: () => void;
  handleUpdateChangelog: () => void;
  changelogActionLoadingId: string | null;
}

export function AdminChangelogTab(p: Props) {
  return (
    <ShadcnCard className="p-6">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-minecraft text-xl font-bold">Управление changelog</h2><div className="flex gap-2"><ShadcnButton variant={p.changelogTab === "all" ? "default" : "secondary"} onClick={() => p.setChangelogTab("all")}>Все</ShadcnButton><ShadcnButton variant={p.changelogTab === "create" ? "default" : "secondary"} onClick={() => p.setChangelogTab("create")}>{p.editingChangelog ? "Редактировать" : "Создать"}</ShadcnButton></div></div>
      {p.changelogError && <div className="mb-3 font-minecraft text-xs text-red-500">{p.changelogError}</div>}
      {p.changelogTab === "all" && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnInput type="datetime-local" value={p.changelogFromDate} onChange={(e) => p.setChangelogFromDate(e.target.value)} />
            <ShadcnInput type="datetime-local" value={p.changelogToDate} onChange={(e) => p.setChangelogToDate(e.target.value)} />
            <ShadcnSelect label="Тип" value={p.changelogMandatoryDraft} onChange={(e) => p.setChangelogMandatoryDraft((typeof e === "string" ? e : e.target.value) as "all" | "mandatory" | "optional")} options={[{ label: "Все", value: "all" }, { label: "Mandatory", value: "mandatory" }, { label: "Optional", value: "optional" }]} />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2"><ShadcnSelect label="Сортировка" value={p.changelogSortDraft} onChange={(e) => p.setChangelogSortDraft(typeof e === "string" ? e : e.target.value)} options={[{ label: "Release", value: "releaseDate" }, { label: "Version", value: "version" }, { label: "Created", value: "createdAt" }]} /><ShadcnSelect label="Порядок" value={p.changelogOrderDraft} onChange={(e) => p.setChangelogOrderDraft(typeof e === "string" ? e : e.target.value)} options={[{ label: "Новые", value: "DESC" }, { label: "Старые", value: "ASC" }]} /></div>
          <div className="grid gap-3">{p.changelog.map((item) => <div key={item.id} className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-3"><div><div className="font-minecraft text-sm text-theme">v{item.version}</div><div className="font-minecraft text-[10px] text-theme-muted">{new Date(item.releaseDate).toLocaleDateString()}</div></div><div className="flex gap-2"><ShadcnButton size="sm" variant="secondary" onClick={() => p.setPreviewChangelog(item)}>View</ShadcnButton><ShadcnButton size="sm" variant="outline" onClick={() => p.startEditChangelog(item)} disabled={p.isAdminApiBusy}>Edit</ShadcnButton><ShadcnButton size="sm" variant="destructive" onClick={() => p.handleDeleteChangelog(item.id)} disabled={p.isAdminApiBusy}>Delete</ShadcnButton></div></div>)}</div>
          {p.changelog.length === 0 && !p.isLoadingChangelog && <div className="py-8 text-center font-minecraft text-theme-muted">Changelog записи не найдены.</div>}
        </>
      )}
      {p.changelogTab === "create" && (
        <div className="space-y-3 rounded border border-white/10 bg-black/10 p-4">
          <ShadcnInput placeholder="Версия" value={p.changelogVersion} onChange={(e) => p.setChangelogVersion(e.target.value)} />
          <ShadcnInput type="date" value={p.changelogReleaseDate} onChange={(e) => p.setChangelogReleaseDate(e.target.value)} />
          <ShadcnInput placeholder="Download URL" value={p.changelogDownloadUrl} onChange={(e) => p.setChangelogDownloadUrl(e.target.value)} />
          <ShadcnCheckbox label="Mandatory update" checked={p.changelogMandatory} onChange={() => p.setChangelogMandatory((prev) => !prev)} />
          <textarea className="min-h-[120px] w-full rounded border border-white/10 bg-black/20 p-2" value={p.changelogChangesInput} onChange={(e) => p.setChangelogChangesInput(e.target.value)} placeholder={stringifyChangelogChanges(["- change 1"])} />
          {p.changelogFormError && <div className="font-minecraft text-xs text-red-500">{p.changelogFormError}</div>}
          <div className="flex justify-end gap-2"><ShadcnButton variant="secondary" onClick={() => { p.resetChangelogForm(); p.setChangelogTab("all"); }}>Отмена</ShadcnButton><ShadcnButton variant="default" disabled={Boolean(p.changelogActionLoadingId)} onClick={p.editingChangelog ? p.handleUpdateChangelog : p.handleCreateChangelog}>{p.editingChangelog ? "Обновить" : "Создать"}</ShadcnButton></div>
        </div>
      )}
    </ShadcnCard>
  );
}
