import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";

export function useAppVersionQuery() {
  return useQuery({
    queryKey: queryKeys.appVersion(),
    queryFn: () => window.electronAPI.getAppVersion(),
    staleTime: Infinity,
  });
}

export function useInstalledVersionsQuery() {
  return useQuery({
    queryKey: queryKeys.installedVersions(),
    queryFn: () => window.electronAPI.game.getInstalledVersions(),
    staleTime: 60_000,
  });
}

export function useSystemMemoryQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.systemMemory(),
    queryFn: () => window.electronAPI.system.getMemory(),
    enabled,
    staleTime: 60_000,
  });
}

export function useCrashReportQuery() {
  return useQuery({
    queryKey: queryKeys.crashReport(),
    queryFn: async () => {
      const response = await window.electronAPI.getLastCrashReport();
      if (!response.success) return null;
      return response.report ?? null;
    },
  });
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
