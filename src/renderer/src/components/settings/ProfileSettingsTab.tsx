import { useState } from "react";
import { Button, Input, Modal, ModalActions, Card } from "../ui";
import { Avatar } from "../game/Avatar";
import type { ProfileSettingsTabProps } from "./types";
import { ShieldAlert, Trash2, Mail, User as UserIcon, ShieldCheck, Ban, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col gap-1">
        <h2 className="fantasy-hero-title text-2xl font-semibold text-theme">
          {t.SETTINGS.PROFILE.TITLE}
        </h2>
        <p className="text-sm text-theme-muted">
          Manage your account profile and Minecraft appearance.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="fantasy-card p-8">
          <div className="flex flex-col gap-10 md:flex-row md:items-start">
            <div className="flex shrink-0 flex-col items-center gap-4">
              <div className="relative group">
                <Avatar
                  username={displayMinecraftUsername}
                  skinUrl={displaySkinUrl}
                  size="xl"
                  className="ring-2 ring-[var(--theme-border)] transition-all group-hover:ring-[var(--mc-accent)]/50"
                />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-[var(--theme-bg)] bg-[var(--mc-accent)] shadow-[0_0_10px_rgba(62,207,142,0.4)]" />
              </div>
              <span className="fantasy-rune-label text-[10px] font-bold">
                Avatar Preview
              </span>
            </div>

            <div className="grid flex-1 gap-x-12 gap-y-8 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 fantasy-rune-label text-[10px] font-bold">
                  <Mail size={12} className="text-[var(--mc-accent)]" />
                  Email Address
                </div>
                <div className="text-sm font-medium text-theme">
                  {user?.email || "—"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 fantasy-rune-label text-[10px] font-bold">
                  <ShieldCheck size={12} className="text-[var(--mc-accent)]" />
                  Global Roles
                </div>
                <div className="flex flex-wrap gap-2">
                  {user?.roles?.map(role => (
                    <span key={role.id} className="fantasy-chip rounded border border-theme px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                      {role.name}
                    </span>
                  )) || <span className="text-sm font-medium text-theme">user</span>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 fantasy-rune-label text-[10px] font-bold">
                  <UserIcon size={12} className="text-[var(--mc-accent)]" />
                  Minecraft Username
                </div>
                <div className="text-sm font-medium text-theme">
                  {displayMinecraftUsername || "—"}
                </div>
              </div>

              {user?.isBanned && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 fantasy-rune-label text-[10px] font-bold text-[color:var(--destructive)]">
                    <Ban size={12} />
                    Account Status
                  </div>
                  <div className="rounded-md bg-[color:var(--destructive)]/10 px-3 py-2 text-xs font-medium text-[color:var(--destructive)] border border-[color:var(--destructive)]/20">
                    Banned: {user?.banReason || "No reason provided"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="fantasy-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <Fingerprint size={16} className="text-theme-muted" />
            <h3 className="fantasy-rune-label text-[11px] font-bold">
              Identity & Customization
            </h3>
          </div>
          <div className="space-y-6">
            <Input
              label={t.SETTINGS.PROFILE.USERNAME_LABEL}
              value={displayUsername}
              onChange={(e) => onUpdateProfile({ username: e.target.value })}
              placeholder={t.SETTINGS.PROFILE.USERNAME_PLACEHOLDER}
              className="font-medium"
            />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <Input
                  label={t.SETTINGS.PROFILE.SKIN_URL_LABEL}
                  type="url"
                  value={displaySkinUrl || ""}
                  error={skinUrlError}
                  onChange={(e) => onUpdateProfile({ skinUrl: e.target.value })}
                  placeholder={t.SETTINGS.PROFILE.SKIN_URL_PLACEHOLDER}
                  className="fantasy-input-shell font-mono text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  label={t.SETTINGS.PROFILE.CAPE_URL_LABEL}
                  type="url"
                  value={capeUrl}
                  error={capeUrlError}
                  onChange={(e) => onUpdateProfile({ capeUrl: e.target.value })}
                  placeholder={t.SETTINGS.PROFILE.CAPE_URL_PLACEHOLDER}
                  className="fantasy-input-shell font-mono text-[13px]"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="fantasy-card border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/8 p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--destructive)]/15 text-[color:var(--destructive)] shadow-[0_0_20px_rgba(255,128,128,0.1)]">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-theme">
                  {t.SETTINGS.PROFILE.DELETE_ACCOUNT_TITLE}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--destructive)]/70">
                  {t.SETTINGS.PROFILE.DELETE_ACCOUNT_DESCRIPTION}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  isLoading={isRequestingCode}
                  className="flex items-center gap-2 font-semibold"
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
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-theme-muted">
            {t.SETTINGS.PROFILE.DELETE_ACCOUNT_MODAL_TEXT}
          </p>
          <Input
            label={t.LOGIN.CODE_LABEL}
            value={deleteCode}
            onChange={(e) => setDeleteCode(e.target.value)}
            placeholder={t.LOGIN.CODE_PLACEHOLDER}
            maxLength={6}
            className="fantasy-input-shell font-mono text-center text-lg tracking-[0.5em]"
          />
          {deletionNotice && (
            <div
              className={cn(
                "flex items-start gap-3 rounded-md p-4 text-xs font-medium border",
                deletionNotice.type === "error" 
                  ? "bg-[color:var(--destructive)]/10 text-[color:var(--destructive)] border-[color:var(--destructive)]/20" 
                : "border-[var(--mc-accent)]/20 bg-[var(--mc-accent)]/10 text-[var(--mc-accent)]"
              )}
            >
              {deletionNotice.type === "error" ? <ShieldAlert size={14} className="shrink-0" /> : <ShieldCheck size={14} className="shrink-0" />}
              {deletionNotice.text}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}


