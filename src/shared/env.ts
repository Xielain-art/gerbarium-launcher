import { z } from "zod";

const urlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

const appEnvSchema = z.object({
  API_BASE_URL: urlSchema.optional(),
  VITE_API_BASE_URL: urlSchema.optional(),
  PACKWIZ_PACK_URL: urlSchema.optional(),
  DISCORD_RPC_CLIENT_ID: z.string().trim().min(1).optional(),
  CURSEFORGE_API_KEY: z.string().trim().min(1).optional(),
  JAVA_HOME: z.string().trim().min(1).optional(),
  NODE_ENV: z.string().trim().min(1).optional(),
  SMOKE_TEST: z.enum(["true", "false"]).optional(),
  TEST_USERNAME: z.string().trim().min(1).optional(),
  TEST_EMAIL: z.string().trim().email().optional(),
  TEST_PASSWORD: z.string().trim().min(1).optional(),
  PACKWIZ_DOWNLOAD_TIMEOUT_MS: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .optional(),
  PACKWIZ_ALLOWED_HOSTS: z.string().trim().min(1).optional(),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export function parseAppEnv(rawEnv: Record<string, string | undefined>): AppEnv {
  const result = appEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }
  return result.data;
}

export function isSmokeTestEnabled(env: Pick<AppEnv, "SMOKE_TEST">): boolean {
  return env.SMOKE_TEST === "true";
}
