import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";
import { ensureSuccess } from "../../../lib/queryHelpers";
import type { AdminChangelogFilters } from "./types";
import { getAdminChangelog } from "./utils";
import type { ApiCreateChangelogDto, ApiUpdateChangelogDto } from "../../../../../lib/api/changelog";

export function useAdminChangelogQuery(filters: AdminChangelogFilters) {
  return useQuery({
    queryKey: queryKeys.adminChangelog(filters),
    queryFn: () => getAdminChangelog(filters),
  });
}

export function useAdminChangelogMutations(filters: AdminChangelogFilters) {
  const queryClient = useQueryClient();
  const invalidateChangelog = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.adminChangelog(filters),
    });
  };

  return {
    createChangelog: useMutation({
      mutationFn: async (payload: ApiCreateChangelogDto) =>
        ensureSuccess(
          await window.electronAPI.admin.createChangelog(payload),
          "Failed to create changelog",
        ),
      onSuccess: invalidateChangelog,
    }),
    updateChangelog: useMutation({
      mutationFn: async ({
        changelogId,
        payload,
      }: {
        changelogId: string;
        payload: ApiUpdateChangelogDto;
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateChangelog(changelogId, payload),
          "Failed to update changelog",
        ),
      onSuccess: invalidateChangelog,
    }),
    deleteChangelog: useMutation({
      mutationFn: async (changelogId: string) =>
        ensureSuccess(
          await window.electronAPI.admin.deleteChangelog(changelogId),
          "Failed to delete changelog",
        ),
      onSuccess: invalidateChangelog,
    }),
  };
}