import type { ApiAdminStats, ApiRole, ApiUser } from "../../../../../lib/api/admin";
import type { ApiChangelog } from "../../../../../lib/api/changelog";
import type { ApiNews, ApiNewsListPayload, ApiNewsTag } from "../../../../../lib/api/news";
import { ensureSuccess } from "../../../lib/queryHelpers";
import type { AdminChangelogFilters, UserListPayload } from "./types";

export const ADMIN_USERS_PAGE_SIZE = 20;
export const ADMIN_NEWS_PAGE_SIZE = 10;


export function normalizeUserListPayload(
  payload: unknown,
  page: number,
  limit: number,
): UserListPayload {
  let items: ApiUser[] = [];
  let total = 0;

  if (Array.isArray(payload)) {
    items = payload;
    total = payload.length;
  } else if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    items = Array.isArray(p.items) ? p.items : Array.isArray(p.data) ? p.data : [];
    total = typeof p.total === "number" ? p.total : (p.meta && typeof p.meta === "object" && p.meta !== null && "total" in p.meta && typeof (p.meta as Record<string, unknown>).total === "number") ? (p.meta as Record<string, unknown>).total as number : items.length;
  }

  const totalPages = Math.ceil(total / limit);

  // Client-side slice if server returns all items
  if (items.length > limit && totalPages <= 1) {
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    };
  }

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: totalPages || 1,
    },
  };
}

export function normalizeNewsListPayload(
  payload: unknown,
  page: number,
  limit: number,
): ApiNewsListPayload {
  let items: ApiNews[] = [];
  let total = 0;
  let totalPages = 0;

  if (Array.isArray(payload)) {
    items = payload;
    total = items.length;
    totalPages = 1; // Array-only response means we don't know the real total, assume 1 page
  } else if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    items = Array.isArray(p.items)
      ? p.items
      : Array.isArray(p.data)
        ? p.data
        : [];

    // Check various common metadata locations
    const m = (p.meta && typeof p.meta === "object" && p.meta !== null) ? p.meta as Record<string, unknown> : p;
    total = typeof m.total === "number" ? m.total : items.length;
    totalPages = typeof m.totalPages === "number" ? m.totalPages : Math.ceil(total / limit) || 1;
  }

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: totalPages || 1,
    },
  };
}







export async function getRoles(): Promise<ApiRole[]> {
  const result = await window.electronAPI.admin.getRoles();
  return ensureSuccess(result, "Failed to fetch roles").data ?? [];
}

export async function getStats(): Promise<ApiAdminStats> {
  const result = await window.electronAPI.admin.getStats();
  return (
    ensureSuccess(result, "Failed to fetch admin stats").data ?? {
      userCount: 0,
      bannedUserCount: 0,
      activeServers: 0,
      newsCount: 0,
      changelogCount: 0,
    }
  );
}

export async function getNewsTags(): Promise<ApiNewsTag[]> {
  const result = await window.electronAPI.admin.getNewsTags();
  return ensureSuccess(result, "Failed to fetch news tags").data ?? [];
}

export async function getAdminChangelog(
  filters: AdminChangelogFilters,
): Promise<ApiChangelog[]> {
  const result = await window.electronAPI.admin.getChangelog(
    filters.fromDate,
    filters.toDate,
    filters.mandatory,
    filters.sortBy,
    filters.order,
  );

  return ensureSuccess(result, "Failed to fetch changelog").data ?? [];
}
