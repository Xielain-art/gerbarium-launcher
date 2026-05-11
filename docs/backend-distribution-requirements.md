# Backend Distribution Requirements

## Storage Model

Use DB for metadata and object/static storage for files.

Do not store `.jar`, config, resource pack, or shader files directly in DB.

Recommended object keys:

```text
gerbarium/modpacks/main/channels/stable.json
gerbarium/modpacks/main/channels/beta.json
gerbarium/modpacks/main/versions/1.0.0.json
gerbarium/modpacks/main/files/1.0.0/mods/example.jar
gerbarium/modpacks/main/files/1.0.0/config/example.toml
```

## Supabase Layout

For Supabase Storage, use one public bucket for launcher distribution.

Recommended bucket:

```text
gerbarium
```

Recommended manifest URL:

```text
https://<project-ref>.supabase.co/storage/v1/object/public/gerbarium/gerbarium/modpacks/main/channels/stable.json
```

The launcher uses env-configured distribution source only.

## API

Required public endpoints:

```text
GET /launcher/packs/:packId/channels/:channel
GET /launcher/packs/:packId/versions/:version
GET /launcher/files/*
```

`channels/:channel` returns the active manifest or redirects to the version manifest.

Launcher config:

```text
PACKWIZ_PACK_URL=https://cdn.example.com/packs/client/pack.toml
```

If `PACKWIZ_PACK_URL` is absent, launcher fails update and blocks launch.

For Supabase, point it at a public object URL in the `gerbarium` bucket.

Optional admin endpoints:

```text
POST /admin/launcher/packs/:packId/versions
POST /admin/launcher/files
POST /admin/launcher/packs/:packId/channels/:channel/promote
```

## Manifest Rules

Each managed file must include:

- `path`: relative path inside game root.
- `url`: absolute download URL.
- `sha256`: lowercase SHA-256.
- `size`: bytes.
- `action`: `sync`, `seed`, or `ignore`.

## Config Rules

Use an ideal local modpack folder as source.

Do not point the builder at full `.gerbarium` root or game runtime folder.
Use a clean pack folder containing only the files you actually want to distribute.

Recommended actions:

- `mods/**`: `sync`
- `defaultconfigs/**`: `sync`
- critical `config/**`: `sync`
- `options.txt`: `seed`
- `servers.dat`: `seed`
- `resourcepacks/**`: `sync` or `seed`
- `shaderpacks/**`: `seed`

Never manage:

- `saves/**`
- `screenshots/**`
- `logs/**`
- `crash-reports/**`

## Deployment Flow

1. Build ideal modpack locally.
2. Open `tools/distribution-builder/index.html`.
3. Select the ideal modpack folder.
4. Set CDN base URL and version.
5. Export `distribution.json`.
6. Upload files and manifest to Supabase Storage.
7. Copy `distribution.json` to `gerbarium/modpacks/main/channels/stable.json`.

## Testing

Test in this order:

1. Open the manifest URL in browser.
   - Expect raw JSON.
   - Example:

```text
https://<project-ref>.supabase.co/storage/v1/object/public/gerbarium/gerbarium/modpacks/main/channels/stable.json
```

2. Open one file URL from the manifest.
   - Expect the raw file or a browser download.
   - Example:

```text
https://<project-ref>.supabase.co/storage/v1/object/public/gerbarium/gerbarium/modpacks/main/files/1.0.0/mods/example.jar
```

3. Set `PACKWIZ_PACK_URL` in launcher environment.

4. Start launcher and watch update screen.
   - If manifest is valid, it will fetch file list and compare hashes.
   - If no files differ, it should report distribution ready and continue to login.

5. Run a real game launch.
   - Launcher should call update first, then launch Minecraft.

## Common Failures

- 404 on manifest URL: wrong bucket path or object key.
- 403 on file URL: bucket not public or URL points to private object path.
- Hash mismatch: file in bucket does not match `sha256` in manifest.
- Launcher blocks update: `PACKWIZ_PACK_URL` is empty or malformed.
