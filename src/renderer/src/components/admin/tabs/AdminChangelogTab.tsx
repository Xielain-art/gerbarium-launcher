import {
  Button as ShadcnButton,
  Card as ShadcnCard,
  Checkbox as ShadcnCheckbox,
  Input as ShadcnInput,
  Select as ShadcnSelect,
} from "@/components/shadcn/ui";
import type { ApiChangelog } from "../../../../../lib/api/changelog";
import { stringifyChangelogChanges } from "../hooks/sections/useAdminChangelogSection";


interface Props {
  changelogTab: "all" | "create";
  setChangelogTab: (v: "all" | "create") => void;
  changelog: ApiChangelog[];
  changelogError: string | null;
  isLoadingChangelog: boolean;
  isAdminApiBusy: boolean;
  changelogFromDate: string;
  setChangelogFromDate: (v: string) => void;
  changelogToDate: string;
  setChangelogToDate: (v: string) => void;
  changelogMandatoryDraft: "all" | "mandatory" | "optional";
  setChangelogMandatoryDraft: (v: "all" | "mandatory" | "optional") => void;
  changelogSortDraft: string;
  setChangelogSortDraft: (v: string) => void;
  changelogOrderDraft: string;
  setChangelogOrderDraft: (v: string) => void;
  setPreviewChangelog: (c: ApiChangelog) => void;
  startEditChangelog: (c: ApiChangelog) => void;
  handleDeleteChangelog: (id: string) => void;
  editingChangelog: ApiChangelog | null;
  changelogVersion: string;
  setChangelogVersion: (v: string) => void;
  changelogReleaseDate: string;
  setChangelogReleaseDate: (v: string) => void;
  changelogDownloadUrl: string;
  setChangelogDownloadUrl: (v: string) => void;
  changelogMandatory: boolean;
  setChangelogMandatory: React.Dispatch<React.SetStateAction<boolean>>;
  changelogChangesInput: string;
  setChangelogChangesInput: (v: string) => void;
  changelogFormError: string | null;
  resetChangelogForm: () => void;
  handleCreateChangelog: () => void;
  handleUpdateChangelog: () => void;
  changelogActionLoadingId: string | null;
}

