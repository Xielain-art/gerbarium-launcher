# Distribution Updater Design

## Goal

Add a launcher-side update layer for Gerbarium modpacks while keeping `minecraft-launcher-core` as the runtime launch layer.

## Architecture

The launcher downloads a distribution manifest from the backend, verifies local game files by SHA-256, downloads missing or changed files, deletes obsolete managed files, then starts Minecraft through the existing MCLC launch handler.

The manifest builder is a separate static HTML/CSS/JS tool in `tools/distribution-builder/`. It scans a prepared "ideal" modpack folder in the browser, computes SHA-256 hashes, and exports `distribution.json`.

## File Policy

Files use explicit actions:

- `sync`: always match the manifest version. Use for `mods/**`, `defaultconfigs/**`, required `config/**`.
- `seed`: download only when the file does not exist. Use for `options.txt`, `servers.dat`, user-facing config defaults.
- `ignore`: document-only marker for files not managed by the launcher.

The launcher never manages `saves/**`, `screenshots/**`, `logs/**`, or `crash-reports/**`.

## Backend Contract

The backend stores metadata in DB and binary files in object storage, CDN, or static file storage. Manifest endpoints return JSON. File URLs point to static files and include SHA-256 in the manifest for integrity.

## Error Handling

Updater errors return `{ success: false, error }` through IPC. Progress uses the existing game progress channel so the launch screen can show update stages before Minecraft starts.

