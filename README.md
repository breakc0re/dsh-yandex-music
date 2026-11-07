# dsh-yandex-music

Плеер Яндекс Музыки в подвале боковой панели DSH NEXT.

Плагин занимает место, где раньше стояла строка **Remote Control**: компактная
строка «Яндекс Музыка» в подвале сайдбара, по клику — поповер с плеером.
Сам Remote Control переезжает в меню **«Ещё»**.

## Статус

`0.2.0` — каркас и авторизация. Работает точка монтирования, поповер,
локализация ru/en и вход в Яндекс через OAuth по коду подтверждения.
Поиска и воспроизведения пока нет — это следующие шаги из
[`docs/plan.json`](docs/plan.json).

| История | Что делает | Статус |
| --- | --- | --- |
| S1 | Каркас плагина и строка в подвале | готово |
| S2 | Перенос Remote Control в «Ещё» | запланировано |
| S3 | Хост: OAuth по коду подтверждения и хранилище токенов | готово |
| S4 | Поповер: подключение приложения, вход, поиск | готово |
| S5 | Воспроизведение, очередь, мини-плеер | готово |
| S6 | Плейлисты и «Мне нравится» | готово |
| S7 | «Моя волна» и рекомендации | готово |
| S8 | Локализация, README, проверка снятия | запланировано |

## Авторизация

Вход идёт через **OAuth Device Flow**: плагин показывает короткий код, пользователь
вводит его на [ya.ru/device](https://ya.ru/device), плагин опрашивает Яндекс и
забирает токен. Никакого redirect URI и никакого копирования токена.

Так сделано не из удобства, а по необходимости: `redirect_uri`
`https://oauth.yandex.ru/verification_code` не зарегистрирован у клиента Музыки
(Яндекс отвечает `400 redirect_uri не совпадает с Callback URL`), а Device Flow
redirect не использует вовсе.

Плагин по умолчанию работает через официальный клиент Яндекс Музыки
(`23cabbbdc6cd418abb4b39c32c41195d`) — только его токен несёт scope `music:*`,
а вместе с ним и подписку Плюса. Своё OAuth-приложение Музыке не подходит: ему
доступны лишь `music:api-public` и `music:major-public-api`, и первый из них
включает проверку прав, на которой запросы падают с
`403 missing-required-scopes`. Токен такого приложения даёт 30-секундные превью.

Креды клиента Музыки не секрет в буквальном смысле: они опубликованы в
открытой библиотеке [`yandex-music-api`](https://github.com/MarshalX/yandex-music-api/blob/main/yandex_music/_client/device_auth.py).
Тем не менее это чужое приложение: Яндекс может ограничить такой вход.

Токены лежат только на хосте, в `<DSH_HOME>/plugin-data/dsh-yandex-music/auth.json`
(атомарная запись, режим `0600` на POSIX; в Windows режим файла не применяется и
доступ ограничен правами профиля), и никогда не попадают в ответы браузеру:
клиент видит лишь `{ configured, authorized, login, uid, plus, expiresAt }`.

## Устройство

- `server.js` — хостовая половина: маршруты `/api/plugins/yandex-music/auth/*`.
- `lib/oauth.js` — PKCE, authorize-URL, обмен кода, refresh.
- `lib/store.js` — атомарное хранилище `auth.json` и публичная проекция статуса.
- `lib/yandex.js` — клиент `api.music.yandex.net` (пока только `/account/status`).
- `client.js` — браузерная половина: слот `sidebar.footer.action`, `id`
  `yandex-music`, `order` 26, поповер через `createPortal`.
- `cordis.patch.yml` — вставка записи в дерево профиля.

## Установка

Пакет не публикуется. Он лежит в `node_modules` профиля и включается строкой в
`cordis.patch.yml` профиля:

```yaml
- insert:
    - id: yandex-music
      name: dsh-yandex-music
```

Зависимость в `~/.dsh/profiles/desktop/package.json`:

```json
"dsh-yandex-music": "file:C:/Users/breakc0re/Desktop/Нейросети/Plugins/dsh-yandex-music"
```

После `pnpm install` хост подхватывает патч на лету, клиентский бандл
подтягивается через модульный граф (`/plugins/dsh-yandex-music/client.js`).

### Разработка

`pnpm` с `nodeLinker: hoisted` копирует `file:`-зависимость в `node_modules`,
поэтому правки в исходниках не видны без повторного `pnpm install`. Для
итераций каталог заменён junction-ссылкой на исходники:

```powershell
Remove-Item "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-yandex-music" -Recurse -Force
New-Item -ItemType Junction `
  -Path "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-yandex-music" `
  -Target "C:\Users\breakc0re\Desktop\Нейросети\Plugins\dsh-yandex-music"
```

Следующий `pnpm install` заменит junction обычной копией — после него ссылку
нужно создать заново.

## Ограничения

- OAuth-приложение регистрирует пользователь: плагин не может создать клиента
  за него. Без `client_id` экран входа не появится.
- API Яндекс Музыки неофициальный: получение прямого URL трека и ротор «Моя
  волна» держатся на реверс-инжиниренной схеме и могут сломаться.
- Для полноценного воспроизведения нужна подписка Яндекс Плюс.
