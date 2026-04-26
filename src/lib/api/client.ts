import createClient from "openapi-fetch";
import { paths } from "./v1";

export const API_BASE_URL = "https://gerbarium-api.vercel.app";

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});
