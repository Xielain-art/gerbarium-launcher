# Обновление модпака лаунчером через packwiz

## Что такое packwiz
packwiz — формат и CLI для описания модпака через TOML-файлы (`pack.toml`, `index.toml`, `*.pw.toml`).  
Лаунчер читает эти файлы как источник истины и синхронизирует локальный инстанс.

## Почему Gerbarium использует packwiz
- Простой git-friendly формат.
- Прозрачные хэши и контроль целостности.
- Поддержка Modrinth/CurseForge/direct URL без жесткой привязки к одному провайдеру.
- Удобно для MVP и дальнейшего роста (включая приватные моды).

## Отличие от CurseForge manifest и Modrinth .mrpack
- CurseForge manifest **не основной формат** в Gerbarium.
- `.mrpack` удобен для импорта/экспорта, но не основной runtime-источник.
- Основной runtime-источник для лаунчера: `pack.toml` + `index.toml` + `*.pw.toml`.

## Источник истины
Источник истины: удаленный `packs/client/pack.toml` (через `packwizPackUrl` / `PACKWIZ_PACK_URL`).

## Где лежит клиентский пак
```text
packs/
  client/
    pack.toml
    index.toml
    mods/
      *.pw.toml
    config/
```

## Как лаунчер обновляет моды
1. Старт лаунчера и prelaunch-фаза.
2. Проверка авторизации/доступа к запуску.
3. Загрузка `pack.toml`.
4. Разбор `pack.toml`, получение пути к `index.toml`.
5. Загрузка и разбор `index.toml`.
6. Построение списка ожидаемых файлов.
7. Для `metafile=true`: загрузка `*.pw.toml`, фильтр по `side`, получение `download.url/hash`.
8. Проверка локальных файлов по хэшу.
9. Скачивание отсутствующих/устаревших файлов.
10. Повторная проверка хэша после скачивания.
11. При успехе — запуск Minecraft.

## Проверка хэшей
- Обязательная проверка целостности.
- MVP: поддерживается `sha256`.
- Неподдерживаемый формат хэша => явная ошибка.
- При mismatch после загрузки файл удаляется, запуск блокируется.

## Фильтрация client/server
- `side = "client"`: устанавливается.
- `side = "both"`: устанавливается.
- `side = "server"`: пропускается в клиентском лаунчере.
- Если `side` отсутствует: используется поведение `both`.

## Кастомные моды Gerbarium
Кастомные моды размещаются Gerbarium (CDN/GitHub Releases/backend static).  
В `*.pw.toml` указывается прямой HTTPS URL + хэш.  
Лаунчер обрабатывает их как обычные файлы модпака.  
Приватная/авторизованная загрузка может быть добавлена позже (вне MVP).

## Как добавить мод
Варианты:
- Modrinth через packwiz CLI.
- CurseForge через packwiz CLI.
- Direct URL через `packwiz url add`.

После изменения выполнить `packwiz refresh` (и при необходимости `packwiz refresh --build`) и опубликовать обновленные TOML-файлы.

## Как обновить мод
1. Обновить версию мода через packwiz CLI.
2. Обновить индекс (`packwiz refresh`).
3. Закоммитить и опубликовать `packs/client/*`.

## Как удалить мод
1. Удалить запись/метафайл мода из пака.
2. Обновить `index.toml` (`packwiz refresh`).
3. Опубликовать изменения.

## Как публиковать packwiz-файлы
Публикуется каталог `packs/client/` на HTTPS (CDN/GitHub raw/static backend).  
Лаунчеру нужен доступ к `pack.toml` по `packwizPackUrl`.

## Как лаунчер читает pack.toml
- `pack.toml` -> `[index].file`.
- `index.toml` -> `[[files]]`.
- `metafile=true` -> чтение `*.pw.toml` и загрузка итогового файла.

## Политика очистки устаревших файлов
- Консервативная политика.
- По умолчанию неизвестные `mods/*.jar` **не удаляются**.
- Флаг `cleanUnknownMods: true` включает удаление неизвестных jar в `mods/`.
- Никакого полного удаления каталога инстанса.

## Типичные ошибки и отладка
- `Failed to fetch pack.toml`
- `Failed to parse index.toml`
- `Unsupported hash format`
- `Metafile ... missing download.url/hash`
- `Hash mismatch after download`
- `404`/timeout на CDN

Что делать:
1. Проверить `packwizPackUrl`.
2. Проверить доступность URL в браузере/через curl.
3. Проверить хэши и `hash-format`.
4. Проверить `side` и корректность `filename`.
5. Повторить запуск (есть retry на сетевые ошибки).

## Пример конфигурации лаунчера
```json
{
  "minecraftVersion": "1.20.1",
  "loader": {
    "type": "fabric",
    "version": "0.19.2"
  },
  "packwiz": {
    "enabled": true,
    "packUrl": "https://cdn.minecraft-gerbarium.duckdns.org/packs/client/pack.toml",
    "cleanUnknownMods": false,
    "downloadConcurrency": 4
  }
}
```

## Пример update flow
```text
Launcher starts
checks auth
downloads pack.toml
downloads index.toml
checks local files
downloads missing/changed files
verifies sha256
launches Minecraft
```

## Что не делает launcher updater
- Не обновляет серверные моды.
- Не изменяет Docker-файлы серверной инфраструктуры.
- Не обходит launcher auth.
- Не ставит случайные локальные моды вне packwiz-списка.
- Не удаляет неизвестные моды по умолчанию.
