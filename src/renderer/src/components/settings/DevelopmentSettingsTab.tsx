import { Card, Input } from "../ui";
import type { DevelopmentSettingsTabProps } from "./types";
import { Wrench } from "lucide-react";

export function DevelopmentSettingsTab({
  t,
  general,
  onUpdateGeneral,
}: DevelopmentSettingsTabProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="fantasy-hero-title text-2xl font-semibold text-theme">
          {t.SETTINGS.DEVELOPMENT.TITLE}
        </h2>
        <p className="text-sm text-theme-muted">
          {t.SETTINGS.DEVELOPMENT.DESCRIPTION}
        </p>
      </div>

      <Card className="fantasy-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <Wrench size={16} className="text-theme-muted" />
          <h3 className="fantasy-rune-label text-[11px] font-bold">
            Velocity API
          </h3>
        </div>
        <div className="grid gap-6">
          <Input
            label={t.SETTINGS.DEVELOPMENT.GAME_ADDRESS_LABEL}
            type="text"
            value={general.gameServerAddress || ""}
            onChange={(e) => onUpdateGeneral({ gameServerAddress: e.target.value })}
            placeholder={t.SETTINGS.DEVELOPMENT.GAME_ADDRESS_PLACEHOLDER}
            className="font-mono"
          />
          <Input
            label={t.SETTINGS.DEVELOPMENT.ADDRESS_LABEL}
            type="text"
            value={general.devServerAddress || ""}
            onChange={(e) => onUpdateGeneral({ devServerAddress: e.target.value })}
            placeholder={t.SETTINGS.DEVELOPMENT.ADDRESS_PLACEHOLDER}
            className="font-mono"
          />
          <Input
            label={t.SETTINGS.DEVELOPMENT.PASSWORD_LABEL}
            type="password"
            value={general.devServerPassword || ""}
            onChange={(e) =>
              onUpdateGeneral({ devServerPassword: e.target.value })
            }
            placeholder={t.SETTINGS.DEVELOPMENT.PASSWORD_PLACEHOLDER}
            className="font-mono"
          />
        </div>
      </Card>
    </div>
  );
}
