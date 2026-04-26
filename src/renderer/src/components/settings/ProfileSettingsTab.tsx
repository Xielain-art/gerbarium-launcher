import { Input } from "../ui";
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

  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-theme">
        {t.SETTINGS.PROFILE.TITLE}
      </h2>

      <div className="space-y-4">
        <Input
          label={t.SETTINGS.PROFILE.USERNAME_LABEL}
          value={profile.username}
          onChange={(e) => onUpdateProfile({ username: e.target.value })}
          placeholder={t.SETTINGS.PROFILE.USERNAME_PLACEHOLDER}
        />

        <Input
          label={t.SETTINGS.PROFILE.SKIN_URL_LABEL}
          type="url"
          value={skinUrl}
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
          <div className="bg-theme-bg flex h-32 w-32 items-center justify-center">
            <span className="text-theme-muted font-minecraft text-sm">
              {profile.skinUrl ? t.SETTINGS.PROFILE.SKIN_LOADING : t.SETTINGS.PROFILE.SKIN_NOT_SELECTED}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
