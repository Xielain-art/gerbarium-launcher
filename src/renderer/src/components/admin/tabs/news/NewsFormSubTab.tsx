import {
  Button as ShadcnButton,
  Input as ShadcnInput,

  MultiSelect,
} from "@/components/shadcn/ui";
import MDEditor from "@uiw/react-md-editor";
import { cn } from "@/lib/utils";
import type { AdminNewsTabProps } from "./types";

export function NewsFormSubTab(props: AdminNewsTabProps) {
  const { newsFormValidation, newsTagValidation, setNewsTab, newsTags, editingNews, newsTitle, setNewsTitle, newsSlug, setNewsSlug, newsImage, setNewsImage, newsContentHtml, setNewsContentHtml, selectedNewsTagIds, setSelectedNewsTagIds, newNewsTagName, setNewNewsTagName, newsFormError, newsActionLoadingId, handleCreateNews, handleUpdateNews, handleCreateNewsTag, isAdminApiBusy } = props;
  return (<>

        <div className="space-y-4">
          <div className="rounded border border-white/10 bg-black/10 p-4">
            <h3 className="mb-4 font-mono text-sm font-bold">
              {editingNews ? "Редактирование новости" : "Создание новости"}
            </h3>

            <div>
              <ShadcnInput
                label="Заголовок"
                placeholder="Заголовок новости"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                onBlur={() => newsFormValidation.handleBlur("title")}
                className={cn(
                  newsFormValidation.titleValidation.touched &&
                    !newsFormValidation.titleValidation.isValid &&
                    "border-red-500",
                )}
              />
              {newsFormValidation.titleValidation.touched &&
                newsFormValidation.titleValidation.error && (
                  <p className="mt-1 font-mono text-xs text-red-500">
                    {newsFormValidation.titleValidation.error}
                  </p>
                )}
            </div>

            <div>
              <ShadcnInput
                label="Slug"
                placeholder="news-slug"
                value={newsSlug}
                onChange={(e) => setNewsSlug(e.target.value)}
                onBlur={() => newsFormValidation.handleBlur("slug")}
                className={cn(
                  newsFormValidation.slugValidation.touched &&
                    !newsFormValidation.slugValidation.isValid &&
                    "border-red-500",
                )}
              />
              {newsFormValidation.slugValidation.touched &&
                newsFormValidation.slugValidation.error && (
                  <p className="mt-1 font-mono text-xs text-red-500">
                    {newsFormValidation.slugValidation.error}
                  </p>
                )}
            </div>

            <div>
              <ShadcnInput
                label="Изображение (URL)"
                placeholder="https://example.com/image.jpg"
                value={newsImage}
                onChange={(e) => setNewsImage(e.target.value)}
                onBlur={() => newsFormValidation.handleBlur("image")}
                className={cn(
                  newsFormValidation.imageValidation.touched &&
                    !newsFormValidation.imageValidation.isValid &&
                    "border-red-500",
                )}
              />
              {newsFormValidation.imageValidation.touched &&
                newsFormValidation.imageValidation.error && (
                  <p className="mt-1 font-mono text-xs text-red-500">
                    {newsFormValidation.imageValidation.error}
                  </p>
                )}
            </div>

            <MultiSelect
              label="Теги"
              placeholder="Выберите теги..."
              options={newsTags.map((tag) => ({
                label: tag.name,
                value: tag.id,
              }))}
              value={selectedNewsTagIds}
              onChange={setSelectedNewsTagIds}
            />

            <div>
              <div className="flex gap-2">
                <ShadcnInput
                  placeholder="Новый тег"
                  value={newNewsTagName}
                  onChange={(e) => setNewNewsTagName(e.target.value)}
                  onBlur={newsTagValidation.handleBlur}
                  className={cn(
                    newsTagValidation.touched &&
                      !newsTagValidation.isValid &&
                      "border-red-500",
                  )}
                />
                <ShadcnButton
                  size="sm"
                  variant="outline"
                  onClick={handleCreateNewsTag}
                  disabled={isAdminApiBusy || !newsTagValidation.isValid}
                >
                  Добавить тег
                </ShadcnButton>
              </div>
              {newsTagValidation.touched && newsTagValidation.error && (
                <p className="mt-1 font-mono text-xs text-red-500">
                  {newsTagValidation.error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-mono text-sm text-theme">
                Содержание (Markdown)
              </label>
              <div data-color-mode="dark">
                <MDEditor
                  value={newsContentHtml}
                  onChange={(val) => setNewsContentHtml(val || "")}
                  onBlur={() => newsFormValidation.handleBlur("content")}
                  preview="edit"
                  height={300}
                  visibleDragbar={false}
                />
              </div>
              {newsFormValidation.contentValidation.touched &&
                newsFormValidation.contentValidation.error && (
                  <p className="mt-1 font-mono text-xs text-red-500">
                    {newsFormValidation.contentValidation.error}
                  </p>
                )}
            </div>

            {newsFormError && (
              <div className="font-mono text-xs text-red-500">
                {newsFormError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t-2 border-theme/20 pt-6">
              <ShadcnButton
                variant="secondary"
                onClick={() => setNewsTab("all")}
                size="default"
              >
                Отмена
              </ShadcnButton>
              <ShadcnButton
                variant="default"
                onClick={editingNews ? handleUpdateNews : handleCreateNews}
                disabled={
                  Boolean(newsActionLoadingId) || !newsFormValidation.isFormValid
                }
                size="default"
                className="min-w-[160px] bg-green-600 font-bold hover:bg-green-700"
              >
                {editingNews ? "Обновить новость" : "Создать новость"}
              </ShadcnButton>
            </div>
          </div>
        </div>

  </>);
}
