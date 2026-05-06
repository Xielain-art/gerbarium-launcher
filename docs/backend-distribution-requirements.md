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
GERBARIUM_DISTRIBUTION_URL=https://api.example.com/launcher/packs/gerbarium/channels/stable
```

If `GERBARIUM_DISTRIBUTION_URL` is absent, the current launcher skips modpack update and keeps normal Minecraft launch working.

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
6. Upload files and manifest to storage.
7. Promote `channels/stable.json` to the new manifest.
