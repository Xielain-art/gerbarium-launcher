import type { ApiUser } from "../../../../../lib/api/admin";

export type UserFilters = {
  search?: string;
  role?: string;
  banned?: boolean;
};

export type AdminNewsFilters = {
  search?: string;
  tagId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  order?: "ASC" | "DESC";
};

export type AdminChangelogFilters = {
  fromDate?: string;
  toDate?: string;
  mandatory?: boolean;
  sortBy?: "releaseDate" | "version" | "createdAt";
  order?: "ASC" | "DESC";
};


export interface UserListPayload {
  items: ApiUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}