export function AdminChangelogTab(p: Props): React.JSX.Element {
  return (
    <ShadcnCard className="p-6">
      {/* Header with tabs */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="font-minecraft text-xl font-bold">
            Управление changelog
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <ShadcnButton
            variant={p.changelogTab === "all" ? "default" : "ghost"}
            onClick={() => p.setChangelogTab("all")}
            size="sm"
          >
            📋 Все версии
          </ShadcnButton>
          <div className="ml-auto">
            <ShadcnButton
              variant="outline"
              onClick={() => p.setChangelogTab("create")}
              size="sm"
              className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
            >
              {p.editingChangelog
                ? "✏️ Редактировать версию"
                : "➕ Создать версию"}
            </ShadcnButton>
          </div>
        </div>
      </div>
      {p.changelogError && (
        <div className="mb-3 font-minecraft text-xs text-red-500">
          {p.changelogError}
        </div>
      )}
      {p.changelogTab === "all" && (
        <>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnInput
              label="От даты"
              type="datetime-local"
              value={p.changelogFromDate}
              onChange={(e) => p.setChangelogFromDate(e.target.value)}
            />
            <ShadcnInput
              label="До даты"
              type="datetime-local"
              value={p.changelogToDate}
              onChange={(e) => p.setChangelogToDate(e.target.value)}
            />
            <ShadcnSelect
              label="Тип"
              value={p.changelogMandatoryDraft}
              onChange={(e) =>
                p.setChangelogMandatoryDraft(
                  (typeof e === "string" ? e : e.target.value) as
                    | "all"
                    | "mandatory"
                    | "optional",
                )
              }
              options={[
                { label: "Все", value: "all" },
                { label: "Mandatory", value: "mandatory" },
                { label: "Optional", value: "optional" },
              ]}
            />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ShadcnSelect
              label="Сортировка"
              value={p.changelogSortDraft}
              onChange={(e) =>
                p.setChangelogSortDraft(
                  typeof e === "string" ? e : e.target.value,
                )
              }
              options={[
                { label: "Release", value: "releaseDate" },
                { label: "Version", value: "version" },
                { label: "Created", value: "createdAt" },
              ]}
            />
            <ShadcnSelect
              label="Порядок"
              value={p.changelogOrderDraft}
              onChange={(e) =>
                p.setChangelogOrderDraft(
                  typeof e === "string" ? e : e.target.value,
                )
              }
              options={[
                { label: "Новые", value: "DESC" },
                { label: "Старые", value: "ASC" },
              ]}
            />
            <div />
          </div>
          <div className="grid gap-3">
            {p.changelog.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-3"
              >
                <div>
                  <div className="font-minecraft text-sm text-theme">
                    v{item.version}
                  </div>
                  <div className="font-minecraft text-[10px] text-theme-muted">
                    {new Date(item.releaseDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <ShadcnButton
                    size="sm"
                    variant="secondary"
                    onClick={() => p.setPreviewChangelog(item)}
                  >
                    View
                  </ShadcnButton>
                  <ShadcnButton
                    size="sm"
                    variant="outline"
                    onClick={() => p.startEditChangelog(item)}
                    disabled={p.isAdminApiBusy}
                  >
                    Edit
                  </ShadcnButton>
                  <ShadcnButton
                    size="sm"
                    variant="destructive"
                    onClick={() => p.handleDeleteChangelog(item.id)}
                    disabled={p.isAdminApiBusy}
                  >
                    Delete
                  </ShadcnButton>
                </div>
              </div>
            ))}
          </div>
          {p.changelog.length === 0 && !p.isLoadingChangelog && (
            <div className="py-8 text-center font-minecraft text-theme-muted">
              Changelog записи не найдены.
            </div>
          )}
        </>
      )}
      {p.changelogTab === "create" && (
        <div>
          {/* Mode Indicator Banner */}
          <div className="mb-6 rounded-lg border-2 border-dashed border-theme/40 bg-gradient-to-r from-theme/10 via-theme/5 to-transparent p-5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-theme/30 shadow-md">
                <span className="text-xl">{p.editingChangelog ? "✏️" : "➕"}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-minecraft text-base font-bold text-theme">
                  {p.editingChangelog
                    ? `Режим редактирования: v${p.editingChangelog.version}`
                    : "Режим создания версии"}
                </h3>
                <p className="mt-1 font-minecraft text-xs text-theme-muted">
                  {p.editingChangelog
                    ? "Внесите изменения в форму ниже и нажмите кнопку 'Обновить' в конце страницы"
                    : "Заполните все необходимые поля и нажмите кнопку 'Создать' в конце страницы"}
                </p>
              </div>
              <ShadcnButton
                variant="ghost"
                size="sm"
                onClick={() => p.setChangelogTab("all")}
                className="shrink-0"
              >
                ✕ Закрыть
              </ShadcnButton>
            </div>
          </div>

          {/* Form Container */}
          <div className="space-y-4 rounded-lg border border-white/10 bg-black/10 p-6">
            <h4 className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme/70">
              Данные версии
            </h4>

            <ShadcnInput
              placeholder="Версия"
              value={p.changelogVersion}
              onChange={(e) => p.setChangelogVersion(e.target.value)}
            />
            <ShadcnInput
              type="date"
              value={p.changelogReleaseDate}
              onChange={(e) => p.setChangelogReleaseDate(e.target.value)}
            />
            <ShadcnInput
              placeholder="Download URL"
              value={p.changelogDownloadUrl}
              onChange={(e) => p.setChangelogDownloadUrl(e.target.value)}
            />
            <ShadcnCheckbox
              label="Mandatory update"
              checked={p.changelogMandatory}
              onChange={() => p.setChangelogMandatory((prev) => !prev)}
            />
            <textarea
              className="min-h-[120px] w-full rounded border border-white/10 bg-black/20 p-2 font-mono text-sm text-theme"
              value={p.changelogChangesInput}
              onChange={(e) => p.setChangelogChangesInput(e.target.value)}
              placeholder={stringifyChangelogChanges(["- change 1"])}
            />
            {p.changelogFormError && (
              <div className="font-minecraft text-xs text-red-500">
                {p.changelogFormError}
              </div>
            )}

            {/* Action Buttons - Prominent */}
            <div className="mt-6 flex justify-end gap-3 border-t-2 border-theme/20 pt-6">
              <ShadcnButton
                variant="secondary"
                onClick={() => {
                  p.resetChangelogForm();
                  p.setChangelogTab("all");
                }}
                size="default"
              >
                ✕ Отмена
              </ShadcnButton>
              <ShadcnButton
                variant="default"
                disabled={Boolean(p.changelogActionLoadingId)}
                onClick={
                  p.editingChangelog
                    ? p.handleUpdateChangelog
                    : p.handleCreateChangelog
                }
                size="default"
                className="min-w-[160px] bg-green-600 font-bold hover:bg-green-700"
              >
                {p.editingChangelog ? "💾 Обновить версию" : "✅ Создать версию"}
              </ShadcnButton>
            </div>
          </div>
        </div>
      )}
    </ShadcnCard>
  );
}