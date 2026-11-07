window.__ModuleLoader__.load({
  id: 'dsh-yandex-music',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives');
    const h = React.createElement;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'yandexMusic';
    /** Marks the injected stylesheet so a reload replaces it instead of stacking. */
    const STYLE_ID = 'yandex-music';
    /** Popover geometry: a square card anchored above the footer row. */
    const CARD_WIDTH = 380;
    const CARD_HEIGHT = 380;
    /** Host routes owned by this plugin. */
    const API = '/api/plugins/yandex-music';
    /**
     * Yandex Music's own OAuth application. A token issued to it carries the
     * `music:*` scopes, which is what makes the service honour a Plus
     * subscription; a token from a personal application gets the default
     * permission set and 30-second previews. Using someone else's client is a
     * grey area — the field stays editable for that reason.
     */
    const MUSIC_CLIENT_ID = '23cabbbdc6cd418abb4b39c32c41195d';
    /** The bundle that owns the Remote Control entry we relocate. */
    const BRIDGE_PACKAGE = '@agents-anywhere/dsh-bridge-next';
    /** Its footer entry id, taken from its own `sidebar.footer.action` registration. */
    const BRIDGE_ENTRY_ID = 'agents-anywhere-next';

    /* ------------------------------------------------------------------ */
    /* copy                                                                */
    /* ------------------------------------------------------------------ */

    const ru = {
      entry: 'Яндекс Музыка',
      title: 'Яндекс Музыка',
      close: 'Закрыть',
      loading: 'Проверяем вход…',
      setupTitle: 'Подключение приложения',
      setupHint: 'Создайте приложение на oauth.yandex.ru с Redirect URI https://oauth.yandex.ru/verification_code и вставьте его client_id. Секрет не нужен: вход идёт через PKCE.',
      setupLink: 'Открыть oauth.yandex.ru',
      clientId: 'client_id',
      clientSecret: 'client_secret (необязательно)',
      useMusicClient: 'Подставить client_id Яндекс Музыки',
      musicClientHint: 'Официальный клиент Музыки: с его токеном Яндекс отдаёт Плюс и полные треки. Чужое приложение — на свой риск.',
      save: 'Сохранить',
      saving: 'Сохраняем…',
      loginTitle: 'Вход в Яндекс',
      loginHint: 'Откройте страницу и разрешите доступ. Если Яндекс показал 7-значный код — введите его. Если вас перебросило на ваш Redirect URI, скопируйте значение параметра code из адресной строки.',
      login: 'Войти в Яндекс',
      openPage: 'Открыть страницу входа',
      code: 'Код подтверждения или code из адресной строки',
      submit: 'Подтвердить',
      submitting: 'Проверяем код…',
      signedIn: 'Вы вошли как',
      account: 'Аккаунт',
      noPlus: 'Без Яндекс Плюса доступны только 30-секундные превью.',
      logout: 'Выйти',
      searchPlaceholder: 'Найти трек или исполнителя',
      searching: 'Ищем…',
      nothingFound: 'Ничего не нашлось',
      searchFailed: 'Поиск не удался',
      play: 'Играть',
      pause: 'Пауза',
      next: 'Следующий',
      prev: 'Предыдущий',
      previewBadge: 'превью 30 с',
      queueEmpty: 'Очередь пуста',
      nowPlaying: 'Сейчас играет',
      tabSearch: 'Поиск',
      tabWave: 'Волна',
      tabPlaylists: 'Плейлисты',
      tabQueue: 'Очередь',
      addToPlaylist: 'В плейлист',
      newPlaylistPlaceholder: 'Название нового плейлиста',
      createPlaylist: 'Создать',
      noPlaylists: 'Плейлистов пока нет',
      addedToPlaylist: 'Добавлено',      shuffle: 'Перемешать',
      repeatOff: 'Повтор выключен',
      repeatAll: 'Повтор очереди',
      repeatOne: 'Повтор трека',
      clearQueue: 'Очистить очередь',
      moveUp: 'Выше',
      moveDown: 'Ниже',
      removeRow: 'Убрать из очереди',      back: 'Назад',
      addToQueue: 'В очередь',
      playNext: 'Играть следом',
      addedToQueue: 'Добавлено в очередь',
      addAllToQueue: 'Всё в очередь',
      addedAll: 'Вся выдача в очереди',
      jumpToCurrent: 'К текущему треку',
      scrollTop: 'Наверх',
      artistsSection: 'Исполнители',
      albumsSection: 'Альбомы',
      tracksSection: 'Треки',
      tracksCount: 'треков',
      allTracks: 'Всего треков',
      openAlbum: 'Открыть альбом',
      openArtist: 'Открыть исполнителя',
      volume: 'Громкость',
      mute: 'Выключить звук',
      unmute: 'Включить звук',
      lyrics: 'Текст песни',
      noLyrics: 'У этого трека нет текста',
      lyricsEstimated: 'Текст без таймкодов — строки идут по длительности',
      likedPlaylist: 'Мне нравится',
      like: 'Добавить в «Мне нравится»',
      unlike: 'Убрать из «Мне нравится»',
      waveStart: 'Включить «Мою волну»',
      waveLoading: 'Загружаем волну…',
      playbackFailed: 'Не удалось воспроизвести трек',
      idleHint: 'Ничего не играет',
      archiveRow: 'View archive',
      remoteControl: 'Remote Control',
      deviceHint: 'Откройте ya.ru/device и введите код:',
      deviceWaiting: 'Ждём подтверждения на странице Яндекса…',
      deviceCheck: 'Проверить',
      deviceRestart: 'Новый код',
      retry: 'Повторить',
      errorGeneric: 'Не удалось выполнить запрос',
    };

    const en = {
      entry: 'Yandex Music',
      title: 'Yandex Music',
      close: 'Close',
      loading: 'Checking sign-in…',
      setupTitle: 'Connect the application',
      setupHint: 'Create an application at oauth.yandex.ru with Redirect URI https://oauth.yandex.ru/verification_code and paste its client_id. No secret is needed: sign-in uses PKCE.',
      setupLink: 'Open oauth.yandex.ru',
      clientId: 'client_id',
      clientSecret: 'client_secret (optional)',
      useMusicClient: "Use Yandex Music's client_id",
      musicClientHint: "The official Music client: its token gets Plus and full tracks. Someone else's application — use at your own risk.",
      save: 'Save',
      saving: 'Saving…',
      loginTitle: 'Sign in to Yandex',
      loginHint: 'Open the page and allow access. If Yandex shows a 7-digit code, enter it. If you were redirected to your own Redirect URI, copy the code parameter from the address bar.',
      login: 'Sign in to Yandex',
      openPage: 'Open the sign-in page',
      code: 'Confirmation code or code from the address bar',
      submit: 'Confirm',
      submitting: 'Checking the code…',
      signedIn: 'Signed in as',
      account: 'Account',
      noPlus: 'Without Yandex Plus only 30-second previews are available.',
      logout: 'Sign out',
      searchPlaceholder: 'Find a track or artist',
      searching: 'Searching…',
      nothingFound: 'Nothing found',
      searchFailed: 'Search failed',
      play: 'Play',
      pause: 'Pause',
      next: 'Next',
      prev: 'Previous',
      previewBadge: '30 s preview',
      queueEmpty: 'The queue is empty',
      nowPlaying: 'Now playing',
      tabSearch: 'Search',
      tabWave: 'My Wave',
      tabPlaylists: 'Playlists',
      tabQueue: 'Queue',
      addToPlaylist: 'Add to playlist',
      newPlaylistPlaceholder: 'New playlist name',
      createPlaylist: 'Create',
      noPlaylists: 'No playlists yet',
      addedToPlaylist: 'Added',      shuffle: 'Shuffle',
      repeatOff: 'Repeat off',
      repeatAll: 'Repeat queue',
      repeatOne: 'Repeat one',
      clearQueue: 'Clear queue',
      moveUp: 'Move up',
      moveDown: 'Move down',
      removeRow: 'Remove from queue',      back: 'Back',
      addToQueue: 'Add to queue',
      playNext: 'Play next',
      addedToQueue: 'Added to the queue',
      addAllToQueue: 'Add all',
      addedAll: 'Every result is queued',
      jumpToCurrent: 'Jump to the current track',
      scrollTop: 'Back to top',
      artistsSection: 'Artists',
      albumsSection: 'Albums',
      tracksSection: 'Tracks',
      tracksCount: 'tracks',
      allTracks: 'Total tracks',
      openAlbum: 'Open the album',
      openArtist: 'Open the artist',
      volume: 'Volume',
      mute: 'Mute',
      unmute: 'Unmute',
      lyrics: 'Lyrics',
      noLyrics: 'No lyrics for this track',
      lyricsEstimated: 'No timecodes — lines follow the track length',
      likedPlaylist: 'Liked tracks',
      like: 'Add to liked tracks',
      unlike: 'Remove from liked tracks',
      waveStart: 'Start My Wave',
      waveLoading: 'Loading the wave…',
      playbackFailed: 'Could not play this track',
      idleHint: 'Nothing is playing',
      archiveRow: 'View archive',
      remoteControl: 'Remote Control',
      deviceHint: 'Open ya.ru/device and enter the code:',
      deviceWaiting: 'Waiting for confirmation on the Yandex page…',
      deviceCheck: 'Check now',
      deviceRestart: 'New code',
      retry: 'Retry',
      errorGeneric: 'The request failed',
    };

    /* ------------------------------------------------------------------ */
    /* styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = `
.ym-entry{display:flex;align-items:center;gap:8px;width:100%;padding:6px 12px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;text-align:left;cursor:pointer}
.ym-entry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.ym-entry[data-rail="true"]{justify-content:center;padding:6px 0}
.ym-entry[data-playing="true"]{padding-right:34px}
.ym-entry-wrap{position:relative;display:flex;width:100%}
.ym-entry-toggle{position:absolute;right:6px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;cursor:pointer}
.ym-entry-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.ym-mini{display:flex;flex-direction:column;gap:7px;padding:10px 11px;border-radius:11px;color:var(--dsw-alias-label-primary)}
.ym-mini:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-mini-top{display:flex;align-items:center;gap:8px;min-width:0}
.ym-mini-open{display:flex;align-items:center;gap:8px;min-width:0;flex:1;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ym-mini-cover{flex:none;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.08));color:var(--dsw-alias-label-secondary)}
.ym-mini-cover img{width:100%;height:100%;object-fit:cover;display:block}
.ym-mini-body{min-width:0;display:flex;flex-direction:column;gap:1px;flex:1}
.ym-mini-title-line{overflow:hidden;white-space:nowrap;font-size:13px;line-height:1.4;font-weight:500}
.ym-mini-title-inner{display:inline-block;white-space:nowrap}
.ym-mini-title-inner[data-scroll="true"]{animation:ym-marquee 16s linear infinite}
.ym-mini-title-inner[data-scroll="true"]>span{padding-left:40px}
@keyframes ym-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ym-mini-artist{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--dsw-alias-label-secondary)}
.ym-mini-controls{display:flex;align-items:center;gap:2px;flex:none}
.ym-mini-button{display:inline-flex;align-items:center;justify-content:center;width:27px;height:27px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1;cursor:pointer}
.ym-mini-button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.ym-mini-button[data-primary="true"]{background:var(--dsw-alias-bg-accent,#3b6fe0);color:#fff}
.ym-mini-progress{display:flex;align-items:center;gap:8px;padding:0 2px}
.ym-mini-bar{position:relative;flex:1;height:4px;border-radius:2px;background:var(--dsw-alias-border-l1,rgba(255,255,255,.16));overflow:hidden;cursor:pointer}
.ym-mini-bar-fill{position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:var(--dsw-alias-bg-accent,#3b6fe0)}
.ym-mini-time{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
/* «View archive» lives in the More menu now; its own dialog stays mounted and
   is still driven by this button, which is why it is hidden rather than removed. */
[data-slot="sidebar.footer.action"] .aav-footerBtn{display:none !important}
.ym-entry-icon{display:inline-flex;flex:none}
.ym-entry-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-card{position:fixed;z-index:60;box-sizing:border-box;width:380px;height:380px;padding:0;border-radius:14px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12));box-shadow:0 18px 44px rgba(0,0,0,.55);color:var(--dsw-alias-label-primary);font-size:13px;overflow:hidden;display:flex;background:rgba(18,18,21,.82);backdrop-filter:blur(6px)}
.ym-card-bg{position:absolute;inset:-12%;background-size:cover;background-position:center;background-repeat:no-repeat;filter:blur(14px) saturate(1.2);opacity:.95;pointer-events:none;transform:scale(1.08)}
.ym-card-scrim{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(10,10,12,.16) 0%,rgba(10,10,12,.42) 58%,rgba(10,10,12,.74) 100%)}
.ym-card-inner{position:relative;z-index:1;display:flex;flex-direction:column;width:100%;height:100%;min-height:0}
.ym-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 6px;flex:none}
.ym-card-title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-card-pane{flex:1;min-height:0;overflow-y:auto;padding:0 12px 8px}
.ym-card-player{flex:none;padding:8px 12px 11px;border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.22)}
.ym-head-actions{display:flex;align-items:center;gap:2px;flex:none}
.ym-account{position:absolute;top:46px;right:10px;z-index:20;min-width:210px;max-width:260px;padding:11px;border-radius:11px;background:rgba(18,18,22,.97);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));box-shadow:0 10px 28px rgba(0,0,0,.5)}
.ym-account-name{font-size:12px;line-height:1.45;margin:0 0 9px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.ym-card-close{border:0;background:transparent;color:inherit;cursor:pointer;padding:2px 6px;border-radius:6px;font-size:16px;line-height:1}
.ym-card-close:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-form{display:flex;flex-direction:column;gap:8px}
.ym-field{display:flex;flex-direction:column;gap:4px}
.ym-label{font-size:12px;color:var(--dsw-alias-label-secondary)}
.ym-input{box-sizing:border-box;width:100%;padding:6px 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));background:var(--dsw-alias-bg-l1,transparent);color:inherit;font:inherit;font-size:13px}
.ym-input:focus{outline:2px solid var(--dsw-alias-border-accent,#4c8dff);outline-offset:1px}
.ym-button{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 12px;border-radius:8px;border:1px solid transparent;background:var(--dsw-alias-bg-accent,#3b6fe0);color:#fff;font:inherit;font-size:13px;cursor:pointer}
.ym-button:disabled{opacity:.55;cursor:default}
.ym-button[data-variant="ghost"]{background:transparent;border-color:var(--dsw-alias-border-l1,rgba(255,255,255,.14));color:inherit}
.ym-hint{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.45;margin:0}
.ym-error{font-size:12px;color:var(--dsw-alias-label-danger,#ff6b6b);margin:0}
.ym-link{color:var(--dsw-alias-label-accent,#7aa7ff);word-break:break-all;font-size:12px}
.ym-row{display:flex;align-items:center;gap:8px}
.ym-code{font-variant-numeric:tabular-nums}
.ym-add{position:absolute;bottom:calc(100% + 6px);right:0;left:0;z-index:6;padding:10px;border-radius:11px;background:rgba(16,16,20,.97);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));box-shadow:0 12px 30px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:7px;max-height:250px}
.ym-add-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ym-add-title{font-size:12px;font-weight:600}
.ym-add-list{overflow-y:auto;display:flex;flex-direction:column;gap:1px}
.ym-add-create{display:flex;gap:6px;align-items:center}
.ym-add-create .ym-input{flex:1;min-width:0}.ym-queue-head{display:flex;align-items:center;gap:4px;position:sticky;top:var(--ym-tabs-h,35px);z-index:5;margin:0 -12px -8px;padding:5px 12px 9px;background:rgba(20,20,24,.88);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.07)}
.ym-queue-row{display:flex;align-items:center;gap:4px;padding:2px 4px;border-radius:8px;border:1px dashed transparent}
.ym-queue-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-queue-row[data-active="true"]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.ym-queue-row[data-over="true"]{border-color:var(--dsw-alias-border-accent,#3b6fe0)}
.ym-queue-grip{flex:none;width:10px;cursor:grab;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;opacity:.65}
.ym-queue-open{display:flex;align-items:center;gap:8px;flex:1;min-width:0;padding:2px 0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ym-queue-actions{display:flex;align-items:center;gap:1px;flex:none}
.ym-mini-button[data-on="true"]{color:var(--dsw-alias-label-accent,#7aa7ff)}.ym-tabs{display:flex;gap:4px;position:sticky;top:0;z-index:6;margin:0 -12px -8px;padding:3px 12px 8px;background:rgba(20,20,24,.88);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.07)}.ym-tab{font-size:11px}.ym-playlist-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500}
.ym-tab{flex:1;padding:5px 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.ym-tab:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-tab[data-active="true"]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-primary)}
.ym-device-code{font-size:20px;letter-spacing:.22em;font-weight:600;text-align:center;padding:10px;border-radius:8px;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.06));font-variant-numeric:tabular-nums}
.ym-search{width:100%}
.ym-results{display:flex;flex-direction:column;gap:1px;margin:8px -4px 0;padding:0 4px}
.ym-result{display:flex;align-items:center;gap:8px;width:100%;padding:5px 6px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}
.ym-result:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-result[data-active="true"]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.ym-result-cover{flex:none;width:32px;height:32px;border-radius:6px;object-fit:cover;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.06))}
.ym-result-icon{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.06));font-size:14px}
.ym-result-text{min-width:0;display:flex;flex-direction:column;gap:1px}
.ym-result-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-result-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px}
.ym-result-time{margin-left:auto;flex:none;color:var(--dsw-alias-label-secondary);font-size:11px;font-variant-numeric:tabular-nums}
.ym-result-actions{display:flex;align-items:center;gap:1px;flex:none;opacity:.55;transition:opacity .12s}
.ym-result-actions .ym-mini-button{width:22px;height:22px}
.ym-result:hover .ym-result-actions,.ym-result[data-active="true"] .ym-result-actions{opacity:1}
.ym-results-head{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:4px 0 -2px}
.ym-sticky-bar{position:sticky;top:var(--ym-tabs-h,35px);z-index:5;margin:0 -12px -8px;padding:5px 12px 9px;background:rgba(20,20,24,.88);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.07)}
.ym-section{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-secondary);margin:6px 0 -2px}
.ym-strip{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:2px 2px 4px;margin:0 -2px;scrollbar-width:thin}
.ym-chip{flex:none;width:72px;display:flex;flex-direction:column;gap:4px;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ym-chip-cover{display:block;width:72px;height:72px;border-radius:8px;object-fit:cover;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.06))}
.ym-chip-cover[data-round="true"]{border-radius:50%}
.ym-chip:hover .ym-chip-cover{filter:brightness(1.15)}
.ym-chip-title{font-size:11px;line-height:1.25;max-height:2.5em;overflow:hidden;overflow-wrap:anywhere}
.ym-cover-button{flex:none;display:inline-flex;padding:0;border:0;border-radius:6px;background:transparent;cursor:pointer}
.ym-cover-button:hover{filter:brightness(1.15)}
.ym-link-button{padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;max-width:100%}
.ym-link-button:hover{color:var(--dsw-alias-label-accent,#7aa7ff);text-decoration:underline}
.ym-result-sub.ym-link-button{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
.ym-index{flex:none;width:16px;text-align:right;font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ym-player{margin-top:0;padding-top:0;border-top:0;position:relative}
.ym-player-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.ym-player-title{min-width:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-badge{flex:none;font-size:10px;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.16));color:var(--dsw-alias-label-secondary)}
.ym-controls{display:flex;align-items:center;gap:6px}
.ym-icon-button{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer}
.ym-icon-button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-icon-button[data-primary="true"]{background:var(--dsw-alias-bg-accent,#3b6fe0);color:#fff}
.ym-seek{flex:1;min-width:0;accent-color:var(--dsw-alias-bg-accent,#3b6fe0)}
.ym-time{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ym-icon-button[data-on="true"]{color:var(--dsw-alias-label-accent,#7aa7ff)}
.ym-volume{display:flex;align-items:center;gap:4px;margin-top:6px}
.ym-volume .ym-icon-button{width:22px;height:22px}
.ym-volume-range{flex:1;min-width:0;max-width:120px;height:14px;accent-color:var(--dsw-alias-bg-accent,#3b6fe0)}
.ym-volume-value{min-width:30px;text-align:right}
.ym-lyrics-card{position:fixed;z-index:61;box-sizing:border-box;width:380px;height:380px;display:flex;flex-direction:column;border-radius:14px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12));box-shadow:0 18px 44px rgba(0,0,0,.55);color:var(--dsw-alias-label-primary);font-size:13px;overflow:hidden;background:rgba(18,18,21,.94);backdrop-filter:blur(10px)}
.ym-lyrics-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 2px}
.ym-lyrics-track{flex:none;margin:0;padding:0 12px 6px;font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,.07)}
.ym-lyrics-body{flex:1;min-height:0;overflow-y:auto;padding:14px 14px 28px}
.ym-lyric{margin:0 0 8px;font-size:13px;line-height:1.45;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:color .12s}
.ym-lyric:hover{color:var(--dsw-alias-label-primary)}
.ym-lyric[data-past="true"]{opacity:.55}
.ym-lyric[data-active="true"]{color:var(--dsw-alias-label-accent,#7aa7ff);font-weight:600;font-size:15px;line-height:1.4}
.ym-lyric-gap{height:6px}
.ym-lyrics-note{margin:14px 0 0;font-size:10px;color:var(--dsw-alias-label-secondary);opacity:.7}
`;

    /** Inject the plugin stylesheet once; the disposer removes it on teardown. */
    function installStyles() {
      if (typeof document === 'undefined') return () => {};
      const existing = document.querySelector(`style[data-plugin="${STYLE_ID}"]`);
      if (existing !== null) {
        // A reloaded revision must replace the rules, not inherit the old ones:
        // the tag survives the bundle swap, and stale CSS silently won every
        // specificity tie against the new layout.
        existing.textContent = CSS;
        return () => {};
      }
      const tag = document.createElement('style');
      tag.dataset.plugin = STYLE_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
      return () => {
        tag.remove();
      };
    }

    /* ------------------------------------------------------------------ */
    /* transport                                                           */
    /* ------------------------------------------------------------------ */

    /** Call one Host route and unwrap the `{ ok, value }` envelope. */
    async function call(path, body) {
      const response = await window.fetch(`${API}/${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: body === undefined ? {} : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const envelope = await response.json().catch(() => null);
      if (envelope === null || typeof envelope !== 'object') {
        const error = new Error('bad response');
        error.code = 'response';
        throw error;
      }
      if (envelope.ok !== true) {
        const failure = envelope.error !== null && typeof envelope.error === 'object' ? envelope.error : {};
        const error = new Error(typeof failure.message === 'string' ? failure.message : 'request failed');
        error.code = typeof failure.code === 'string' ? failure.code : 'unknown';
        throw error;
      }
      return envelope.value;
    }

    /* ------------------------------------------------------------------ */
    /* plugin navigation                                                   */
    /* ------------------------------------------------------------------ */

    /**
     * `pluginNavigation` belongs to the plugin-manager bundle and is optional:
     * without it there is no page to send the relocated entry to, so the menu
     * row stays hidden instead of becoming a dead button.
     */
    const navigation = { available: false, listeners: new Set() };

    function setNavigation(value) {
      if (navigation.available === value) return;
      navigation.available = value;
      for (const listener of navigation.listeners) listener();
    }

    function useNavigation() {
      const [, force] = React.useReducer((value) => value + 1, 0);
      React.useEffect(() => {
        navigation.listeners.add(force);
        return () => {
          navigation.listeners.delete(force);
        };
      }, []);
      return navigation.available;
    }

    /** Auth state for the popover: the header and the body share one status. */
    function useAuth() {
      const [state, setState] = React.useState({ loading: true, status: null, error: '' });

      const reload = React.useCallback(async () => {
        try {
          const status = await call('auth/status');
          setState({ loading: false, status, error: '' });
        } catch (failure) {
          setState({ loading: false, status: null, error: failure.message || 'request failed' });
        }
      }, []);

      React.useEffect(() => {
        void reload();
      }, [reload]);

      return { ...state, reload };
    }

    /* ------------------------------------------------------------------ */
    /* components                                                          */
    /* ------------------------------------------------------------------ */

    /** Decorative profile glyph for the account button in the card header. */
    function ProfileIcon({ size }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      h('circle', { cx: 12, cy: 8.5, r: 3.5 }),
      h('path', { d: 'M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6' }));
    }

    /** Speaker glyph; the mute state drops the sound waves. */
    function VolumeIcon({ size, muted }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      h('path', { d: 'M4 9.5h3.5L12 5.5v13L7.5 14.5H4z' }),
      muted
        ? h('path', { d: 'M16 9.5l4 5M20 9.5l-4 5' })
        : h('path', { d: 'M15.5 8.8a5 5 0 0 1 0 6.4M18 6.5a8.5 8.5 0 0 1 0 11' }));
    }

    /** Decorative music note; the sidebar owns the accessible name. */
    function NoteIcon({ size }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      h('path', { d: 'M9 18V5l12-2v13' }),
      h('circle', { cx: 6, cy: 18, r: 3 }),
      h('circle', { cx: 18, cy: 16, r: 3 }));
    }

    /** One-time application setup: the OAuth client id, not a user token. */
    function SetupScreen({ t, onSaved }) {
      const [clientId, setClientId] = React.useState('');
      const [clientSecret, setClientSecret] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState('');

      const submit = async (event) => {
        event.preventDefault();
        if (clientId.trim() === '' || busy) return;
        setBusy(true);
        setError('');
        try {
          await call('auth/config', { clientId: clientId.trim(), clientSecret: clientSecret.trim() });
          await onSaved();
        } catch (failure) {
          setError(failure.message || t('errorGeneric'));
        } finally {
          setBusy(false);
        }
      };

      return h('form', { className: 'ym-form', onSubmit: submit },
        h('p', { className: 'ym-hint' }, t('setupHint')),
        h('a', {
          className: 'ym-link',
          href: 'https://oauth.yandex.ru/client/new',
          target: '_blank',
          rel: 'noreferrer',
        }, t('setupLink')),
        h('button', {
          className: 'ym-button',
          'data-variant': 'ghost',
          type: 'button',
          onClick: () => setClientId(MUSIC_CLIENT_ID),
        }, t('useMusicClient')),
        h('p', { className: 'ym-hint' }, t('musicClientHint')),
        h('label', { className: 'ym-field' },
          h('span', { className: 'ym-label' }, t('clientId')),
          h('input', {
            className: 'ym-input',
            value: clientId,
            autoComplete: 'off',
            spellCheck: false,
            onChange: (event) => setClientId(event.target.value),
          })),
        h('label', { className: 'ym-field' },
          h('span', { className: 'ym-label' }, t('clientSecret')),
          h('input', {
            className: 'ym-input',
            type: 'password',
            value: clientSecret,
            autoComplete: 'off',
            onChange: (event) => setClientSecret(event.target.value),
          })),
        error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, error) : null,
        h('button', { className: 'ym-button', type: 'submit', disabled: busy || clientId.trim() === '' },
          busy ? t('saving') : t('save')));
    }

    /**
     * Device Flow sign-in. Yandex shows a short code, the user types it at
     * ya.ru/device, and the plugin polls until the token arrives — no redirect
     * URI and no token to copy. This is the only flow the Music client accepts.
     */
    function DeviceScreen({ t, onSignedIn }) {
      const [flow, setFlow] = React.useState(null);
      const [error, setError] = React.useState('');
      const [starting, setStarting] = React.useState(true);
      const sessionRef = React.useRef(0);
      const busyRef = React.useRef(false);

      const start = React.useCallback(async () => {
        sessionRef.current += 1;
        const session = sessionRef.current;
        setStarting(true);
        setError('');
        setFlow(null);
        try {
          const value = await call('auth/device/start', {});
          if (session !== sessionRef.current) return;
          setFlow(value);
          try {
            window.open(value.verificationUrl, '_blank', 'noopener');
          } catch {
            /* the link below is the fallback */
          }
        } catch (failure) {
          if (session === sessionRef.current) setError(failure.message || 'device auth failed');
        } finally {
          if (session === sessionRef.current) setStarting(false);
        }
      }, []);

      React.useEffect(() => {
        void start();
      }, [start]);

      const poll = React.useCallback(async () => {
        if (flow === null || busyRef.current) return;
        const session = sessionRef.current;
        busyRef.current = true;
        try {
          const value = await call('auth/device/poll', { flowId: flow.flowId });
          if (session !== sessionRef.current) return;
          if (value.pending === true) {
            setError('');
            return;
          }
          await onSignedIn();
        } catch (failure) {
          if (session === sessionRef.current) setError(failure.message || 'device auth failed');
        } finally {
          busyRef.current = false;
        }
      }, [flow, onSignedIn]);

      React.useEffect(() => {
        if (flow === null) return undefined;
        const ms = Math.max(2, typeof flow.interval === 'number' ? flow.interval : 5) * 1000;
        const timer = window.setInterval(() => {
          void poll();
        }, ms);
        return () => window.clearInterval(timer);
      }, [flow, poll]);

      if (starting && flow === null) return h('p', { className: 'ym-hint' }, t('loading'));

      if (flow === null) {
        return h('div', { className: 'ym-form' },
          h('p', { className: 'ym-error', role: 'alert' }, error),
          h('button', {
            className: 'ym-button',
            type: 'button',
            onClick: () => void start(),
          }, t('retry')));
      }

      return h('div', { className: 'ym-form' },
        h('p', { className: 'ym-hint' }, t('deviceHint')),
        h('div', { className: 'ym-device-code' }, flow.userCode),
        h('a', {
          className: 'ym-link',
          href: flow.verificationUrl,
          target: '_blank',
          rel: 'noreferrer',
        }, flow.verificationUrl),
        error !== ''
          ? h('p', { className: 'ym-error', role: 'alert' }, error)
          : h('p', { className: 'ym-hint' }, t('deviceWaiting')),
        h('button', {
          className: 'ym-button',
          type: 'button',
          onClick: () => void poll(),
        }, t('deviceCheck')),
        h('button', {
          className: 'ym-button',
          'data-variant': 'ghost',
          type: 'button',
          onClick: () => void start(),
        }, t('deviceRestart')));
    }


    /** Signed-in summary with a way out. */
    /**
     * Playback state lives outside React on purpose: the popover unmounts when
     * it closes, and an <audio> owned by the component tree would stop the music.
     */
    const player = {
      audio: null,
      queue: [],
      index: -1,
      current: null,
      preview: false,
      playing: false,
      position: 0,
      duration: 0,
      error: '',
      repeat: 'off',
      volume: 1,
      muted: false,
      lyricsOpen: false,
      listeners: new Set(),
    };

    /** Volume is the one setting worth remembering across reloads. */
    const VOLUME_KEY = 'dsh-yandex-music.volume';
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage === 'object' && window.localStorage !== null) {
        const stored = Number(window.localStorage.getItem(VOLUME_KEY));
        if (Number.isFinite(stored) && stored >= 0 && stored <= 1) player.volume = stored;
      }
    } catch {
      /* a blocked storage must never break the player */
    }

    /** Push the volume onto whichever element is current and remember it. */
    function applyVolume() {
      const audio = player.audio;
      if (audio !== null) audio.volume = player.muted ? 0 : player.volume;
      try {
        if (typeof window !== 'undefined' && window.localStorage !== null) {
          window.localStorage.setItem(VOLUME_KEY, String(player.volume));
        }
      } catch {
        /* ignore an unwritable storage */
      }
      emit();
    }

    function setVolume(value) {
      const next = Math.min(1, Math.max(0, value));
      player.volume = next;
      player.muted = next === 0;
      applyVolume();
    }

    function toggleMute() {
      if (player.muted && player.volume === 0) player.volume = 0.5;
      player.muted = !player.muted;
      applyVolume();
    }

    function toggleLyrics() {
      player.lyricsOpen = !player.lyricsOpen;
      emit();
    }

    function emit() {
      for (const listener of player.listeners) listener();
    }

    function subscribe(listener) {
      player.listeners.add(listener);
      return () => {
        player.listeners.delete(listener);
      };
    }

    /** One audio element per page, shared by every bundle revision. */
    const AUDIO_KEY = '__dshYandexMusicAudio';
    /** Every element this plugin ever created, so a fresh revision can stop them. */
    const AUDIO_REGISTRY_KEY = '__dshYandexMusicAudioAll';

    function audioRegistry() {
      if (typeof window === 'undefined') return [];
      if (!Array.isArray(window[AUDIO_REGISTRY_KEY])) window[AUDIO_REGISTRY_KEY] = [];
      return window[AUDIO_REGISTRY_KEY];
    }

    /** Hard-stop an element and detach it from the media pipeline. */
    function killAudio(element) {
      try {
        element.pause();
        element.removeAttribute('src');
        element.load();
      } catch {
        /* ignore a disposed element */
      }
    }

    /**
     * Only one thing may play at a time.
     *
     * A page can hold a leftover element from an earlier bundle revision. It is
     * detached from the DOM and invisible to `querySelectorAll`, so every element
     * the plugin creates is also recorded in a window-level registry and killed
     * from there.
     */
    function silenceOthers(own) {
      for (const element of audioRegistry()) {
        if (element !== own) killAudio(element);
      }
      if (typeof document === 'undefined') return;
      try {
        for (const element of document.querySelectorAll('audio')) {
          if (element !== own) killAudio(element);
        }
      } catch {
        /* a hostile DOM must never break playback */
      }
    }

    function ensureAudio() {
      if (player.audio !== null) return player.audio;

      const shared = typeof window === 'undefined' ? null : window[AUDIO_KEY];
      const audio = shared instanceof Audio ? shared : new Audio();
      audio.preload = 'auto';
      audio.volume = player.muted ? 0 : player.volume;
      // Attached (but hidden) so a reloaded revision can find and stop it.
      if (audio.isConnected !== true && typeof document !== 'undefined') {
        audio.setAttribute('data-yandex-music-audio', '');
        audio.style.display = 'none';
        document.body.appendChild(audio);
      }
      const registry = audioRegistry();
      if (!registry.includes(audio)) registry.push(audio);
      if (typeof window !== 'undefined') window[AUDIO_KEY] = audio;

      // Handlers are replaced, never stacked: a new revision takes over the same
      // element instead of leaving a second set of listeners behind.
      audio.__ym = {
        time: () => {
          player.position = audio.currentTime;
          emit();
        },
        duration: () => {
          player.duration = Number.isFinite(audio.duration) ? audio.duration : 0;
          emit();
        },
        play: () => {
          // Whoever starts, wins: every other element stops right here.
          silenceOthers(audio);
          player.playing = true;
          emit();
        },
        pause: () => {
          player.playing = false;
          emit();
        },
        ended: () => {
          const finished = player.current;
          const played = Number.isFinite(audio.duration) ? audio.duration : player.position;
          if (finished !== null) void sendFeedback('trackFinished', finished, played);
          void advance();
        },
        error: () => {
          player.error = 'playback';
          player.playing = false;
          emit();
        },
      };

      if (audio.__ymWired !== true) {
        audio.__ymWired = true;
        audio.addEventListener('timeupdate', () => audio.__ym?.time());
        audio.addEventListener('durationchange', () => audio.__ym?.duration());
        audio.addEventListener('play', () => audio.__ym?.play());
        audio.addEventListener('pause', () => audio.__ym?.pause());
        audio.addEventListener('ended', () => audio.__ym?.ended());
        audio.addEventListener('error', () => audio.__ym?.error());
      }

      player.audio = audio;
      return audio;
    }

    /** Bumped on every play request so a slow URL fetch cannot start a stale track. */
    let playToken = 0;

    /**
     * Only one thing may play at a time.
     *
     * A reloaded bundle revision can leave a previous `<audio>` alive outside
     * this module's reach, and setting `src` on our own element does not stop
     * it. Everything we do not own is paused and unloaded before a new track
     * starts, so two revisions can never sing over each other.
     */
    function silenceOthers(own) {
      if (typeof document === 'undefined') return;
      try {
        for (const element of document.querySelectorAll('audio')) {
          if (element === own) continue;
          element.pause();
          element.removeAttribute('src');
          element.load();
        }
      } catch {
        /* a hostile DOM must never break playback */
      }
    }

    async function playAt(index) {
      if (index < 0 || index >= player.queue.length) return;
      const token = ++playToken;
      player.index = index;
      player.current = player.queue[index];
      player.error = '';
      player.position = 0;
      player.duration = 0;
      emit();
      try {
        const value = await call('music/track-url', {
          trackId: player.current.id,
          albumId: player.current.albumId,
        });
        if (token !== playToken) return;
        const audio = ensureAudio();
        silenceOthers(audio);
        player.preview = value.preview === true;
        // Assigning `src` stops the previous media by itself; an explicit
        // pause() here would reject the previous play() promise and surface a
        // bogus error in the UI.
        audio.src = value.url;
        await audio.play();
        if (token !== playToken) return;
        void sendFeedback('trackStarted', player.current);
      } catch (failure) {
        if (token !== playToken) return;
        // A superseded play() rejects with AbortError — that is not a failure.
        if (failure instanceof Error && failure.name === 'AbortError') {
          emit();
          return;
        }
        player.error = 'playback';
        player.playing = false;
      }
      emit();
    }

    async function step(delta) {
      if (player.queue.length === 0) return;
      const target = player.index + delta;
      if (target < 0 || target >= player.queue.length) {
        if (delta > 0) {
          player.playing = false;
          emit();
        }
        return;
      }
      await playAt(target);
    }

    function togglePlay() {
      const audio = ensureAudio();
      if (player.current === null) {
        if (player.queue.length > 0) void playAt(0);
        return;
      }
      if (audio.paused) {
        silenceOthers(audio);
        void audio.play();
      } else {
        audio.pause();
      }
    }

    function playQueue(tracks, index) {
      waveSession.active = false;
      player.queue = tracks.slice();
      void playAt(index);
    }

    /* ------------------------------------------------------------------ */
    /* wave                                                                */
    /* ------------------------------------------------------------------ */

    /**
     * The rotor returns five tracks per batch and a fresh `batchId` each time,
     * so an endless stream means asking for the next batch when the queue ends.
     */
    const waveSession = { active: false, station: 'user:onyourwave', batchId: '' };

    /** Feedback is best-effort: a rejected report must never stop the music. */
    async function sendFeedback(type, track, playedSeconds) {
      if (!waveSession.active || track === null) return;
      try {
        await call('music/wave/feedback', {
          station: waveSession.station,
          type,
          trackId: String(track.id),
          ...waveSession.batchId === '' ? {} : { batchId: waveSession.batchId },
          ...playedSeconds === undefined ? {} : { totalPlayedSeconds: Math.round(playedSeconds) },
        });
      } catch {
        /* ignore */
      }
    }

    async function startWave() {
      const value = await call('music/wave');
      const tracks = Array.isArray(value.tracks) ? value.tracks : [];
      if (tracks.length === 0) throw new Error('wave is empty');
      waveSession.active = true;
      waveSession.station = typeof value.station === 'string' && value.station !== '' ? value.station : 'user:onyourwave';
      waveSession.batchId = typeof value.batchId === 'string' ? value.batchId : '';
      player.queue = tracks.slice();
      player.index = -1;
      await playAt(0);
    }

    /** Append the next batch and report the index of its first track, or null. */
    async function extendWave() {
      const value = await call('music/wave');
      const tracks = Array.isArray(value.tracks) ? value.tracks : [];
      if (tracks.length === 0) return null;
      waveSession.batchId = typeof value.batchId === 'string' ? value.batchId : '';
      const start = player.queue.length;
      player.queue = player.queue.concat(tracks);
      return start;
    }

    /** Next track: wave batches first, then the repeat mode decides the rest. */
    async function advance() {
      if (waveSession.active && player.index >= player.queue.length - 1) {
        try {
          const next = await extendWave();
          if (next !== null) {
            await playAt(next);
            return;
          }
        } catch {
          /* fall through to the ordinary path */
        }
      }
      if (player.repeat === "one") {
        await playAt(player.index);
        return;
      }
      const next = player.index + 1;
      if (next < player.queue.length) {
        await playAt(next);
        return;
      }
      if (player.repeat === "all" && player.queue.length > 0) {
        await playAt(0);
        return;
      }
      player.playing = false;
      emit();
    }

    /* ------------------------------------------------------------------ */
    /* queue editing                                                       */
    /* ------------------------------------------------------------------ */

    /** Move one row; the playing index follows its track, not its position. */
    function moveInQueue(from, to) {
      if (from === to) return;
      if (from < 0 || to < 0 || from >= player.queue.length || to >= player.queue.length) return;
      const queue = player.queue.slice();
      const [item] = queue.splice(from, 1);
      queue.splice(to, 0, item);
      player.queue = queue;
      if (player.index === from) player.index = to;
      else if (from < player.index && to >= player.index) player.index -= 1;
      else if (from > player.index && to <= player.index) player.index += 1;
      emit();
    }

    function removeFromQueue(index) {
      if (index < 0 || index >= player.queue.length) return;
      const queue = player.queue.slice();
      queue.splice(index, 1);
      player.queue = queue;
      if (index === player.index) {
        if (queue.length === 0) {
          player.current = null;
          player.index = -1;
          player.playing = false;
          const audio = player.audio;
          if (audio !== null) {
            try {
              audio.pause();
              audio.removeAttribute("src");
            } catch {
              /* ignore */
            }
          }
          emit();
          return;
        }
        void playAt(Math.min(index, queue.length - 1));
        return;
      }
      if (index < player.index) player.index -= 1;
      emit();
    }

    function clearQueue() {
      waveSession.active = false;
      player.queue = [];
      player.index = -1;
      player.current = null;
      player.playing = false;
      player.position = 0;
      player.duration = 0;
      const audio = player.audio;
      if (audio !== null) {
        try {
          audio.pause();
          audio.removeAttribute("src");
        } catch {
          /* ignore */
        }
      }
      emit();
    }

    /** Insert right after the playing track — the «play next» action. */
    function playNextInQueue(track) {
      if (player.index < 0 && player.current === null && !player.playing) {
        addToQueue(track);
        return;
      }
      const at = player.index < 0 ? player.queue.length : player.index + 1;
      const queue = player.queue.slice();
      queue.splice(at, 0, track);
      player.queue = queue;
      emit();
    }

    /**
     * Append to the end of the queue. A silent player starts on the first added
     * track instead of quietly filling up, which is what a search click implies.
     */
    function addToQueue(tracks) {
      const list = Array.isArray(tracks) ? tracks.slice() : [tracks];
      if (list.length === 0) return;
      const silent = player.index < 0 && player.current === null && !player.playing;
      const start = player.queue.length;
      player.queue = player.queue.concat(list);
      emit();
      if (silent) void playAt(start);
    }

    /** Shuffle only what is still ahead, so the current track keeps playing. */
    function shuffleUpcoming() {
      const tail = player.queue.slice(player.index + 1);
      for (let i = tail.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const swap = tail[i];
        tail[i] = tail[j];
        tail[j] = swap;
      }
      player.queue = player.queue.slice(0, player.index + 1).concat(tail);
      emit();
    }

    function cycleRepeat() {
      player.repeat = player.repeat === "off" ? "all" : player.repeat === "all" ? "one" : "off";
      emit();
    }

    /* ------------------------------------------------------------------ */
    /* playlists and likes                                                 */
    /* ------------------------------------------------------------------ */

    /** Liked ids, read once per session so the heart shows a real state. */
    const likes = { ids: new Set(), loaded: false, inflight: null };

    async function loadLikes() {
      if (likes.loaded) return likes.ids;
      if (likes.inflight !== null) return likes.inflight;
      likes.inflight = (async () => {
        try {
          // kind 3 is «Мне нравится»; it never appears in the playlists list.
          const value = await call('music/playlist', { kind: 3 });
          likes.ids = new Set((value.tracks || []).map((track) => String(track.id)));
          likes.loaded = true;
        } catch {
          /* an unreadable likes list simply means an empty heart */
        } finally {
          likes.inflight = null;
        }
        return likes.ids;
      })();
      return likes.inflight;
    }

    async function toggleLike(track) {
      const key = String(track.id);
      const next = !likes.ids.has(key);
      await call('music/like', { trackId: key, albumId: track.albumId, liked: next });
      if (next) likes.ids.add(key);
      else likes.ids.delete(key);
      likes.loaded = true;
    }

    /** «Мне нравится» first, then the account's playlists, each opening its tracks. */
    function PlaylistsPane({ t }) {
      const playback = usePlayer();
      const [state, setState] = React.useState({
        view: 'list',
        loading: true,
        error: '',
        playlists: [],
        title: '',
        tracks: [],
        tracksLoading: false,
      });

      React.useEffect(() => {
        let cancelled = false;
        (async () => {
          try {
            const value = await call('music/playlists');
            if (cancelled) return;
            setState((previous) => ({
              ...previous,
              loading: false,
              playlists: Array.isArray(value.playlists) ? value.playlists : [],
              error: '',
            }));
          } catch (failure) {
            if (!cancelled) {
              setState((previous) => ({ ...previous, loading: false, error: failure.message || 'playlists failed' }));
            }
          }
        })();
        return () => {
          cancelled = true;
        };
      }, []);

      const open = async (kind, title) => {
        setState((previous) => ({
          ...previous,
          view: 'tracks',
          title,
          tracks: [],
          tracksLoading: true,
          error: '',
        }));
        try {
          const value = await call('music/playlist', { kind });
          setState((previous) => ({
            ...previous,
            tracksLoading: false,
            tracks: Array.isArray(value.tracks) ? value.tracks : [],
          }));
        } catch (failure) {
          setState((previous) => ({ ...previous, tracksLoading: false, error: failure.message || 'playlist failed' }));
        }
      };

      if (state.view === 'tracks') {
        const playing = playback.current === null ? '' : String(playback.current.id);
        const rows = state.tracks.map((track, index) => h('button', {
          key: `${track.id}-${index}`,
          type: 'button',
          className: 'ym-result',
          'data-active': playing !== '' && playing === String(track.id) ? 'true' : 'false',
          onClick: () => playQueue(state.tracks, index),
        },
        track.cover !== null
          ? h('img', { className: 'ym-result-cover', src: track.cover, alt: '', loading: 'lazy' })
          : h('span', { className: 'ym-result-cover' }),
        h('span', { className: 'ym-result-text' },
          h('span', { className: 'ym-result-title' }, track.title),
          h('span', { className: 'ym-result-sub' }, track.artists)),
        h('span', { className: 'ym-result-time' }, fmtTime(track.durationMs))));

        return h('div', { className: 'ym-form' },
          h('div', { className: 'ym-row ym-sticky-bar' },
            h('button', {
              type: 'button',
              className: 'ym-icon-button',
              'aria-label': t('back'),
              title: t('back'),
              onClick: () => setState((previous) => ({ ...previous, view: 'list', error: '' })),
            }, '\u2190'),
            h('span', { className: 'ym-playlist-title' }, state.title),
            h('button', {
              type: 'button',
              className: 'ym-icon-button',
              'aria-label': t('addAllToQueue'),
              title: t('addAllToQueue'),
              disabled: state.tracks.length === 0,
              onClick: () => addToQueue(state.tracks),
            }, '+')),
          state.tracksLoading ? h('p', { className: 'ym-hint' }, t('searching')) : null,
          state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error) : null,
          h('div', { className: 'ym-results' }, rows));
      }

      const rows = [
        h('button', {
          key: 'liked',
          type: 'button',
          className: 'ym-result',
          onClick: () => void open(3, t('likedPlaylist')),
        },
        h('span', { className: 'ym-result-icon', 'aria-hidden': 'true' }, '\u2665'),
        h('span', { className: 'ym-result-text' },
          h('span', { className: 'ym-result-title' }, t('likedPlaylist')))),
        ...state.playlists.map((playlist) => h('button', {
          key: `k${playlist.kind}`,
          type: 'button',
          className: 'ym-result',
          onClick: () => void open(playlist.kind, playlist.title),
        },
        playlist.cover !== null
          ? h('img', { className: 'ym-result-cover', src: playlist.cover, alt: '', loading: 'lazy' })
          : h('span', { className: 'ym-result-cover' }),
        h('span', { className: 'ym-result-text' },
          h('span', { className: 'ym-result-title' }, playlist.title),
          h('span', { className: 'ym-result-sub' }, `${playlist.owner} · ${playlist.trackCount}`)))),
      ];

      return h('div', { className: 'ym-form' },
        state.loading ? h('p', { className: 'ym-hint' }, t('searching')) : null,
        state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error) : null,
        h('div', { className: 'ym-results' }, rows));
    }
    function seekTo(seconds) {
      const audio = ensureAudio();
      if (Number.isFinite(seconds)) audio.currentTime = seconds;
    }

    /** Re-render on every player mutation without owning the state. */
    function usePlayer() {
      const [, force] = React.useReducer((value) => value + 1, 0);
      React.useEffect(() => subscribe(force), []);
      return player;
    }

    function fmtTime(ms) {
      const total = Math.max(0, Math.round(ms / 1000));
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    }

    /** Queue editor: reorder by drag or arrows, remove, and jump to a track. */
    function QueuePane({ t }) {
      const state = usePlayer();
      const [dragFrom, setDragFrom] = React.useState(-1);
      const [dragOver, setDragOver] = React.useState(-1);
      const listRef = React.useRef(null);

      /** Scroll the popover itself; the sticky toolbar keeps its own position. */
      const scrollPane = (node, top, smooth) => {
        const pane = node === null ? null : node.closest('.ym-card-pane');
        if (pane === null) return;
        pane.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
      };

      const jumpToCurrent = () => {
        const list = listRef.current;
        const row = list === null ? null : list.querySelector('[data-active="true"]');
        if (row === null) return;
        const pane = row.closest('.ym-card-pane');
        if (pane === null) return;
        const paneRect = pane.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        const delta = rowRect.top - paneRect.top - paneRect.height / 2 + rowRect.height / 2;
        pane.scrollTo({ top: Math.max(0, pane.scrollTop + delta), behavior: 'smooth' });
      };

      const repeatLabel = state.repeat === 'one'
        ? t('repeatOne')
        : state.repeat === 'all' ? t('repeatAll') : t('repeatOff');

      const header = h('div', { className: 'ym-queue-head' },
        h('span', { className: 'ym-playlist-title' }, `${t('tabQueue')} · ${state.queue.length}`),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'aria-label': t('shuffle'),
          title: t('shuffle'),
          disabled: state.queue.length < 2,
          onClick: shuffleUpcoming,
        }, '\u21c4'),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'data-on': state.repeat !== 'off' ? 'true' : 'false',
          'aria-label': repeatLabel,
          title: repeatLabel,
          onClick: cycleRepeat,
        }, state.repeat === 'one' ? '\u21b9' : '\u21bb'),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'aria-label': t('jumpToCurrent'),
          title: t('jumpToCurrent'),
          disabled: state.index < 0,
          onClick: jumpToCurrent,
        }, '\u25ce'),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'aria-label': t('scrollTop'),
          title: t('scrollTop'),
          onClick: () => scrollPane(listRef.current, 0, true),
        }, '\u2191'),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'aria-label': t('clearQueue'),
          title: t('clearQueue'),
          disabled: state.queue.length === 0,
          onClick: clearQueue,
        }, '\u2715'));

      if (state.queue.length === 0) {
        return h('div', { className: 'ym-form' }, header, h('p', { className: 'ym-hint' }, t('queueEmpty')));
      }

      const rows = state.queue.map((track, index) => h('div', {
        key: `${track.id}-${index}`,
        className: 'ym-queue-row',
        'data-active': state.index === index ? 'true' : 'false',
        'data-over': dragOver === index ? 'true' : 'false',
        draggable: true,
        onDragStart: () => setDragFrom(index),
        onDragOver: (event) => {
          event.preventDefault();
          setDragOver(index);
        },
        onDragLeave: () => setDragOver(-1),
        onDrop: (event) => {
          event.preventDefault();
          if (dragFrom >= 0) moveInQueue(dragFrom, index);
          setDragFrom(-1);
          setDragOver(-1);
        },
        onDragEnd: () => {
          setDragFrom(-1);
          setDragOver(-1);
        },
      },
      h('span', { className: 'ym-queue-grip', 'aria-hidden': 'true' }, '\u2261'),
      h('button', {
        type: 'button',
        className: 'ym-queue-open',
        onClick: () => {
          void playAt(index);
        },
      },
      track.cover !== null
        ? h('img', { className: 'ym-result-cover', src: track.cover, alt: '', loading: 'lazy' })
        : h('span', { className: 'ym-result-cover' }),
      h('span', { className: 'ym-result-text' },
        h('span', { className: 'ym-result-title' }, track.title),
        h('span', { className: 'ym-result-sub' }, track.artists))),
      h('span', { className: 'ym-queue-actions' },
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'aria-label': t('moveUp'),
          title: t('moveUp'),
          disabled: index === 0,
          onClick: () => moveInQueue(index, index - 1),
        }, '\u2191'),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'aria-label': t('moveDown'),
          title: t('moveDown'),
          disabled: index === state.queue.length - 1,
          onClick: () => moveInQueue(index, index + 1),
        }, '\u2193'),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          'aria-label': t('removeRow'),
          title: t('removeRow'),
          onClick: () => removeFromQueue(index),
        }, '\u00d7'))));

      return h('div', { className: 'ym-form' }, header, h('div', { className: 'ym-results', ref: listRef }, rows));
    }

    /** Add the current track to a Yandex playlist, or create one on the spot. */
    function AddToPlaylist({ t, track, onClose }) {
      const [state, setState] = React.useState({ loading: true, items: [], error: '', done: '' });
      const [title, setTitle] = React.useState('');
      const [busy, setBusy] = React.useState(false);

      const load = React.useCallback(async () => {
        try {
          const value = await call('music/playlists');
          setState({ loading: false, items: Array.isArray(value.playlists) ? value.playlists : [], error: '', done: '' });
        } catch (failure) {
          setState({ loading: false, items: [], error: failure.message || 'playlists failed', done: '' });
        }
      }, []);

      React.useEffect(() => {
        void load();
      }, [load]);

      const insert = async (kind) => {
        if (busy) return;
        setBusy(true);
        try {
          await call('music/playlist/insert', {
            kind,
            trackId: String(track.id),
            albumId: track.albumId,
          });
          setState((previous) => ({ ...previous, error: '', done: t('addedToPlaylist') }));
        } catch (failure) {
          setState((previous) => ({ ...previous, error: failure.message || 'insert failed', done: '' }));
        } finally {
          setBusy(false);
        }
      };

      const create = async () => {
        if (busy || title.trim() === '') return;
        setBusy(true);
        try {
          const created = await call('music/playlist/create', { title: title.trim() });
          setTitle('');
          await insert(created.kind);
          await load();
        } catch (failure) {
          setState((previous) => ({ ...previous, error: failure.message || 'create failed', done: '' }));
        } finally {
          setBusy(false);
        }
      };

      return h('div', { className: 'ym-add', role: 'dialog', 'aria-label': t('addToPlaylist') },
        h('div', { className: 'ym-add-head' },
          h('span', { className: 'ym-add-title' }, t('addToPlaylist')),
          h('button', {
            className: 'ym-mini-button',
            type: 'button',
            'aria-label': t('close'),
            onClick: onClose,
          }, '\u00d7')),
        state.done !== '' ? h('p', { className: 'ym-hint' }, state.done) : null,
        state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error) : null,
        h('div', { className: 'ym-add-list' },
          state.loading
            ? h('p', { className: 'ym-hint' }, t('searching'))
            : state.items.length === 0
              ? h('p', { className: 'ym-hint' }, t('noPlaylists'))
              : state.items.map((playlist) => h('button', {
                key: `k${playlist.kind}`,
                type: 'button',
                className: 'ym-result',
                disabled: busy,
                onClick: () => void insert(playlist.kind),
              },
              h('span', { className: 'ym-result-text' },
                h('span', { className: 'ym-result-title' }, playlist.title),
                h('span', { className: 'ym-result-sub' }, `${playlist.trackCount}`))))),
        h('div', { className: 'ym-add-create' },
          h('input', {
            className: 'ym-input',
            value: title,
            placeholder: t('newPlaylistPlaceholder'),
            maxLength: 120,
            onChange: (event) => setTitle(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') void create();
            },
          }),
          h('button', {
            className: 'ym-button',
            type: 'button',
            disabled: busy || title.trim() === '',
            onClick: () => void create(),
          }, t('createPlaylist'))));
    }

    /** Transport controls for the current track. */
    function PlayerBar({ t }) {
      const state = usePlayer();
      const current = state.current;
      const currentId = current === null ? '' : String(current.id);
      const [likedNow, setLikedNow] = React.useState(false);
      const [addOpen, setAddOpen] = React.useState(false);

      React.useEffect(() => {
        let alive = true;
        if (currentId === '') {
          setLikedNow(false);
          return () => {
            alive = false;
          };
        }
        void loadLikes().then((ids) => {
          if (alive) setLikedNow(ids.has(currentId));
        });
        return () => {
          alive = false;
        };
      }, [currentId]);

      if (current === null) return null;
      const durationMs = state.duration > 0 ? state.duration * 1000 : current.durationMs;
      return h('div', { className: 'ym-player' },
        h('div', { className: 'ym-player-head' },
          h('span', { className: 'ym-player-title' }, `${current.title} — ${current.artists}`),
          state.preview ? h('span', { className: 'ym-badge' }, t('previewBadge')) : null),
        h('div', { className: 'ym-controls' },
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'aria-label': t('prev'),
            onClick: () => void step(-1),
          }, '\u23ee'),
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'data-primary': 'true',
            'aria-label': state.playing ? t('pause') : t('play'),
            onClick: togglePlay,
          }, state.playing ? '\u23f8' : '\u25b6'),
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'aria-label': t('next'),
            onClick: () => void step(1),
          }, '\u23ed'),
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'aria-label': likedNow ? t('unlike') : t('like'),
            title: likedNow ? t('unlike') : t('like'),
            onClick: () => {
              void (async () => {
                try {
                  await toggleLike(current);
                  setLikedNow(likes.ids.has(currentId));
                } catch {
                  /* a rejected like leaves the heart as it was */
                }
              })();
            },
          }, likedNow ? '\u2665' : '\u2661'),
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'aria-label': t('addToPlaylist'),
            title: t('addToPlaylist'),
            'aria-expanded': addOpen ? 'true' : 'false',
            onClick: () => setAddOpen((value) => !value),
          }, '+'),
          h('input', {
            className: 'ym-seek',
            type: 'range',
            min: 0,
            max: Math.max(1, Math.round(durationMs / 1000)),
            value: Math.round(state.position),
            'aria-label': t('nowPlaying'),
            onChange: (event) => seekTo(Number(event.target.value)),
          }),
          h('span', { className: 'ym-time' }, `${fmtTime(state.position * 1000)} / ${fmtTime(durationMs)}`)),
        h('div', { className: 'ym-volume' },
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'aria-label': state.muted ? t('unmute') : t('mute'),
            title: state.muted ? t('unmute') : t('mute'),
            onClick: toggleMute,
          }, h(VolumeIcon, { size: 15, muted: state.muted })),
          h('input', {
            className: 'ym-volume-range',
            type: 'range',
            min: 0,
            max: 100,
            step: 1,
            value: Math.round((state.muted ? 0 : state.volume) * 100),
            'aria-label': t('volume'),
            title: `${t('volume')}: ${Math.round((state.muted ? 0 : state.volume) * 100)}%`,
            onChange: (event) => setVolume(Number(event.target.value) / 100),
          }),
          h('span', { className: 'ym-time ym-volume-value' }, `${Math.round((state.muted ? 0 : state.volume) * 100)}%`),
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'data-on': state.lyricsOpen ? 'true' : 'false',
            'aria-label': t('lyrics'),
            title: t('lyrics'),
            'aria-pressed': state.lyricsOpen ? 'true' : 'false',
            onClick: toggleLyrics,
          }, 'Aa')),
        addOpen ? h(AddToPlaylist, { t, track: current, onClose: () => setAddOpen(false) }) : null,
        state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error === 'playback' ? t('playbackFailed') : state.error) : null);
    }

    /**
     * Karaoke window docked to the popover. Yandex hands out lyrics as plain
     * lines, so each line's start is derived from the running position and the
     * length of the line itself: monotonic, and it follows the real audio clock.
     */
    function LyricsCard({ t, style, onClose }) {
      const state = usePlayer();
      const current = state.current;
      const currentId = current === null ? '' : String(current.id);
      const [data, setData] = React.useState({ loading: true, error: '', lines: [] });
      const bodyRef = React.useRef(null);

      React.useEffect(() => {
        let cancelled = false;
        if (currentId === '') {
          setData({ loading: false, error: '', lines: [] });
          return undefined;
        }
        setData({ loading: true, error: '', lines: [] });
        (async () => {
          try {
            const value = await call(`music/lyrics?trackId=${encodeURIComponent(currentId)}`);
            if (cancelled) return;
            setData({ loading: false, error: '', lines: Array.isArray(value.lines) ? value.lines : [] });
          } catch (failure) {
            if (!cancelled) setData({ loading: false, error: failure.message || 'lyrics failed', lines: [] });
          }
        })();
        return () => {
          cancelled = true;
        };
      }, [currentId]);

      const lines = data.lines;
      const durationMs = state.duration > 0 ? state.duration * 1000 : (current === null ? 0 : current.durationMs);
      const positionMs = state.position * 1000;

      const weights = lines.map((line) => (line.trim() === '' ? 0.55 : Math.max(1, line.trim().length)));
      const totalWeight = weights.reduce((sum, value) => sum + value, 0);
      const starts = [];
      let active = -1;
      let cursor = 0;
      for (let i = 0; i < lines.length; i += 1) {
        starts.push(totalWeight === 0 ? 0 : (cursor / totalWeight) * durationMs);
        const end = totalWeight === 0 ? 0 : ((cursor + weights[i]) / totalWeight) * durationMs;
        if (active < 0 && durationMs > 0 && positionMs < end) active = i;
        cursor += weights[i];
      }
      if (active < 0 && lines.length > 0) active = lines.length - 1;

      React.useEffect(() => {
        const body = bodyRef.current;
        if (body === null) return;
        const node = body.querySelector('[data-active="true"]');
        if (node === null) return;
        const bodyRect = body.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        const delta = nodeRect.top - bodyRect.top - bodyRect.height / 2 + nodeRect.height / 2;
        if (Math.abs(delta) < 10) return;
        body.scrollTo({ top: Math.max(0, body.scrollTop + delta), behavior: 'smooth' });
      }, [active, lines.length]);

      return h('div', { className: 'ym-lyrics-card', style, role: 'dialog', 'aria-label': t('lyrics') },
        h('div', { className: 'ym-lyrics-head' },
          h('span', { className: 'ym-card-title' }, t('lyrics')),
          h('button', {
            className: 'ym-card-close',
            type: 'button',
            'aria-label': t('close'),
            onClick: onClose,
          }, '\u00d7')),
        h('p', { className: 'ym-lyrics-track' }, current === null ? '' : `${current.title} \u2014 ${current.artists}`),
        h('div', { className: 'ym-lyrics-body', ref: bodyRef },
          data.loading ? h('p', { className: 'ym-hint' }, t('searching')) : null,
          data.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, data.error) : null,
          !data.loading && data.error === '' && lines.length === 0
            ? h('p', { className: 'ym-hint' }, t('noLyrics'))
            : null,
          lines.map((line, index) => line.trim() === ''
            ? h('div', { key: `g${index}`, className: 'ym-lyric-gap', 'aria-hidden': 'true' })
            : h('p', {
              key: `l${index}`,
              className: 'ym-lyric',
              'data-active': index === active ? 'true' : 'false',
              'data-past': index < active ? 'true' : 'false',
              onClick: () => {
                if (durationMs > 0) seekTo(Math.max(0, starts[index] / 1000));
              },
            }, line)),
          lines.length > 0 ? h('p', { className: 'ym-lyrics-note' }, t('lyricsEstimated')) : null));
    }

    /** The «в очередь / следом» pair that every track list offers. */
    function RowActions({ t, track, onAdded }) {
      const announce = (message) => {
        if (typeof onAdded === 'function') onAdded(message);
      };
      return h('span', { className: 'ym-result-actions' },
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          title: t('addToQueue'),
          'aria-label': t('addToQueue'),
          onClick: (event) => {
            event.stopPropagation();
            addToQueue(track);
            announce(t('addedToQueue'));
          },
        }, '+'),
        h('button', {
          className: 'ym-mini-button',
          type: 'button',
          title: t('playNext'),
          'aria-label': t('playNext'),
          onClick: (event) => {
            event.stopPropagation();
            playNextInQueue(track);
            announce(t('playNext'));
          },
        }, '\u21b3'));
    }

    /**
     * An artist or an album opened from a search result. Both pages end in a
     * track list, which is what the user actually came for.
     */
    function DetailPane({ t, entry, onBack, onOpenArtist, onOpenAlbum, onAdded }) {
      const state = usePlayer();
      const [data, setData] = React.useState({ loading: true, error: '', artist: null, album: null, albums: [], tracks: [], total: 0 });

      React.useEffect(() => {
        let cancelled = false;
        setData({ loading: true, error: '', artist: null, album: null, albums: [], tracks: [], total: 0 });
        (async () => {
          try {
            const value = entry.kind === 'artist'
              ? await call(`music/artist?id=${encodeURIComponent(entry.id)}`)
              : await call(`music/album?id=${encodeURIComponent(entry.id)}`);
            if (cancelled) return;
            setData({
              loading: false,
              error: '',
              artist: value.artist === undefined ? null : value.artist,
              album: value.album === undefined ? null : value.album,
              albums: Array.isArray(value.albums) ? value.albums : [],
              tracks: Array.isArray(value.tracks) ? value.tracks : [],
              total: typeof value.total === 'number' ? value.total : 0,
            });
          } catch (failure) {
            if (!cancelled) {
              setData({ loading: false, error: failure.message || 'page failed', artist: null, album: null, albums: [], tracks: [], total: 0 });
            }
          }
        })();
        return () => {
          cancelled = true;
        };
      }, [entry.kind, entry.id]);

      const title = entry.kind === 'artist'
        ? (data.artist !== null && data.artist.name !== '' ? data.artist.name : entry.title)
        : (data.album !== null && data.album.title !== '' ? data.album.title : entry.title);

      const bar = h('div', { className: 'ym-row ym-sticky-bar' },
        h('button', {
          className: 'ym-icon-button',
          type: 'button',
          'aria-label': t('back'),
          title: t('back'),
          onClick: onBack,
        }, '\u2190'),
        h('span', { className: 'ym-playlist-title' }, title),
        h('button', {
          className: 'ym-icon-button',
          type: 'button',
          'aria-label': t('addAllToQueue'),
          title: t('addAllToQueue'),
          disabled: data.tracks.length === 0,
          onClick: () => {
            addToQueue(data.tracks);
            if (typeof onAdded === 'function') onAdded(t('addedAll'));
          },
        }, '+'));

      const chips = data.albums.map((album) => h('button', {
        key: `al${album.id}`,
        className: 'ym-chip',
        type: 'button',
        title: `${album.title}${album.year === null ? '' : ` · ${album.year}`}`,
        onClick: () => onOpenAlbum(album.id, album.title),
      },
      album.cover !== null
        ? h('img', { className: 'ym-chip-cover', src: album.cover, alt: '', loading: 'lazy' })
        : h('span', { className: 'ym-chip-cover' }),
      h('span', { className: 'ym-chip-title' }, album.title)));

      const rows = data.tracks.map((track, index) => h('div', {
        key: `${track.id}-${index}`,
        className: 'ym-result',
        role: 'button',
        tabIndex: 0,
        'data-active': state.current !== null && String(state.current.id) === String(track.id) ? 'true' : 'false',
        onClick: () => playQueue(data.tracks, index),
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            playQueue(data.tracks, index);
          }
        },
      },
      entry.kind === 'album'
        ? h('span', { className: 'ym-index' }, String(index + 1))
        : track.cover !== null
          ? h('img', { className: 'ym-result-cover', src: track.cover, alt: '', loading: 'lazy' })
          : h('span', { className: 'ym-result-cover' }),
      h('span', { className: 'ym-result-text' },
        h('span', { className: 'ym-result-title' }, track.title),
        entry.kind === 'artist' && track.albumId !== null && track.albumTitle !== ''
          ? h('button', {
            className: 'ym-link-button ym-result-sub',
            type: 'button',
            title: t('openAlbum'),
            onClick: (event) => {
              event.stopPropagation();
              onOpenAlbum(track.albumId, track.albumTitle);
            },
          }, track.albumTitle)
          : h('span', { className: 'ym-result-sub' }, track.artists)),
      h('span', { className: 'ym-result-time' }, fmtTime(track.durationMs)),
      h(RowActions, { t, track, onAdded })));

      const meta = entry.kind === 'album' && data.album !== null
        ? h('p', { className: 'ym-hint' },
          data.album.artistId === null || data.album.artistId === undefined
            ? h('span', null, data.album.artists)
            : h('button', {
              className: 'ym-link-button',
              type: 'button',
              title: t('openArtist'),
              onClick: () => onOpenArtist(data.album.artistId, data.album.artists),
            }, data.album.artists),
          ` \u00b7 ${data.album.year === null ? '' : `${data.album.year} \u00b7 `}${data.album.trackCount} ${t('tracksCount')}`)
        : null;

      return h('div', { className: 'ym-form' },
        bar,
        data.loading ? h('p', { className: 'ym-hint' }, t('searching')) : null,
        data.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, data.error) : null,
        meta,
        chips.length > 0 ? h('p', { className: 'ym-section' }, t('albumsSection')) : null,
        chips.length > 0 ? h('div', { className: 'ym-strip' }, chips) : null,
        rows.length > 0 ? h('p', { className: 'ym-section' }, t('tracksSection')) : null,
        rows.length > 0 ? h('div', { className: 'ym-results' }, rows) : null,
        !data.loading && data.error === '' && rows.length === 0
          ? h('p', { className: 'ym-hint' }, t('nothingFound'))
          : null,
        entry.kind === 'artist' && data.total > data.tracks.length
          ? h('p', { className: 'ym-hint' }, `${t('allTracks')}: ${data.total}`)
          : null);
    }

    /** Search field, result rows, and the transport for whatever is playing. */
    function SearchScreen({ t, status }) {
      const [query, setQuery] = React.useState('');
      const [tracks, setTracks] = React.useState([]);
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState('');
      const [tab, setTab] = React.useState('search');
      const [path, setPath] = React.useState([]);
      const [groups, setGroups] = React.useState({ artists: [], albums: [] });
      const [wave, setWave] = React.useState({ busy: false, error: '' });
      const state = usePlayer();
      const tabsRef = React.useRef(null);
      const flashTimer = React.useRef(0);
      const [flash, setFlash] = React.useState('');
      const [tabsHeight, setTabsHeight] = React.useState(35);

      /** The pinned queue toolbar has to start right below the pinned tab bar. */
      React.useLayoutEffect(() => {
        const node = tabsRef.current;
        if (node === null) return undefined;
        const measure = () => setTabsHeight(Math.round(node.getBoundingClientRect().height));
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
      }, []);

      React.useEffect(() => () => window.clearTimeout(flashTimer.current), []);

      const notify = (message) => {
        setFlash(message);
        window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setFlash(''), 2000);
      };

      /** Drill-down stack: search → artist → album, and back down again. */
      const openArtist = (id, title) => {
        if (id === null || id === undefined) return;
        setPath((previous) => previous.concat([{ kind: 'artist', id: String(id), title: title ?? '' }]));
      };

      const openAlbum = (id, title) => {
        if (id === null || id === undefined) return;
        setPath((previous) => previous.concat([{ kind: 'album', id: String(id), title: title ?? '' }]));
      };

      const goBack = () => setPath((previous) => previous.slice(0, -1));

      const startWaveClick = async () => {
        setWave({ busy: true, error: '' });
        try {
          await startWave();
          setWave({ busy: false, error: '' });
        } catch (failure) {
          setWave({ busy: false, error: failure.message || 'wave failed' });
        }
      };

      React.useEffect(() => {
        const trimmed = query.trim();
        if (trimmed === '') {
          setTracks([]);
          setGroups({ artists: [], albums: [] });
          setError('');
          setBusy(false);
          return undefined;
        }
        let cancelled = false;
        setBusy(true);
        const timer = window.setTimeout(async () => {
          try {
            const value = await call(`music/search?q=${encodeURIComponent(trimmed)}`);
            if (cancelled) return;
            setTracks(Array.isArray(value.tracks) ? value.tracks : []);
            setGroups({
              artists: Array.isArray(value.artists) ? value.artists : [],
              albums: Array.isArray(value.albums) ? value.albums : [],
            });
            setError('');
          } catch (failure) {
            if (cancelled) return;
            setTracks([]);
            setGroups({ artists: [], albums: [] });
            setError(failure.message || 'search failed');
          } finally {
            if (!cancelled) setBusy(false);
          }
        }, 300);
        return () => {
          cancelled = true;
          window.clearTimeout(timer);
        };
      }, [query]);

      const rows = tracks.map((track, index) => h('div', {
        key: `${track.id}-${index}`,
        className: 'ym-result',
        role: 'button',
        tabIndex: 0,
        'data-active': state.current !== null && String(state.current.id) === String(track.id) ? 'true' : 'false',
        onClick: () => playQueue(tracks, index),
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            playQueue(tracks, index);
          }
        },
      },
      track.cover !== null
        ? h('button', {
          className: 'ym-cover-button',
          type: 'button',
          title: track.albumTitle !== '' ? `${t('openAlbum')}: ${track.albumTitle}` : t('openAlbum'),
          'aria-label': t('openAlbum'),
          disabled: track.albumId === null,
          onClick: (event) => {
            event.stopPropagation();
            openAlbum(track.albumId, track.albumTitle);
          },
        }, h('img', { className: 'ym-result-cover', src: track.cover, alt: '', loading: 'lazy' }))
        : h('span', { className: 'ym-result-cover' }),
      h('span', { className: 'ym-result-text' },
        h('span', { className: 'ym-result-title' }, track.title),
        track.artistId !== null
          ? h('button', {
            className: 'ym-link-button ym-result-sub',
            type: 'button',
            title: track.artists === '' ? t('openArtist') : `${t('openArtist')}: ${track.artists}`,
            onClick: (event) => {
              event.stopPropagation();
              openArtist(track.artistId, track.artists);
            },
          }, track.artists === '' ? t('openArtist') : track.artists)
          : h('span', { className: 'ym-result-sub' }, track.artists)),
      h('span', { className: 'ym-result-time' }, fmtTime(track.durationMs)),
      h(RowActions, { t, track, onAdded: notify })));

      const artistChips = groups.artists.map((artist) => h('button', {
        key: `a${artist.id}`,
        className: 'ym-chip',
        type: 'button',
        title: `${t('openArtist')}: ${artist.name}`,
        onClick: () => openArtist(artist.id, artist.name),
      },
      artist.cover !== null
        ? h('img', { className: 'ym-chip-cover', src: artist.cover, alt: '', loading: 'lazy', 'data-round': 'true' })
        : h('span', { className: 'ym-chip-cover', 'data-round': 'true' }),
      h('span', { className: 'ym-chip-title' }, artist.name)));

      const albumChips = groups.albums.map((album) => h('button', {
        key: `b${album.id}`,
        className: 'ym-chip',
        type: 'button',
        title: `${t('openAlbum')}: ${album.title}`,
        onClick: () => openAlbum(album.id, album.title),
      },
      album.cover !== null
        ? h('img', { className: 'ym-chip-cover', src: album.cover, alt: '', loading: 'lazy' })
        : h('span', { className: 'ym-chip-cover' }),
      h('span', { className: 'ym-chip-title' }, album.title)));

      const searchPane = h('div', { className: 'ym-form' },
        h('input', {
          className: 'ym-input ym-search',
          value: query,
          placeholder: t('searchPlaceholder'),
          autoComplete: 'off',
          spellCheck: false,
          onChange: (event) => setQuery(event.target.value),
        }),
        busy ? h('p', { className: 'ym-hint' }, t('searching')) : null,
        error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, error) : null,
        !busy && error === '' && query.trim() !== '' && tracks.length === 0
          ? h('p', { className: 'ym-hint' }, t('nothingFound'))
          : null,
        flash !== '' ? h('p', { className: 'ym-hint' }, flash) : null,
        artistChips.length > 0 ? h('p', { className: 'ym-section' }, t('artistsSection')) : null,
        artistChips.length > 0 ? h('div', { className: 'ym-strip' }, artistChips) : null,
        albumChips.length > 0 ? h('p', { className: 'ym-section' }, t('albumsSection')) : null,
        albumChips.length > 0 ? h('div', { className: 'ym-strip' }, albumChips) : null,
        tracks.length > 0
          ? h('div', { className: 'ym-results-head' },
            h('span', { className: 'ym-hint' }, `${t('tabSearch')} \u00b7 ${tracks.length}`),
            h('button', {
              className: 'ym-tab',
              type: 'button',
              style: { flex: 'none', padding: '2px 8px' },
              title: t('addAllToQueue'),
              onClick: () => {
                addToQueue(tracks);
                notify(t('addedAll'));
              },
            }, t('addAllToQueue')))
          : null,
        tracks.length > 0 ? h('div', { className: 'ym-results' }, rows) : null);

      const wavePane = h('div', { className: 'ym-form' },
        h('button', {
          className: 'ym-button',
          type: 'button',
          disabled: wave.busy,
          onClick: () => {
            void startWaveClick();
          },
        }, wave.busy ? t('waveLoading') : t('waveStart')),
        wave.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, wave.error) : null);

      return h('div', { className: 'ym-form', style: { '--ym-tabs-h': `${tabsHeight}px` } },
        h('div', { className: 'ym-tabs', ref: tabsRef },
          h('button', {
            className: 'ym-tab',
            type: 'button',
            'data-active': tab === 'search' ? 'true' : 'false',
            onClick: () => setTab('search'),
          }, t('tabSearch')),
          h('button', {
            className: 'ym-tab',
            type: 'button',
            'data-active': tab === 'playlists' ? 'true' : 'false',
            onClick: () => setTab('playlists'),
          }, t('tabPlaylists')),
          h('button', {
            className: 'ym-tab',
            type: 'button',
            'data-active': tab === 'wave' ? 'true' : 'false',
            onClick: () => setTab('wave'),
          }, t('tabWave')),
          h('button', {
            className: 'ym-tab',
            type: 'button',
            'data-active': tab === 'queue' ? 'true' : 'false',
            onClick: () => setTab('queue'),
          }, state.queue.length > 0 ? `${t('tabQueue')} \u00b7 ${state.queue.length}` : t('tabQueue'))),
        tab === 'wave'
          ? wavePane
          : tab === 'playlists'
            ? h(PlaylistsPane, { t })
            : tab === 'queue'
              ? h(QueuePane, { t })
              : path.length > 0
                ? h(DetailPane, {
                  t,
                  entry: path[path.length - 1],
                  onBack: goBack,
                  onOpenArtist: openArtist,
                  onOpenAlbum: openAlbum,
                  onAdded: notify,
                })
                : searchPane);
    }

    /** Auth state machine for the popover body. */
    function PopoverBody({ t, auth }) {
      if (auth.loading) return h('p', { className: 'ym-hint' }, t('loading'));
      if (auth.status === null) {
        return h('div', { className: 'ym-form' },
          h('p', { className: 'ym-error', role: 'alert' }, auth.error),
          h('button', { className: 'ym-button', type: 'button', onClick: auth.reload }, t('retry')));
      }
      if (!auth.status.configured) return h(SetupScreen, { t, onSaved: auth.reload });
      if (!auth.status.authorized) return h(DeviceScreen, { t, onSignedIn: auth.reload });
      return h(SearchScreen, { t, status: auth.status });
    }

    /**
     * Footer entry: a full-width row when the sidebar is expanded, an icon-only
     * rail button when collapsed. The popover is portalled so the sidebar's
     * scroll container cannot clip it.
     */
    /**
     * One-line track title that scrolls only while it actually overflows, so a
     * short name stays still instead of drifting for no reason.
     */
    function Marquee({ text }) {
      const boxRef = React.useRef(null);
      const [scroll, setScroll] = React.useState(false);

      React.useEffect(() => {
        const node = boxRef.current;
        if (node === null) {
          setScroll(false);
          return;
        }
        setScroll(node.scrollWidth > node.clientWidth + 2);
      }, [text]);

      return h('span', { className: 'ym-mini-title-line', ref: boxRef },
        h('span', { className: 'ym-mini-title-inner', 'data-scroll': scroll ? 'true' : 'false' },
          text,
          scroll ? h('span', { 'aria-hidden': 'true' }, text) : null));
    }

    function MusicEntry({ wide, t }) {
      const [open, setOpen] = React.useState(false);
      const [anchor, setAnchor] = React.useState(null);
      const buttonRef = React.useRef(null);
      const playback = usePlayer();
      const current = playback.current;
      const auth = useAuth();
      const [accountOpen, setAccountOpen] = React.useState(false);

      // The account panel belongs to the open card; closing it must not leave a
      // floating menu behind for the next time the card is opened.
      React.useEffect(() => {
        if (!open) setAccountOpen(false);
      }, [open]);

      const place = React.useCallback(() => {
        const node = buttonRef.current;
        if (node === null) return;
        const box = node.getBoundingClientRect();
        setAnchor({ left: box.left, top: box.top });
      }, []);

      const toggle = React.useCallback(() => {
        setOpen((value) => {
          const next = !value;
          if (next) place();
          return next;
        });
      }, [place]);

      React.useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setOpen(false);
        };
        const onPointerDown = (event) => {
          const node = buttonRef.current;
          if (node !== null && node.contains(event.target)) return;
          if (event.target instanceof Element && event.target.closest('[data-yandex-music-card]') !== null) return;
          setOpen(false);
        };
        const onMove = () => place();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown, true);
        window.addEventListener('resize', onMove);
        window.addEventListener('scroll', onMove, true);
        return () => {
          document.removeEventListener('keydown', onKeyDown);
          document.removeEventListener('pointerdown', onPointerDown, true);
          window.removeEventListener('resize', onMove);
          window.removeEventListener('scroll', onMove, true);
        };
      }, [open, place]);

      const cover = current !== null && typeof current.cover === 'string' ? current.cover : null;

      /** Both windows share one geometry so they stay flush with each other. */
      const cardPos = anchor === null
        ? { left: 8, bottom: 8 }
        : {
          left: Math.max(8, Math.min(anchor.left, window.innerWidth - CARD_WIDTH - 8)),
          bottom: Math.max(8, Math.min(window.innerHeight - anchor.top + 8, window.innerHeight - CARD_HEIGHT - 8)),
        };
      const roomOnTheLeft = cardPos.left - CARD_WIDTH - 8 >= 8;
      const lyricsPos = {
        left: roomOnTheLeft
          ? cardPos.left - CARD_WIDTH - 8
          : Math.min(cardPos.left + CARD_WIDTH + 8, Math.max(8, window.innerWidth - CARD_WIDTH - 8)),
        bottom: cardPos.bottom,
      };

      const card = open && anchor !== null
        ? ReactDOM.createPortal(
          h('div', {
            className: 'ym-card',
            'data-yandex-music-card': '',
            role: 'dialog',
            'aria-label': t('title'),
            style: cardPos,
          },
          h('div', {
            className: 'ym-card-bg',
            'aria-hidden': 'true',
            style: cover === null ? {} : { backgroundImage: `url("${cover}")` },
          }),
          h('div', { className: 'ym-card-scrim', 'aria-hidden': 'true' }),
          h('div', { className: 'ym-card-inner' },
            h('div', { className: 'ym-card-head' },
              h('span', { className: 'ym-card-title' }, t('title')),
              h('span', { className: 'ym-head-actions' },
                auth.status !== null && auth.status.authorized
                  ? h('button', {
                    type: 'button',
                    className: 'ym-card-close',
                    'aria-label': t('account'),
                    title: auth.status.login !== '' ? auth.status.login : t('account'),
                    'aria-expanded': accountOpen ? 'true' : 'false',
                    onClick: () => setAccountOpen((value) => !value),
                  }, h(ProfileIcon, { size: 15 }))
                  : null,
                h('button', {
                  type: 'button',
                  className: 'ym-card-close',
                  'aria-label': t('close'),
                  onClick: () => setOpen(false),
                }, '\u00d7'))),
            accountOpen && auth.status !== null && auth.status.authorized
              ? h('div', { className: 'ym-account', role: 'dialog', 'aria-label': t('account') },
                h('p', { className: 'ym-account-name' },
                  `${t('signedIn')} ${auth.status.login !== '' ? auth.status.login : auth.status.uid ?? '—'}`),
                h('button', {
                  className: 'ym-button',
                  'data-variant': 'ghost',
                  type: 'button',
                  onClick: () => {
                    void (async () => {
                      try {
                        await call('auth/logout', {});
                      } catch {
                        /* the session is gone either way */
                      }
                      setAccountOpen(false);
                      await auth.reload();
                    })();
                  },
                }, t('logout')))
              : null,
            h('div', { className: 'ym-card-pane' }, h(PopoverBody, { t, auth })),
            h('div', { className: 'ym-card-player' }, h(PlayerBar, { t })))),
          document.body,
        )
        : null;
      const lyrics = open && anchor !== null && playback.lyricsOpen
        ? ReactDOM.createPortal(
          h(LyricsCard, { t, style: lyricsPos, onClose: toggleLyrics }),
          document.body,
        )
        : null;
      const durationMs = playback.duration > 0
        ? playback.duration * 1000
        : current !== null ? current.durationMs : 0;
      const progress = durationMs > 0
        ? Math.min(100, Math.max(0, (playback.position * 1000 / durationMs) * 100))
        : 0;

      // Collapsed rail: no room for a transport, so the icon opens the popover.
      if (!wide) {
        return h(React.Fragment, null,
          h('button', {
            ref: buttonRef,
            type: 'button',
            className: 'ym-entry',
            'data-rail': 'true',
            title: current !== null ? `${current.title} — ${current.artists}` : t('entry'),
            'aria-label': t('entry'),
            'aria-haspopup': 'dialog',
            'aria-expanded': open ? 'true' : 'false',
            onClick: toggle,
          }, h('span', { className: 'ym-entry-icon', 'aria-hidden': 'true' }, h(NoteIcon, { size: 18 }))),
          card,
          lyrics);
      }

      return h(React.Fragment, null,
        h('div', { className: 'ym-mini', 'data-playing': current !== null ? 'true' : 'false' },
          h('div', { className: 'ym-mini-top' },
            h('button', {
              ref: buttonRef,
              type: 'button',
              className: 'ym-mini-open',
              'aria-label': t('entry'),
              'aria-haspopup': 'dialog',
              'aria-expanded': open ? 'true' : 'false',
              onClick: toggle,
            },
            h('span', { className: 'ym-mini-cover' },
              cover !== null ? h('img', { src: cover, alt: '', loading: 'lazy' }) : h(NoteIcon, { size: 18 })),
            h('span', { className: 'ym-mini-body' },
              h(Marquee, { text: current !== null ? current.title : t('entry') }),
              h('span', { className: 'ym-mini-artist' }, current !== null ? current.artists : t('idleHint')))),
            h('span', { className: 'ym-mini-controls' },
              h('button', {
                className: 'ym-mini-button',
                type: 'button',
                disabled: current === null,
                'aria-label': t('prev'),
                title: t('prev'),
                onClick: (event) => {
                  event.stopPropagation();
                  void step(-1);
                },
              }, '\u23ee'),
              h('button', {
                className: 'ym-mini-button',
                type: 'button',
                'data-primary': 'true',
                disabled: current === null,
                'aria-label': playback.playing ? t('pause') : t('play'),
                title: playback.playing ? t('pause') : t('play'),
                onClick: (event) => {
                  event.stopPropagation();
                  togglePlay();
                },
              }, playback.playing ? '\u23f8' : '\u25b6'),
              h('button', {
                className: 'ym-mini-button',
                type: 'button',
                disabled: current === null,
                'aria-label': t('next'),
                title: t('next'),
                onClick: (event) => {
                  event.stopPropagation();
                  void step(1);
                },
              }, '\u23ed'))),
          current !== null
            ? h('div', { className: 'ym-mini-progress' },
              h('div', {
                className: 'ym-mini-bar',
                role: 'progressbar',
                'aria-label': t('nowPlaying'),
                'aria-valuenow': Math.round(progress),
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                onClick: (event) => {
                  const box = event.currentTarget.getBoundingClientRect();
                  if (box.width > 0 && durationMs > 0) {
                    seekTo(((event.clientX - box.left) / box.width) * (durationMs / 1000));
                  }
                },
              }, h('span', { className: 'ym-mini-bar-fill', style: { width: `${progress}%` } })),
              h('span', { className: 'ym-mini-time' }, `${fmtTime(playback.position * 1000)} / ${fmtTime(durationMs)}`))
            : null),
        card,
        lyrics);
    }

    /* ------------------------------------------------------------------ */
    /* plugin                                                              */
    /* ------------------------------------------------------------------ */

    /** Decorative phone glyph for the relocated Remote Control row. */
    function SmartphoneIcon({ size }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      h('rect', { x: 6, y: 2, width: 12, height: 20, rx: 2.5 }),
      h('path', { d: 'M11 18h2' }));
    }

    /** Decorative archive box for the relocated View archive row. */
    function ArchiveIcon({ size }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      h('rect', { x: 3, y: 4, width: 18, height: 5, rx: 1.5 }),
      h('path', { d: 'M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9' }),
      h('path', { d: 'M10 13h4' }));
    }

    /**
     * «View archive» moved into the More menu.
     *
     * That plugin opens its own `<dialog>` and exposes no service, so the entry
     * cannot be replaced — only hidden and clicked. Its trigger stays mounted
     * (hidden by CSS) and the dialog itself is centred, not anchored, so the
     * click from here behaves exactly like the original row.
     */
    function ArchiveMenuRow({ t, onDismiss }) {
      const [available, setAvailable] = React.useState(false);

      React.useEffect(() => {
        const timer = window.setTimeout(() => {
          setAvailable(document.querySelector('[data-slot="sidebar.footer.action"] .aav-footerBtn') !== null);
        }, 0);
        return () => window.clearTimeout(timer);
      }, []);

      if (!available) return null;

      return h(primitives.MenuItemButton, {
        icon: h(ArchiveIcon, { size: 16 }),
        separatorBefore: true,
        onSelect: () => {
          onDismiss();
          const button = document.querySelector('[data-slot="sidebar.footer.action"] .aav-footerBtn');
          if (button instanceof HTMLElement) button.click();
        },
      }, t('archiveRow'));
    }

    /**
     * Remote Control, relocated from the sidebar footer into the More menu.
     * The bridge's own footer entry is shadowed, so this row is the only way in;
     * it opens the bundle page where the bridge renders its connection panel.
     */
    function RemoteMenuRow({ t, onDismiss, openRemote }) {
      const available = useNavigation();
      if (!available) return null;
      return h(primitives.MenuItemButton, {
        icon: h(SmartphoneIcon, { size: 16 }),
        separatorBefore: true,
        onSelect: () => {
          onDismiss();
          openRemote();
        },
      }, t('remoteControl'));
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
      ctx.effect(() => {
        // A fresh revision starts from silence: an element left by an older
        // bundle has no UI of its own and would otherwise keep singing.
        silenceOthers(null);
      }, 'yandex-music: audio handover');
      ctx.effect(() => ctx.locale.register(NS, { ru, en }), 'yandex-music: dictionaries');
        ctx.effect(() => installStyles(), 'yandex-music: styles');
        const t = ctx.locale.bind(NS);

        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'yandex-music',
          order: 1000,
          locale: NS,
          label: () => t('entry'),
        }, MusicEntry));

        // Shadow the bridge's footer entry: in a list slot the lowest priority
        // wins the id, so this registration replaces the button with nothing.
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: BRIDGE_ENTRY_ID,
          priority: -1,
          order: 26,
        }, () => null));

        ctx.inject(['pluginNavigation'], (scope) => {
          scope.effect(() => {
            setNavigation(true);
            return () => setNavigation(false);
          }, 'yandex-music: plugin navigation');
        });

        const openRemote = () => {
          try {
            ctx.get('pluginNavigation')?.openBundle(BRIDGE_PACKAGE);
          } catch {
            /* the service went away between render and click */
          }
        };

        ctx.slots.inject('sidebar.panellist.actions', () => ctx.slots.register({
          name: 'sidebar.panellist.actions',
          id: 'yandex-music-remote',
          locale: NS,
          inject: () => ({ openRemote }),
        }, RemoteMenuRow));

        ctx.slots.inject('sidebar.panellist.actions', () => ctx.slots.register({
          name: 'sidebar.panellist.actions',
          id: 'yandex-music-archive',
          locale: NS,
        }, ArchiveMenuRow));
      },
    };
  },
});
