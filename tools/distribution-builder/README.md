# Gerbarium Distribution Builder

Static helper for generating `distribution.json`.

## Usage

1. Prepare an ideal local Minecraft folder.
2. Open `index.html` in Chrome or Edge.
3. Fill pack version, Minecraft version, loader, and CDN base URL.
4. Click `Выбрать папку сборки`.
5. Download `distribution.json`.
6. Upload files and manifest using `docs/backend-distribution-requirements.md`.

For Supabase Storage, use a public bucket root like:

```text
https://<project-ref>.supabase.co/storage/v1/object/public/gerbarium/gerbarium/modpacks/main/files/1.0.0
```

The matching manifest URL is:

```text
https://<project-ref>.supabase.co/storage/v1/object/public/gerbarium/gerbarium/modpacks/main/channels/stable.json
```

## Direct Upload Tool

Use the Node uploader when you want one command to build and push everything to Supabase.

```bash
SUPABASE_URL=https://<project-ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
node tools/distribution-builder/upload.mjs \
  --root="C:\path\to\modpack" \
  --version=1.0.0 \
  --minecraft-version=1.20.1 \
  --loader=fabric \
  --loader-version=0.15.11 \
  --bucket=gerbarium \
  --prefix=gerbarium/modpacks/main/files/1.0.0 \
  --manifest-path=gerbarium/modpacks/main/channels/stable.json
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` stays local only.
- Bucket can be private for uploads; service role bypasses RLS.
- If bucket public, launcher can download files directly by manifest URL.
- Script uploads both `channels/stable.json` and `versions/1.0.0.json`.

## File Policy

- `mods/**`: `sync`
- `config/**`: `sync`
- `defaultconfigs/**`: `sync`
- `options.txt`: `seed`
- `servers.dat`: `seed`
- `resourcepacks/**`: `seed`
- `shaderpacks/**`: `seed`
- `saves/**`, `screenshots/**`, `logs/**`, `crash-reports/**`: ignored
