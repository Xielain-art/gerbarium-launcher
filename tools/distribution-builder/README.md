# Gerbarium Distribution Builder

Static helper for generating `distribution.json`.

## Usage

1. Prepare an ideal local Minecraft folder.
2. Open `index.html` in Chrome or Edge.
3. Fill pack version, Minecraft version, loader, and CDN base URL.
4. Click `Выбрать папку сборки`.
5. Download `distribution.json`.
6. Upload files and manifest using `docs/backend-distribution-requirements.md`.

## File Policy

- `mods/**`: `sync`
- `config/**`: `sync`
- `defaultconfigs/**`: `sync`
- `options.txt`: `seed`
- `servers.dat`: `seed`
- `resourcepacks/**`: `seed`
- `shaderpacks/**`: `seed`
- `saves/**`, `screenshots/**`, `logs/**`, `crash-reports/**`: ignored

