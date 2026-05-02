import { Button as ShadcnButton, Card as ShadcnCard } from "@/components/shadcn/ui";
import type { ApiAdminStats } from "../../../../lib/api/admin";

interface AdminStatsPanelProps {
  stats: ApiAdminStats | undefined;
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  onRefresh: () => void;
}

export function AdminStatsPanel({
  stats,
  isLoading,
  isFetching,
  errorMessage,
  onRefresh,
}: AdminStatsPanelProps): React.JSX.Element {
  return (
    <ShadcnCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-minecraft text-xl font-bold">Статистика</h2>
        <div className="flex items-center gap-3">
          {(isFetching || isLoading) && (
            <div className="flex items-center gap-2 text-theme-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-theme/50 border-t-transparent" />
              <span className="font-minecraft text-[10px] uppercase">
                Обновление...
              </span>
            </div>
          )}
          <ShadcnButton
            type="button"
            variant="secondary"
            onClick={onRefresh}
            disabled={isFetching}
            className="font-minecraft text-xs uppercase"
          >
            Обновить
          </ShadcnButton>
        </div>
      </div>
      {errorMessage && (
        <div className="mb-4 font-minecraft text-sm text-red-500">
          {errorMessage}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded border border-white/10 bg-black/20 p-4">
          <div className="font-minecraft text-[10px] uppercase text-theme-muted">
            Пользователи
          </div>
          <div className="mt-2 font-minecraft text-2xl text-theme">
            {stats?.userCount ?? "-"}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-black/20 p-4">
          <div className="font-minecraft text-[10px] uppercase text-theme-muted">
            Забанено
          </div>
          <div className="mt-2 font-minecraft text-2xl text-theme">
            {stats?.bannedUserCount ?? "-"}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-black/20 p-4">
          <div className="font-minecraft text-[10px] uppercase text-theme-muted">
            Активные сервера
          </div>
          <div className="mt-2 font-minecraft text-2xl text-theme">
            {stats?.activeServers ?? "-"}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-black/20 p-4">
          <div className="font-minecraft text-[10px] uppercase text-theme-muted">
            Новости
          </div>
          <div className="mt-2 font-minecraft text-2xl text-theme">
            {stats?.newsCount ?? "-"}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-black/20 p-4">
          <div className="font-minecraft text-[10px] uppercase text-theme-muted">
            Changelog записи
          </div>
          <div className="mt-2 font-minecraft text-2xl text-theme">
            {stats?.changelogCount ?? "-"}
          </div>
        </div>
      </div>
    </ShadcnCard>
  );
}


