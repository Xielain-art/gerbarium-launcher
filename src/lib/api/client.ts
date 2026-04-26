import createClient from "openapi-fetch";
import { paths } from "./v1";

const DEFAULT_API_BASE_URL = "";

function normalizeBaseUrl(value: string): string {
    return value.trim().replace(/\/+$/, "");
}

export const API_BASE_URL = process.env.API_BASE_URL
export const apiClient = createClient<paths>({
    baseUrl: API_BASE_URL,
});
