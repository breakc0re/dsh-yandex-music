# Как выложить плагин

## Что уже готово в репозитории

- `dsh.bundle.patch` — манифест бандла, по нему работает `dsh plugin add`.
- `package.json` без `private`, с `files`, `license`, `repository`, `engines`.
- `LICENSE` (MIT) и `CHANGELOG.md`.
- `docs/marketplace-entry.json` — запись в формате индекса маркета
  (`format: 1`), с зафиксированным релизным коммитом.

## 1. Репозиторий

Уже публичный: <https://github.com/breakc0re/dsh-yandex-music>.

Установка прямо из GitHub проверяется так:

```powershell
dsh plugin --profile desktop add github:breakc0re/dsh-yandex-music
```

## 2. npm (нужен для отображения версии в маркете)

Маркет показывает плагины, опубликованные в npm: для них он знает версию и
дату. Аккаунт и токен нужны свои, из плагина это не сделать.

```powershell
npm login
npm publish --access public
dsh plugin --profile desktop add dsh-yandex-music
```

Проверить содержимое пакета до публикации:

```powershell
npm pack --dry-run
```

В пакет должны попасть `server.js`, `client.js`, `lib/*.js`,
`cordis.patch.yml`, `README.md`, `CHANGELOG.md`, `LICENSE` — и ничего лишнего.

## 3. Каталог awesome-dsh-plugin

Маркет `realguan/dsh-plugin-market` каждый день в 03:17 UTC пересобирает индекс
из [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
(данные под CC0). Поэтому попадание в маркет = PR в этот список.

Добавить одну строку в раздел **UI Enhancements**:

```markdown
- [breakc0re/dsh-yandex-music](https://github.com/breakc0re/dsh-yandex-music) - Yandex Music player in the DSH sidebar: search, draggable queue, playlists, My Wave stations, karaoke lyrics with a Russian translation, media keys, and playback that survives a restart. Requires a Yandex Plus subscription.
```

Требования списка, которые у плагина уже выполнены: манифест `dsh.bundle`,
установка через `dsh plugin add`, работающее описание в одну строку.

После мержа индекса ждать до суток; jsDelivr кэширует до 12 часов, свежая
копия — `https://realguan.github.io/dsh-plugin-market/dsh-index.json`.

## 4. Проверка после публикации

```powershell
# пакет собран и содержит нужные файлы
npm view dsh-yandex-music version files

# плагин ставится с нуля в отдельном профиле
dsh plugin --profile test add dsh-yandex-music
```

Перед публикацией стоит убедиться, что в репозитории нет личных данных:
токен лежит в `<DSH_HOME>/plugin-data/dsh-yandex-music/auth.json`, в git он
не попадает (`.gitignore`), но проверить историю всё равно полезно:

```powershell
git log --all -p -S "OAuth" --pretty=format:%h | Select-String "OAuth [A-Za-z0-9_-]{20,}"
```
