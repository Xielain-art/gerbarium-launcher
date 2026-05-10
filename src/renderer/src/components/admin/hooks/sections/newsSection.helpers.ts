import type {
  ApiCreateNewsDto,
  ApiUpdateNewsDto,
} from "../../../../../../lib/api/news";

export type NewsSortBy = "createdAt" | "updatedAt" | "title";
export type NewsOrder = "ASC" | "DESC";

export interface AdminNewsFilters {
  sortBy: NewsSortBy;
  order: NewsOrder;
  search: string | undefined;
  tagId: string | undefined;
  fromDate: string | undefined;
  toDate: string | undefined;
}

export const DEFAULT_NEWS_FILTERS: AdminNewsFilters = {
  sortBy: "createdAt",
  order: "DESC",
  search: undefined,
  tagId: undefined,
  fromDate: undefined,
  toDate: undefined,
};

export function toNewsSortBy(value: string): NewsSortBy {
  if (value === "updatedAt" || value === "title") {
    return value;
  }
  return "createdAt";
}

export function toNewsOrder(value: string): NewsOrder {
  return value === "ASC" ? "ASC" : "DESC";
}

export function toApiCreateNewsPayload(payload: {
  title: string;
  slug: string;
  content: string;
  image?: string;
  tagIds?: string[];
}): ApiCreateNewsDto {
  return { ...payload, tagIds: payload.tagIds };
}

export function toApiUpdateNewsPayload(payload: {
  title?: string;
  slug?: string;
  content?: string;
  image?: string;
  tagIds?: string[];
}): ApiUpdateNewsDto {
  return { ...payload, tagIds: payload.tagIds };
}

export function toIsoOrUndefined(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}
