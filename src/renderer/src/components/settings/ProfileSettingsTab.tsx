import { useState } from "react";
import { Button, Input, Modal, ModalActions, Card } from "../ui";
import { Avatar } from "../game/Avatar";
import type { ProfileSettingsTabProps } from "./types";
import { ShieldAlert, Trash2, Mail, User as UserIcon, ShieldCheck, Ban } from "lucide-react";

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
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
          {t.SETTINGS.PROFILE.TITLE}
        </h2>
        <p className="mt-1 text-sm text-[#898989]">
          Manage your account profile and Minecraft appearance.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex shrink-0 flex-col items-center gap-4">
              <Avatar
                username={displayMinecraftUsername}
                skinUrl={displaySkinUrl}
                size="xl"
                className="ring-2 ring-[#2e2e2e]"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-[#4d4d4d]">
                Avatar Preview
              </span>
            </div>

            <div className="grid flex-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4d4d4d]">
                  <Mail size={12} />
                  Email Address
                </div>
                <div className="text-sm font-medium text-[#fafafa]">
                  {user?.email || "Offline Account"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4d4d4d]">
                  <ShieldCheck size={12} />
                  Roles
                </div>
                <div className="text-sm font-medium text-[#fafafa]">
                  {rolesText}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4d4d4d]">
                  <UserIcon size={12} />
                  Minecraft Username
                </div>
                <div className="text-sm font-medium text-[#fafafa]">
                  {displayMinecraftUsername || "—"}
                </div>
              </div>

              {user?.isBanned && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#ff8080]">
                    <Ban size={12} />
                    Status
                  </div>
                  <div className="text-sm font-medium text-[#ff8080]">
                    Banned: {user?.banReason || "No reason provided"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#4d4d4d]">
            Identity & Skins
          </h3>
          <div className="space-y-6">
            <Input
              label={t.SETTINGS.PROFILE.USERNAME_LABEL}
              value={displayUsername}
              onChange={(e) => onUpdateProfile({ username: e.target.value })}
              placeholder={t.SETTINGS.PROFILE.USERNAME_PLACEHOLDER}
            />

            <div className="grid gap-6 md:grid-cols-2">
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
          </div>
        </Card>

        <Card className="border-[#451212] bg-[#1a0f0f] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[#451212] p-2 text-[#ff8080]">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-semibold text-[#fafafa]">
                {t.SETTINGS.PROFILE.DELETE_ACCOUNT_TITLE}
              </h3>
              <p className="text-sm text-[#ff8080]/80">
                {t.SETTINGS.PROFILE.DELETE_ACCOUNT_DESCRIPTION}
              </p>
              <div className="pt-4">
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  isLoading={isRequestingCode}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {t.SETTINGS.PROFILE.DELETE_ACCOUNT_BUTTON}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t.SETTINGS.PROFILE.DELETE_ACCOUNT_MODAL_TITLE}
        actions={
          <ModalActions>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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
          <p className="text-sm leading-relaxed text-[#898989]">
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
              className={cn(
                "rounded-md p-3 text-xs font-medium",
                deletionNotice.type === "error" ? "bg-[#451212] text-[#ff8080]" : "bg-[#0b2b1a] text-[#3ecf8e]"
              )}
            >
              {deletionNotice.text}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

