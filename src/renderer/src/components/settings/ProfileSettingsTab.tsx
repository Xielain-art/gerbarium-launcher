import { useState } from "react";
import { Button, Input, Modal, ModalActions } from "../ui";
import { Avatar } from "../game/Avatar";
import type { ProfileSettingsTabProps } from "./types";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProfileSettingsTab({
  t,
  profile,
  user,
  onUpdateProfile,
  onDeleteAccount,
  onRequestDeleteCode,
  deletionNotice,
}: ProfileSettingsTabProps): React.JSX.Element {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const skinUrl = profile.skinUrl || "";
  const capeUrl = profile.capeUrl || "";

  const skinUrlError =
    skinUrl.length > 0 && !isValidHttpUrl(skinUrl)
      ? t.SETTINGS.PROFILE.URL_VALIDATION_ERROR
      : undefined;

  const capeUrlError =
    capeUrl.length > 0 && !isValidHttpUrl(capeUrl)
      ? t.SETTINGS.PROFILE.URL_VALIDATION_ERROR
      : undefined;

  const displayUsername = user?.username || profile.username;
  const displayMinecraftUsername = displayUsername;
  const displaySkinUrl = profile.skinUrl;

  const rolesText = user?.roles?.map((role) => role.name).join(", ") || "user";
  const bannedText = user?.isBanned ? "Yes" : "No";

  const handleDeleteClick = async (): Promise<void> => {
    setIsRequestingCode(true);
    const result = await onRequestDeleteCode();
    setIsRequestingCode(false);
    if (result.success) {
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    setIsDeleting(true);
    const result = await onDeleteAccount(deleteCode);
    setIsDeleting(false);
    if (result.success) {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-theme">
        {t.SETTINGS.PROFILE.TITLE}
      </h2>

      <div className="rounded border-[3px] border-t-[var(--mc-panel-border-lo)] border-l-[var(--mc-panel-border-lo)] border-b-[var(--mc-panel-border-hi)] border-r-[var(--mc-panel-border-hi)] bg-[var(--mc-input-bg)] p-4 shadow-[inset_2px_2px_0px_var(--mc-panel-border-lo),inset_-2px_-2px_0px_var(--mc-panel-border-hi)]">
        <div className="flex items-start gap-4">
          <Avatar
            username={displayMinecraftUsername}
            skinUrl={displaySkinUrl}
            size="xl"
          />
          <div className="space-y-1 font-minecraft text-xs text-theme">
            <div>
              <span className="text-theme-muted">Email:</span>{" "}
              {user?.email || "-"}
            </div>
            <div>
              <span className="text-theme-muted">Roles:</span> {rolesText}
            </div>
            <div>
              <span className="text-theme-muted">Banned:</span> {bannedText}
            </div>
            {user?.isBanned && (
              <div>
                <span className="text-theme-muted">Ban reason:</span>{" "}
                {user?.banReason || "-"}
              </div>
            )}
            <div>
              <span className="text-theme-muted">Minecraft username:</span>{" "}
              {displayMinecraftUsername || "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label={t.SETTINGS.PROFILE.USERNAME_LABEL}
          value={displayUsername}
          onChange={(e) => onUpdateProfile({ username: e.target.value })}
          placeholder={t.SETTINGS.PROFILE.USERNAME_PLACEHOLDER}
        />

        <Input
          label={t.SETTINGS.PROFILE.SKIN_URL_LABEL}
          type="url"
          value={displaySkinUrl || ""}
          error={skinUrlError}
          onChange={(e) => onUpdateProfile({ skinUrl: e.target.value })}
          placeholder={t.SETTINGS.PROFILE.SKIN_URL_PLACEHOLDER}
        />

        <Input
          label={t.SETTINGS.PROFILE.CAPE_URL_LABEL}
          type="url"
          value={capeUrl}
          error={capeUrlError}
          onChange={(e) => onUpdateProfile({ capeUrl: e.target.value })}
          placeholder={t.SETTINGS.PROFILE.CAPE_URL_PLACEHOLDER}
        />
      </div>

      <div className="space-y-2">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
          {t.SETTINGS.PROFILE.SKIN_PREVIEW_TITLE}
        </label>
        <div className="flex items-center justify-center rounded border-[3px] border-t-[var(--mc-panel-border-lo)] border-l-[var(--mc-panel-border-lo)] border-b-[var(--mc-panel-border-hi)] border-r-[var(--mc-panel-border-hi)] bg-[var(--mc-input-bg)] p-4 shadow-[inset_2px_2px_0px_var(--mc-panel-border-lo),inset_-2px_-2px_0px_var(--mc-panel-border-hi)]">
          <Avatar
            username={displayMinecraftUsername}
            skinUrl={displaySkinUrl}
            size="xl"
          />
        </div>
      </div>

      <div className="mt-8 border-t-[3px] border-theme pt-6">
        <h3 className="font-minecraft text-lg font-bold uppercase text-red-500">
          {t.SETTINGS.PROFILE.DELETE_ACCOUNT_TITLE}
        </h3>
        <p className="mt-2 font-minecraft text-sm text-theme-muted">
          {t.SETTINGS.PROFILE.DELETE_ACCOUNT_DESCRIPTION}
        </p>
        <div className="mt-4">
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            isLoading={isRequestingCode}
          >
            {t.SETTINGS.PROFILE.DELETE_ACCOUNT_BUTTON}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t.SETTINGS.PROFILE.DELETE_ACCOUNT_MODAL_TITLE}
        actions={
          <ModalActions>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t.COMMON.CANCEL}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              disabled={deleteCode.length < 6}
            >
              {t.SETTINGS.PROFILE.DELETE_ACCOUNT_MODAL_CONFIRM}
            </Button>
          </ModalActions>
        }
      >
        <div className="space-y-4">
          <p className="font-minecraft text-sm text-theme">
            {t.SETTINGS.PROFILE.DELETE_ACCOUNT_MODAL_TEXT}
          </p>
          <Input
            label={t.LOGIN.CODE_LABEL}
            value={deleteCode}
            onChange={(e) => setDeleteCode(e.target.value)}
            placeholder={t.LOGIN.CODE_PLACEHOLDER}
            maxLength={6}
          />
          {deletionNotice && (
            <div
              className={`font-minecraft text-xs ${deletionNotice.type === "error" ? "text-red-500" : "text-green-500"}`}
            >
              {deletionNotice.text}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

