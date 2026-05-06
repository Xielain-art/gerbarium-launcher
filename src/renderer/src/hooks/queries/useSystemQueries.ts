import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";

const appVersionQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.appVersion(),
    queryFn: () => window.electronAPI.getAppVersion(),
    staleTime: Infinity,
  });

const installedVersionsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.installedVersions(),
    queryFn: () => window.electronAPI.game.getInstalledVersions(),
    staleTime: 60_000,
  });

const systemMemoryQueryOptions = (enabled: boolean) =>
  queryOptions({
    queryKey: queryKeys.systemMemory(),
    queryFn: () => window.electronAPI.system.getMemory(),
    enabled,
    staleTime: 60_000,
  });

const crashReportQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.crashReport(),
    queryFn: async () => {
      const response = await window.electronAPI.getLastCrashReport();
      if (!response.success) return null;
      return response.report ?? null;
    },
  });

export function useAppVersionQuery() {
  return useQuery(appVersionQueryOptions());
}

export function useInstalledVersionsQuery() {
  return useQuery(installedVersionsQueryOptions());
}

export function useSystemMemoryQuery(enabled = true) {
  return useQuery(systemMemoryQueryOptions(enabled));
}

export function useCrashReportQuery() {
  return useQuery(crashReportQueryOptions());
}

export function useDismissCrashReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await window.electronAPI.clearLastCrashReport();
    },
    onSuccess: () => {
      qc.setQueryData(queryKeys.crashReport(), null);
    },
  });
}
