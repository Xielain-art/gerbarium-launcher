import {
  Button as ShadcnButton,
  Input as ShadcnInput,


} from "@/components/shadcn/ui";


import type { AdminNewsTabProps } from "./types";

export function NewsTagsSubTab(props: AdminNewsTabProps) {
  const { newNewsTagName, setNewNewsTagName, filteredNewsTags, isLoadingNewsTags, editingTagId, setEditingTagId, editingTagName, setEditingTagName, handleCreateNewsTag, handleUpdateNewsTag, handleDeleteNewsTag, isAdminApiBusy, newsTagFormError } = props;
  return (<>

        <div className="space-y-3 rounded border border-white/10 bg-black/10 p-4">
          <div className="flex gap-2">
            <ShadcnInput
              value={newNewsTagName}
              onChange={(e) => setNewNewsTagName(e.target.value)}
              placeholder="Новый тег"
            />
            <ShadcnButton onClick={handleCreateNewsTag} disabled={isAdminApiBusy}>
              Добавить
            </ShadcnButton>
          </div>
          {newsTagFormError && (
            <div className="font-minecraft text-xs text-red-500">
              {newsTagFormError}
            </div>
          )}
          {isLoadingNewsTags && (
            <div className="font-minecraft text-xs text-theme-muted">
              Загрузка тегов...
            </div>
          )}
          {filteredNewsTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-2"
            >
              {editingTagId === tag.id ? (
                <div className="flex w-full gap-2">
                  <ShadcnInput
                    value={editingTagName}
                    onChange={(e) => setEditingTagName(e.target.value)}
                  />
                  <ShadcnButton size="sm" onClick={handleUpdateNewsTag}>
                    Сохранить
                  </ShadcnButton>
                </div>
              ) : (
                <>
                  <span>{tag.name}</span>
                  <div className="flex gap-2">
                    <ShadcnButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTagId(tag.id);
                        setEditingTagName(tag.name);
                      }}
                    >
                      Редактировать
                    </ShadcnButton>
                    <ShadcnButton
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteNewsTag(tag.id)}
                    >
                      Удалить
                    </ShadcnButton>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

  </>);
}
