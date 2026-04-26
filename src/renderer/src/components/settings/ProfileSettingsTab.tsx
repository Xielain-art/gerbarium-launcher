import { Input } from "../ui";
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
}: ProfileSettingsTabProps) {
  const skinUrl = profile.skinUrl || "";
  const capeUrl = profile.capeUrl || "";
  const skinUrlError = skinUrl.length > 0 && !isValidHttpUrl(skinUrl)
    ? t.SETTINGS.PROFILE.URL_VALIDATION_ERROR
    : undefined;
  const capeUrlError = capeUrl.length > 0 && !isValidHttpUrl(capeUrl)
    ? t.SETTINGS.PROFILE.URL_VALIDATION_ERROR
    : undefined;

  const playerProfile = user?.playerProfile;
  const displayUsername = user?.username || profile.username;
  const displayMinecraftUsername = playerProfile?.minecraftUsername || displayUsername;
  const displaySkinUrl = playerProfile?.skinUrl || profile.skinUrl;
  const rolesText = user?.roles?.join(", ") || "user";
  const bannedText = user?.isBanned ? "Yes" : "No";

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
            <div><span className="text-theme-muted">Email:</span> {user?.email || "-"}</div>
            <div><span className="text-theme-muted">Roles:</span> {rolesText}</div>
            <div><span className="text-theme-muted">Banned:</span> {bannedText}</div>
            {user?.isBanned && (
              <div><span className="text-theme-muted">Ban reason:</span> {user?.banReason || "-"}</div>
            )}
            <div><span className="text-theme-muted">Minecraft UUID:</span> {playerProfile?.minecraftUuid || "-"}</div>
            <div><span className="text-theme-muted">Minecraft username:</span> {displayMinecraftUsername || "-"}</div>
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
    </div>
  );
}
