# Environment Variables

Single source: `src/shared/env.ts` (`zod` schema `appEnvSchema`).

## Rules
- Main/preload read from `mainEnv` (`src/main/config/env.ts`).
- Renderer read from `rendererEnv` (`src/renderer/src/config/env.ts`).
- New env var: add to `appEnvSchema`, then use via typed env object.
- URL values must be valid `http://` or `https://` URL.

## Variables

| Name | Type | Required | Scope | Notes |
|---|---|---|---|---|
| `API_BASE_URL` | URL string | no | main/api | Backend base URL fallback for api client |
| `VITE_API_BASE_URL` | URL string | no | renderer/api | Preferred API URL in Vite env |
| `PACKWIZ_PACK_URL` | URL string | no | main | Packwiz pack URL candidate |
| `PACKWIZ_ALLOWED_HOSTS` | CSV host list | no | main | Optional host allowlist for packwiz URLs |
| `DISCORD_RPC_CLIENT_ID` | non-empty string | no | main | Discord Rich Presence app ID |
| `CURSEFORGE_API_KEY` | non-empty string | no | main | Needed for CurseForge metadata mode |
| `JAVA_HOME` | non-empty string | no | main | Java binary discovery fallback |
| `NODE_ENV` | non-empty string | no | main | Update flow dev mode check |
| `SMOKE_TEST` | enum: `"true" \| "false"` | no | main/preload/api | Enables smoke-test behavior |
| `TEST_USERNAME` | non-empty string | no | preload | Smoke test credentials |
| `TEST_EMAIL` | email string | no | preload | Smoke test credentials |
| `TEST_PASSWORD` | non-empty string | no | preload | Smoke test credentials |
| `PACKWIZ_DOWNLOAD_TIMEOUT_MS` | digits string | no | main | Download timeout override |

## Example `.env`

```dotenv
API_BASE_URL=https://gerbarium-api.vercel.app
VITE_API_BASE_URL=https://gerbarium-api.vercel.app
PACKWIZ_PACK_URL=https://example.com/packs/client/pack.toml
SMOKE_TEST=false
PACKWIZ_DOWNLOAD_TIMEOUT_MS=120000
```

## Add New Variable
1. Add key to `appEnvSchema` in `src/shared/env.ts`.
2. Use from `mainEnv` or `rendererEnv` only.
3. If renderer needs Vite var, prefix with `VITE_`.
4. Update this file table.
