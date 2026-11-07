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
    const CARD_SIZE = 553;
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
      title: 'Яндекс.Музыка',
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
      tabWave: 'Моя волна',
      tabPlaylists: 'Плейлисты',
      tabQueue: 'Очередь',
      tabCurrent: 'Текущий',
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
      lyricsEstimated: 'без таймкодов',
      lyricsSource: 'Источник',
      lyricsSynced: 'синхронизировано',
      uiFailed: 'Это окно сломалось — закройте и откройте попап',
      translate: 'Перевести на русский',
      hideTranslation: 'Скрыть перевод',
      translateFailed: 'Перевести не удалось',
      sameLanguage: 'Текст уже на русском',
      translationSource: 'Перевод',
      translationMachine: 'машинный',
      editPlaylist: 'Изменить плейлист',
      save: 'Сохранить',
      playlistRenamed: 'Готово',
      playlistCreated: 'Плейлист создан',
      playlistDeleted: 'Плейлист удалён',
      playlistEmpty: 'В плейлисте пока нет треков',
      visibilityPublic: 'Публичный плейлист',
      visibilityPrivate: 'Приватный плейлист',
      makePublic: 'Сделать публичным',
      makePrivate: 'Сделать приватным',
      deletePlaylist: 'Удалить плейлист',
      deleteConfirm: 'Точно удалить?',
      waveMood: 'По настроению',
      waveActivity: 'По занятию',
      waveEpoch: 'По эпохе',
      waveGenre: 'Жанры',
      wavePersonal: 'Личное',
      waveLanguage: 'По языку',
      waveByArtist: 'Волна по исполнителю',
      waveArtistPlaceholder: 'Имя исполнителя',
      waveFailed: 'Волна не запустилась',
      likedPlaylist: 'Мне нравится',
      like: 'Добавить в «Мне нравится»',
      dislike: 'Не нравится',
      menuNext: 'Следующим',
      menuQueue: 'В конец очереди',
      menuPlaylist: 'В плейлист…',
      menuArtist: 'К исполнителю',
      menuAlbum: 'К альбому',
      menuCopy: 'Скопировать ссылку',
      menuCopied: 'Ссылка скопирована',
      menuOpen: 'Открыть в Яндекс.Музыке',
      recentSearches: 'Недавние запросы',
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
      title: 'Yandex.Music',
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
      tabCurrent: 'Current',
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
      lyricsEstimated: 'no timecodes',
      lyricsSource: 'Source',
      lyricsSynced: 'synced',
      uiFailed: 'This pane broke — close and reopen the popover',
      translate: 'Translate into Russian',
      hideTranslation: 'Hide the translation',
      translateFailed: 'Translation failed',
      sameLanguage: 'The lyrics are already Russian',
      translationSource: 'Translation',
      translationMachine: 'machine',
      editPlaylist: 'Edit playlist',
      save: 'Save',
      playlistRenamed: 'Done',
      playlistCreated: 'Playlist created',
      playlistDeleted: 'Playlist deleted',
      playlistEmpty: 'No tracks in this playlist yet',
      visibilityPublic: 'Public playlist',
      visibilityPrivate: 'Private playlist',
      makePublic: 'Make public',
      makePrivate: 'Make private',
      deletePlaylist: 'Delete playlist',
      deleteConfirm: 'Delete for sure?',
      waveMood: 'By mood',
      waveActivity: 'By activity',
      waveEpoch: 'By era',
      waveGenre: 'Genres',
      wavePersonal: 'Personal',
      waveLanguage: 'By language',
      waveByArtist: 'Wave by artist',
      waveArtistPlaceholder: 'Artist name',
      waveFailed: 'The wave did not start',
      likedPlaylist: 'Liked tracks',
      like: 'Add to liked tracks',
      dislike: 'Dislike',
      menuNext: 'Play next',
      menuQueue: 'Add to the end of the queue',
      menuPlaylist: 'Add to playlist…',
      menuArtist: 'Go to the artist',
      menuAlbum: 'Go to the album',
      menuCopy: 'Copy link',
      menuCopied: 'Link copied',
      menuOpen: 'Open in Yandex Music',
      recentSearches: 'Recent searches',
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
.ym-card{position:fixed;z-index:60;box-sizing:border-box;width:553px;height:553px;padding:0;border-radius:14px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12));box-shadow:0 18px 44px rgba(0,0,0,.55);color:var(--dsw-alias-label-primary);font-size:13px;overflow:hidden;display:flex;background:rgba(18,18,21,.82);backdrop-filter:blur(6px)}

.ym-card-inner{position:relative;z-index:1;display:flex;flex-direction:column;width:100%;height:100%;min-height:0}
.ym-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px 2px;flex:none}
.ym-card-title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-card-pane{flex:1;min-height:0;overflow-y:auto;scrollbar-gutter:stable;padding:0 12px 8px}
.ym-card-player{flex:none;padding:4px 8px 4px;border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.22)}
.ym-head-actions{display:flex;align-items:center;gap:2px;flex:none}
.ym-account{position:absolute;top:38px;right:10px;z-index:20;min-width:210px;max-width:260px;padding:11px;border-radius:11px;background:rgba(18,18,22,.97);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));box-shadow:0 10px 28px rgba(0,0,0,.5)}
.ym-account-name{font-size:12px;line-height:1.45;margin:0 0 9px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.ym-card-close{border:0;background:transparent;color:inherit;cursor:pointer;padding:1px 5px;border-radius:6px;font-size:15px;line-height:1}
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
.ym-status{height:17px;margin:0;font-size:12px;line-height:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);opacity:0;transition:opacity .15s ease}
.ym-status[data-on="true"]{opacity:1}
.ym-status-error{color:var(--dsw-alias-label-danger,#ff6b6b)}
.ym-menu{position:fixed;z-index:70;min-width:198px;max-width:270px;padding:5px;border-radius:11px;background:rgba(20,20,24,.98);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));box-shadow:0 14px 34px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:1px;animation:ym-menu-in .1s ease-out}
@keyframes ym-menu-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
.ym-menu-title{margin:2px 6px 6px;font-size:10.5px;line-height:1.35;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-menu-item{display:flex;align-items:center;gap:8px;padding:7px 9px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:12.5px;text-align:left;cursor:pointer;transition:background .1s ease}
.ym-menu-item:hover{background:rgba(255,255,255,.09)}
.ym-menu-item:disabled{opacity:.45;cursor:default}
.ym-menu-icon{flex:none;width:16px;text-align:center;opacity:.75}
/* Only one pane is laid out; the other three keep their state and scroll. */
.ym-pane{display:none}
.ym-pane[data-active="true"]{display:block}
.ym-skeleton-list{display:flex;flex-direction:column;gap:1px;margin:6px -4px 0;padding:0 4px;animation:ym-pulse 1.4s ease-in-out infinite}
.ym-skeleton{display:flex;align-items:center;gap:8px;padding:5px 6px}
.ym-skeleton-cover{flex:none;width:32px;height:32px;border-radius:6px;background:rgba(255,255,255,.07)}
.ym-skeleton-lines{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.ym-skeleton-lines i{display:block;height:8px;border-radius:4px;background:rgba(255,255,255,.07)}
.ym-skeleton-lines i:last-child{width:45%;background:rgba(255,255,255,.05)}
@keyframes ym-pulse{0%,100%{opacity:.5}50%{opacity:1}}
.ym-error{font-size:12px;color:var(--dsw-alias-label-danger,#ff6b6b);margin:0}
.ym-link{color:var(--dsw-alias-label-accent,#7aa7ff);word-break:break-all;font-size:12px}
.ym-row{display:flex;align-items:center;gap:8px}
.ym-code{font-variant-numeric:tabular-nums}
.ym-add{position:absolute;bottom:calc(100% + 6px);right:0;left:0;z-index:6;padding:10px;border-radius:11px;background:rgba(16,16,20,.97);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));box-shadow:0 12px 30px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:7px;max-height:250px}
.ym-add-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ym-add-inline{position:static;bottom:auto;left:auto;right:auto;max-height:none;padding:9px;margin:0 0 4px}
.ym-add-title{font-size:12px;font-weight:600}
.ym-add-list{overflow-y:auto;display:flex;flex-direction:column;gap:1px}
.ym-add-create{display:flex;gap:6px;align-items:center}
.ym-add-create .ym-input{flex:1;min-width:0}.ym-queue-head{display:flex;align-items:center;gap:4px;position:sticky;top:var(--ym-tabs-h,38px);z-index:5;margin:0 -12px 0;padding:5px 12px 9px;background:rgba(20,20,24,.88);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.07)}
.ym-queue-row{display:flex;align-items:center;gap:4px;padding:2px 4px;border-radius:8px;border:1px dashed transparent}
.ym-queue-row{transition:background .12s ease,border-color .12s ease}.ym-queue-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-queue-row[data-active="true"]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.ym-queue-row[data-over="true"]{border-color:var(--dsw-alias-border-accent,#3b6fe0)}
.ym-queue-grip{flex:none;width:10px;cursor:grab;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;opacity:.65}
.ym-queue-open{display:flex;align-items:center;gap:8px;flex:1;min-width:0;padding:2px 0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ym-queue-actions{display:flex;align-items:center;gap:1px;flex:none}
.ym-mini-button[data-on="true"]{color:var(--dsw-alias-label-accent,#7aa7ff)}.ym-tabs{display:flex;gap:4px;height:38px;box-sizing:border-box;flex:none;position:sticky;top:0;z-index:6;margin:0 -12px 0;padding:2px 12px 7px;background:rgba(20,20,24,.88);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.07)}.ym-tab{font-size:11px}.ym-playlist-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500}
.ym-tab{flex:1 1 0;min-width:0;padding:6px 6px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:rgba(255,255,255,.045);color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;font-weight:500;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .14s ease,color .14s ease,border-color .14s ease,box-shadow .14s ease,transform .1s ease}
.ym-tab:hover{background:rgba(255,255,255,.1);color:var(--dsw-alias-label-primary);border-color:rgba(255,255,255,.16)}
.ym-tab:active{transform:scale(.97)}
.ym-tab[data-active="true"]{background:var(--dsw-alias-bg-accent,#3b6fe0);border-color:transparent;color:#fff;box-shadow:0 2px 10px rgba(59,111,224,.32)}
.ym-device-code{font-size:20px;letter-spacing:.22em;font-weight:600;text-align:center;padding:10px;border-radius:8px;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.06));font-variant-numeric:tabular-nums}
.ym-search{width:100%}
.ym-search-wrap{position:relative;display:flex}
.ym-search-wrap .ym-search{padding-right:88px}
.ym-search-status{position:absolute;right:9px;top:50%;transform:translateY(-50%);max-width:72%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:1;color:var(--dsw-alias-label-secondary);pointer-events:none;opacity:0;transition:opacity .15s ease}
.ym-search-status[data-on="true"]{opacity:1}
.ym-search-status[data-error="true"]{color:var(--dsw-alias-label-danger,#ff6b6b)}
.ym-results{display:flex;flex-direction:column;gap:1px;margin:8px -4px 0;padding:0 4px}
.ym-result{display:flex;align-items:center;gap:8px;width:100%;padding:5px 6px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}
.ym-result{transition:background .12s ease}.ym-result:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-result[data-active="true"]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.ym-result[data-over="true"]{box-shadow:inset 0 0 0 1px var(--dsw-alias-border-accent,#3b6fe0)}
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
.ym-form[data-dragging="true"] .ym-queue-head,.ym-form[data-dragging="true"] .ym-sticky-bar{pointer-events:none;background:transparent;backdrop-filter:none;border-bottom-color:transparent;opacity:.35}
.ym-sticky-bar{position:sticky;top:var(--ym-tabs-h,38px);z-index:5;margin:0 -12px 0;padding:5px 12px 9px;background:rgba(20,20,24,.88);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.07)}
.ym-section{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-secondary);margin:6px 0 -2px}
.ym-strip{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:2px 2px 4px;margin:0 -2px;scrollbar-width:thin}
.ym-chips{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 2px}
.ym-strip-wrap{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:10px 6px;justify-items:center;overflow:visible;margin:0;padding:2px 0 4px}
.ym-chip{flex:none;width:72px;display:flex;flex-direction:column;gap:4px;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ym-chip-cover{display:block;width:72px;height:72px;border-radius:8px;object-fit:cover;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.06));transition:transform .14s ease,filter .14s ease}
.ym-chip-cover[data-round="true"]{border-radius:50%}
.ym-chip{transition:transform .12s ease}.ym-chip:hover .ym-chip-cover{filter:brightness(1.15);transform:scale(1.03)}
.ym-chip-title{font-size:11px;line-height:1.25;max-height:2.5em;overflow:hidden;overflow-wrap:anywhere}
.ym-cover-button{flex:none;display:inline-flex;padding:0;border:0;border-radius:6px;background:transparent;cursor:pointer}
.ym-cover-button:hover{filter:brightness(1.15)}
.ym-link-button{padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;max-width:100%}
.ym-link-button:hover{color:var(--dsw-alias-label-accent,#7aa7ff);text-decoration:underline}
.ym-result-sub.ym-link-button{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
.ym-index{flex:none;width:16px;text-align:right;font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ym-station{flex:none;width:70px;display:flex;flex-direction:column;align-items:center;gap:5px;padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:center}
.ym-station:disabled{opacity:.5;cursor:default}
.ym-station-icon{width:52px;height:52px;border-radius:14px;object-fit:cover;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.08))}
.ym-station:hover .ym-station-icon{filter:brightness(1.12)}
.ym-station[data-on="true"] .ym-station-icon{outline:2px solid var(--dsw-alias-border-accent,#4c8dff);outline-offset:1px}
.ym-station .ym-chip-title{height:2.7em;max-height:none;font-size:10.5px;line-height:1.3;overflow:hidden;overflow-wrap:break-word;hyphens:auto}
.ym-player{margin-top:0;padding-top:0;border-top:0;position:relative}
.ym-player-head{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.ym-player-title{display:block;flex:1 1 auto;min-width:0;font-size:13px;font-weight:500;overflow:hidden}
.ym-badge{flex:none;font-size:10px;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.16));color:var(--dsw-alias-label-secondary)}
.ym-controls{display:flex;align-items:center;gap:4px}
.ym-controls .ym-icon-button{width:34px;height:34px}
.ym-icon-button{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer}
.ym-icon-button{transition:background .12s ease,color .12s ease,transform .1s ease}.ym-icon-button:hover{background:var(--dsw-alias-interactive-bg-hover)}.ym-icon-button:active{transform:scale(.94)}
.ym-icon-button[data-primary="true"]{background:var(--dsw-alias-bg-accent,#3b6fe0);color:#fff}
.ym-icon-button:disabled{cursor:default}
.ym-spinner{display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:ym-spin .7s linear infinite}
@keyframes ym-spin{to{transform:rotate(360deg)}}
.ym-seek{flex:1 1 auto;min-width:0;height:8px;margin:0;accent-color:var(--dsw-alias-bg-accent,#3b6fe0)}
.ym-seek-row{display:flex;align-items:center;gap:6px;margin:0 0 4px}
.ym-controls .ym-volume-wrap{margin-left:auto}
.ym-time{flex:none;margin-left:0;font-size:10px;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ym-icon-button[data-on="true"]{color:var(--dsw-alias-label-accent,#7aa7ff)}
.ym-volume-wrap{position:relative;display:inline-flex;flex:none}
.ym-volume-pop{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:6px;padding:10px 8px 7px;border-radius:10px;background:rgba(16,16,20,.98);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));box-shadow:0 10px 26px rgba(0,0,0,.5);z-index:12}
/* Keeps the pointer inside the wrapper while crossing the gap to the panel. */
.ym-volume-pop::after{content:'';position:absolute;left:0;right:0;top:100%;height:10px}
.ym-volume-wrap:hover .ym-volume-pop,.ym-volume-wrap:focus-within .ym-volume-pop{display:flex}
.ym-volume-slot{width:22px;height:96px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.ym-volume-vert{flex:none;width:96px;height:18px;margin:0;transform:rotate(-90deg);accent-color:var(--dsw-alias-bg-accent,#3b6fe0)}
.ym-volume-value{font-size:10px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ym-lyrics-card{position:fixed;z-index:61;box-sizing:border-box;width:553px;height:553px;display:flex;flex-direction:column;border-radius:14px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));box-shadow:0 18px 44px rgba(0,0,0,.6);color:#fff;font-size:13px;overflow:hidden;background:rgba(10,10,13,.72)}
.ym-lyrics-bg{position:absolute;inset:-10%;background-size:cover;background-position:center;background-repeat:no-repeat;filter:blur(9px) saturate(1.05);opacity:.5;pointer-events:none;transform:scale(1.06)}
.ym-lyrics-scrim{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(8,8,10,.62) 0%,rgba(8,8,10,.74) 55%,rgba(8,8,10,.87) 100%)}
.ym-lyrics-card > :not(.ym-lyrics-bg):not(.ym-lyrics-scrim){position:relative;z-index:1}
.ym-lyrics-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 2px}
.ym-lyrics-track{flex:none;margin:0;padding:0 12px 6px;font-size:11px;color:rgba(255,255,255,.66);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,.07)}
.ym-lyrics-body{flex:1;min-height:0;overflow-y:auto;padding:12px 16px 30px}
.ym-lyric{margin:0 0 10px;font-size:13.5px;line-height:1.5;color:rgba(255,255,255,.78);cursor:pointer;text-shadow:0 1px 3px rgba(0,0,0,.75);transition:color .12s}
.ym-lyric:hover{color:#fff}
.ym-lyric[data-past="true"]{color:rgba(255,255,255,.45)}
.ym-lyric[data-active="true"]{color:#fff;font-weight:600;font-size:15px;line-height:1.45;text-shadow:0 1px 6px rgba(0,0,0,.85)}
.ym-lyric-gap{height:6px}
.ym-lyrics-actions{display:flex;align-items:center;gap:2px;flex:none}
.ym-lyrics-card .ym-mini-button{color:rgba(255,255,255,.72)}
.ym-lyrics-card .ym-mini-button:hover{background:rgba(255,255,255,.12);color:#fff}
.ym-lyrics-card .ym-mini-button[data-on="true"]{background:rgba(255,255,255,.16);color:#fff}
.ym-lyric-tr{display:block;margin-top:3px;font-size:12px;line-height:1.4;font-weight:400;color:rgba(255,255,255,.62);text-shadow:0 1px 2px rgba(0,0,0,.7)}
.ym-lyric[data-active="true"] .ym-lyric-tr{color:rgba(255,255,255,.88)}
.ym-lyric-tr-block{margin:12px 0 0;font-size:13px;line-height:1.5;color:rgba(255,255,255,.72)}
.ym-lyrics-note{margin:14px 0 0;font-size:10px;color:rgba(255,255,255,.5)}
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

    /**
     * One fixed-height line for every temporary message. It always occupies the
     * same space and only fades its text in, so a short «Ищем…» can never push
     * the list below it around.
     */
    function StatusLine({ text, error }) {
      const message = typeof text === 'string' ? text : '';
      const failed = error === true && message !== '';
      return h('p', {
        className: failed ? 'ym-status ym-status-error' : 'ym-status',
        'data-on': message === '' ? 'false' : 'true',
        role: failed ? 'alert' : undefined,
        title: message,
      }, message === '' ? '\u00a0' : message);
    }

    /**
     * Gray placeholder rows for a list that is still loading. Same height as a
     * real row, so the moment the data arrives nothing on screen moves.
     */
    function SkeletonRows({ count }) {
      const total = typeof count === 'number' && count > 0 ? count : 6;
      const rows = [];
      for (let index = 0; index < total; index += 1) {
        rows.push(h('div', { key: index, className: 'ym-skeleton' },
          h('span', { className: 'ym-skeleton-cover' }),
          h('span', { className: 'ym-skeleton-lines' }, h('i', null), h('i', null))));
      }
      return h('div', { className: 'ym-skeleton-list', 'aria-hidden': 'true' }, rows);
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

    /**
     * A broken child must not take the popover — and the player bar inside it —
     * down with it: an uncaught render error unmounts the whole tree while the
     * <audio> element keeps playing, which looks like «the player vanished».
     */
    class Guard extends React.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }

      static getDerivedStateFromError() {
        return { failed: true };
      }

      componentDidCatch() {
        /* the pane just shows the fallback; nothing else to do */
      }

      render() {
        if (this.state.failed) return this.props.fallback ?? null;
        return this.props.children;
      }
    }

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
      restoring: 0,
      loading: false,
      wave: false,
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

    /** Push the volume onto whichever element is current and remember it. */    function applyVolume() {
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

    /**
     * In-memory cache for the panes. A tab switch must show what it already has
     * instead of flashing a loader and refetching everything it just had.
     */
    const paneCache = { playlists: null, stations: null, likes: null };

    /**
     * Media Session is what puts the track into the OS media overlay and makes
     * the hardware play/pause/next keys work. Handlers are re-registered on
     * every bundle revision — `setActionHandler` replaces instead of stacking,
     * so a hot reload can never leave a stale closure behind.
     */
    const MEDIA_SEEK_STEP = 10;
    let mediaSyncedAt = 0;
    let mediaTrackKey = '';

    function syncMediaSession(force) {
      if (typeof navigator === 'undefined' || navigator.mediaSession === undefined) return;
      const session = navigator.mediaSession;
      const stamp = Date.now();
      if (force !== true && stamp - mediaSyncedAt < 900) return;
      mediaSyncedAt = stamp;

      if (player.current === null) {
        session.metadata = null;
        session.playbackState = 'none';
        return;
      }

      const key = String(player.current.id);
      if (key !== mediaTrackKey || force === true) {
        mediaTrackKey = key;
        if (typeof MediaMetadata === 'function') {
          try {
            session.metadata = new MediaMetadata({
              title: player.current.title,
              artist: player.current.artists,
              album: player.current.albumTitle === '' ? undefined : player.current.albumTitle,
              artwork: typeof player.current.cover === 'string'
                ? [{ src: player.current.cover, sizes: '200x200', type: 'image/jpeg' }]
                : [],
            });
          } catch {
            /* metadata is a nicety, not a requirement */
          }
        }
      }

      session.playbackState = player.playing ? 'playing' : 'paused';
      if (player.duration > 0 && typeof session.setPositionState === 'function') {
        try {
          session.setPositionState({
            duration: player.duration,
            playbackRate: 1,
            position: Math.min(Math.max(0, player.position), player.duration),
          });
        } catch {
          /* an engine may reject an odd duration */
        }
      }
    }

    function seekBy(delta) {
      const audio = ensureAudio();
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      seekTo(Math.max(0, Math.min(audio.duration - 1, (audio.currentTime || 0) + delta)));
    }

    function wireMediaSession() {
      if (typeof navigator === 'undefined' || navigator.mediaSession === undefined) return;
      const session = navigator.mediaSession;
      const resume = () => {
        if (player.current === null) return;
        const audio = ensureAudio();
        if (audio.getAttribute('src') === null) {
          void playAt(player.index < 0 ? 0 : player.index, player.restoring);
          return;
        }
        void audio.play();
      };
      const handlers = {
        play: resume,
        pause: () => {
          if (player.audio !== null) player.audio.pause();
        },
        previoustrack: () => void step(-1),
        nexttrack: () => void step(1),
        seekbackward: (details) => seekBy(-(typeof details?.seekOffset === 'number' ? details.seekOffset : MEDIA_SEEK_STEP)),
        seekforward: (details) => seekBy(typeof details?.seekOffset === 'number' ? details.seekOffset : MEDIA_SEEK_STEP),
        seekto: (details) => {
          if (typeof details?.seekTime === 'number') seekTo(details.seekTime);
        },
      };
      for (const [action, handler] of Object.entries(handlers)) {
        try {
          session.setActionHandler(action, handler);
        } catch {
          /* an unsupported action is fine */
        }
      }
    }

    wireMediaSession();

    /**
     * The last playing track and where it stopped. DSH restarts lose the page,
     * and the queue lives in memory only, so a small snapshot is written to
     * local storage while playing and restored on the next boot.
     */
    const RESUME_KEY = 'dsh-yandex-music.resume';
    const RESUME_QUEUE_LIMIT = 300;
    let resumeSavedAt = 0;

    function saveResume(force) {
      const stamp = Date.now();
      if (force !== true && stamp - resumeSavedAt < 5_000) return;
      resumeSavedAt = stamp;
      try {
        if (typeof window === 'undefined' || window.localStorage === null) return;
        if (player.current === null) {
          window.localStorage.removeItem(RESUME_KEY);
          return;
        }
        window.localStorage.setItem(RESUME_KEY, JSON.stringify({
          index: player.index,
          position: Math.round(player.position),
          currentId: String(player.current.id),
          queue: player.queue.slice(0, RESUME_QUEUE_LIMIT),
        }));
      } catch {
        /* a full or blocked storage must never break playback */
      }
    }

    function restoreResume() {
      try {
        if (typeof window === 'undefined' || window.localStorage === null) return;
        const raw = window.localStorage.getItem(RESUME_KEY);
        if (raw === null || raw === '') return;
        const saved = JSON.parse(raw);
        const queue = Array.isArray(saved?.queue)
          ? saved.queue.filter((track) => track !== null && typeof track === 'object' && track.id !== undefined)
          : [];
        if (queue.length === 0) return;
        const index = Number.isInteger(saved.index) && saved.index >= 0 && saved.index < queue.length
          ? saved.index
          : queue.findIndex((track) => String(track.id) === String(saved.currentId ?? ''));
        player.queue = queue;
        player.index = index;
        player.current = index >= 0 ? queue[index] : null;
        const position = typeof saved.position === 'number' && saved.position > 0 ? saved.position : 0;
        player.position = position;
        player.restoring = position;
      } catch {
        /* a broken snapshot is simply ignored */
      }
    }

    restoreResume();

    if (typeof window !== 'undefined' && window.__ymResumeWired !== true) {
      window.__ymResumeWired = true;
      window.addEventListener('pagehide', () => saveResume(true));
    }

    function emit() {
      for (const listener of player.listeners) listener();
      syncMediaSession();
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
          saveResume();
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
     * The next track's direct URL, resolved while the current one plays. The
     * network round-trip is the audible part of the gap between tracks, so
     * resolving it in advance makes a queue sound almost continuous.
     */
    const prefetch = { index: -1, trackId: '', url: '', preview: false };

    function prefetchNext() {
      const next = player.index + 1;
      prefetch.index = -1;
      prefetch.trackId = '';
      prefetch.url = '';
      if (next < 0 || next >= player.queue.length) return;
      const track = player.queue[next];
      if (track === null || track === undefined || track.id === undefined) return;
      prefetch.index = next;
      prefetch.trackId = String(track.id);
      void (async () => {
        try {
          const value = await call('music/track-url', { trackId: track.id, albumId: track.albumId });
          // The queue may have moved while the request was in flight.
          if (prefetch.index !== next || prefetch.trackId !== String(track.id)) return;
          prefetch.url = typeof value.url === 'string' ? value.url : '';
          prefetch.preview = value.preview === true;
        } catch {
          /* a failed prefetch only means the normal request happens later */
        }
      })();
    }

    /** Use the prefetched URL when it belongs to exactly this track. */
    function takePrefetched(index) {
      const track = player.queue[index];
      if (track === null || track === undefined) return null;
      if (prefetch.index !== index || prefetch.trackId !== String(track.id) || prefetch.url === '') return null;
      const value = { url: prefetch.url, preview: prefetch.preview === true };
      prefetch.index = -1;
      prefetch.trackId = '';
      prefetch.url = '';
      return value;
    }

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

    async function playAt(index, startAt = 0) {
      if (index < 0 || index >= player.queue.length) return;
      const token = ++playToken;
      player.index = index;
      player.current = player.queue[index];
      player.error = '';
      const seekTo = Number.isFinite(startAt) && startAt > 0 ? startAt : 0;
      player.position = seekTo;
      player.duration = 0;
      player.loading = true;
      emit();
      try {
        const ready = takePrefetched(index);
        const value = ready !== null ? ready : await call('music/track-url', {
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
        if (seekTo > 0) {
          const jump = () => {
            try {
              audio.currentTime = seekTo;
            } catch {
              /* an unseekable element simply starts from the beginning */
            }
          };
          if (audio.readyState >= 1) jump();
          else audio.addEventListener('loadedmetadata', jump, { once: true });
        }
        await audio.play();
        if (token !== playToken) return;
        player.loading = false;
        player.restoring = 0;
        saveResume(true);
        syncMediaSession(true);
        prefetchNext();
        void sendFeedback('trackStarted', player.current);
      } catch (failure) {
        if (token !== playToken) return;
        player.loading = false;
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

    async function step(delta, report = true) {
      if (player.queue.length === 0) return;
      // A manual jump inside a wave is a skip, and the rotor learns from it.
      if (report === true && waveSession.active && player.current !== null && player.playing) {
        void sendFeedback('skip', player.current, player.position);
      }
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
      // A restored session has a current track but no media loaded yet.
      if (audio.getAttribute('src') === null) {
        void playAt(player.index < 0 ? 0 : player.index, player.restoring);
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
      player.wave = false;
      player.queue = tracks.slice();
      void playAt(index);
    }

    /** Fill the queue without starting playback — the default of «Текущий». */
    function loadQueue(tracks) {
      if (!Array.isArray(tracks) || tracks.length === 0) return;
      waveSession.active = false;
      player.wave = false;
      player.queue = tracks.slice();
      player.index = -1;
      player.current = null;
      player.playing = false;
      player.position = 0;
      player.duration = 0;
      emit();
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

    async function startWave(station) {
      const target = typeof station === 'string' && station !== '' ? station : 'user:onyourwave';
      const value = await call(`music/wave?station=${encodeURIComponent(target)}`);
      const tracks = Array.isArray(value.tracks) ? value.tracks : [];
      if (tracks.length === 0) throw new Error('wave is empty');
      waveSession.active = true;
      player.wave = true;
      waveSession.station = typeof value.station === 'string' && value.station !== '' ? value.station : target;
      waveSession.batchId = typeof value.batchId === 'string' ? value.batchId : '';
      player.queue = tracks.slice();
      player.index = -1;
      await playAt(0);
    }

    /** Append the next batch and report the index of its first track, or null. */
    async function extendWave() {
      const value = await call(`music/wave?station=${encodeURIComponent(waveSession.station)}`);
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
      player.wave = false;
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
      saveResume(true);
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
    /* track context menu                                                  */
    /* ------------------------------------------------------------------ */

    /**
     * One menu for every track row, opened by the right mouse button. A row
     * hands over the navigation actions it owns, so «к исполнителю» appears
     * only where that jump is actually possible.
     */
    const trackMenu = { open: false, x: 0, y: 0, track: null, actions: {}, listeners: new Set() };

    function emitMenu() {
      for (const listener of trackMenu.listeners) listener();
    }

    function openTrackMenu(event, track, actions) {
      if (track === null || typeof track !== 'object') return;
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      trackMenu.open = true;
      trackMenu.track = track;
      trackMenu.actions = actions ?? {};
      // Keep the whole panel on screen, wherever the click happened.
      trackMenu.x = Math.max(8, Math.min(event.clientX, window.innerWidth - 222));
      trackMenu.y = Math.max(8, Math.min(event.clientY, window.innerHeight - 240));
      emitMenu();
    }

    /** Drag near an edge scrolls the pane, so a long list can be reordered by hand. */
    function autoScrollOnDrag(event) {
      const node = event.currentTarget;
      const pane = node instanceof Element ? node.closest('.ym-card-pane') : null;
      if (pane === null) return;
      const box = pane.getBoundingClientRect();
      const edge = 52;
      if (event.clientY < box.top + edge) pane.scrollTop -= 14;
      else if (event.clientY > box.bottom - edge) pane.scrollTop += 14;
    }

    function closeTrackMenu() {
      if (trackMenu.open !== true) return;
      trackMenu.open = false;
      emitMenu();
    }

    function useTrackMenu() {
      const [, force] = React.useReducer((value) => value + 1, 0);
      React.useEffect(() => {
        const listener = () => force();
        trackMenu.listeners.add(listener);
        return () => {
          trackMenu.listeners.delete(listener);
        };
      }, []);
      return trackMenu;
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
      const [dragFrom, setDragFrom] = React.useState(-1);
      const [dragOver, setDragOver] = React.useState(-1);
      const [state, setState] = React.useState({
        view: 'list',
        loading: paneCache.playlists === null,
        error: '',
        playlists: paneCache.playlists ?? [],
        kind: -1,
        title: '',
        visibility: 'private',
        tracks: [],
        tracksLoading: false,
        editing: false,
        draft: '',
        confirmDelete: false,
        busy: false,
        message: '',
        newTitle: '',
      });

      const loadList = React.useCallback(async () => {
        try {
          const value = await call('music/playlists');
          const playlists = Array.isArray(value.playlists) ? value.playlists : [];
          paneCache.playlists = playlists;
          setState((previous) => ({
            ...previous,
            loading: false,
            error: '',
            playlists,
          }));
        } catch (failure) {
          setState((previous) => ({ ...previous, loading: false, error: failure.message || 'playlists failed' }));
        }
      }, []);

      React.useEffect(() => {
        void loadList();
      }, [loadList]);

      /** Open a playlist; `silent` refreshes it without resetting the edit panel. */
      const open = React.useCallback(async (kind, title, silent = false) => {
        setState((previous) => ({
          ...previous,
          view: 'tracks',
          kind,
          title,
          tracks: silent ? previous.tracks : [],
          tracksLoading: true,
          error: '',
          message: '',
          ...(silent ? {} : { editing: false, draft: title, confirmDelete: false }),
        }));
        try {
          const value = await call('music/playlist', { kind });
          setState((previous) => ({
            ...previous,
            tracksLoading: false,
            title: typeof value.title === 'string' && value.title !== '' ? value.title : previous.title,
            visibility: typeof value.visibility === 'string' ? value.visibility : previous.visibility,
            tracks: Array.isArray(value.tracks) ? value.tracks : [],
          }));
        } catch (failure) {
          setState((previous) => ({ ...previous, tracksLoading: false, error: failure.message || 'playlist failed' }));
        }
      }, []);

      /** Run one edit, then refresh the playlist and the list behind it. */
      const mutate = async (path, body, message) => {
        if (state.busy) return;
        setState((previous) => ({ ...previous, busy: true, error: '', message: '' }));
        try {
          await call(path, body);
          setState((previous) => ({ ...previous, busy: false, message: message ?? '' }));
          await open(state.kind, state.title, true);
          await loadList();
        } catch (failure) {
          setState((previous) => ({ ...previous, busy: false, error: failure.message || 'edit failed' }));
        }
      };

      const create = async () => {
        const title = state.newTitle.trim();
        if (title === '' || state.busy) return;
        setState((previous) => ({ ...previous, busy: true, error: '', message: '' }));
        try {
          const created = await call('music/playlist/create', { title });
          setState((previous) => ({ ...previous, busy: false, newTitle: '', message: t('playlistCreated') }));
          await loadList();
          await open(created.kind, typeof created.title === 'string' ? created.title : title);
        } catch (failure) {
          setState((previous) => ({ ...previous, busy: false, error: failure.message || 'create failed' }));
        }
      };

      const removePlaylist = async () => {
        if (state.busy) return;
        setState((previous) => ({ ...previous, busy: true, error: '' }));
        try {
          await call('music/playlist/delete', { kind: state.kind });
          setState((previous) => ({
            ...previous,
            busy: false,
            view: 'list',
            editing: false,
            confirmDelete: false,
            message: t('playlistDeleted'),
          }));
          await loadList();
        } catch (failure) {
          setState((previous) => ({ ...previous, busy: false, error: failure.message || 'delete failed' }));
        }
      };

      if (state.view === 'tracks') {
        const playing = playback.current === null ? '' : String(playback.current.id);
        const editable = state.kind >= 0 && state.kind !== 3;

        /**
         * A drop is resolved from the row under the pointer, not from the row
         * that owns the handler: the sticky header and the gaps between rows
         * sit on top of the list, so row-level `onDrop` misses the top of it.
         */
        const dropTo = (event, requested) => {
          event.preventDefault();
          const raw = Number(event.dataTransfer === null || event.dataTransfer === undefined
            ? ''
            : event.dataTransfer.getData('text/plain'));
          const from = Number.isInteger(raw) && raw >= 0 ? raw : dragFrom;
          setDragFrom(-1);
          setDragOver(-1);
          if (!editable || !Number.isInteger(requested)) return;
          if (from < 0 || requested < 0 || from === requested) return;
          if (requested >= state.tracks.length) return;
          void mutate('music/playlist/move', { kind: state.kind, from, to: requested });
        };

        const rows = state.tracks.map((track, index) => h('div', {
          key: `${track.id}-${index}`,
          className: 'ym-result',
          'data-active': playing !== '' && playing === String(track.id) ? 'true' : 'false',
          'data-over': dragOver === index ? 'true' : 'false',
          'data-index': index,
          draggable: editable,
          onDragStart: (event) => {
            setDragFrom(index);
            if (event.dataTransfer !== null && event.dataTransfer !== undefined) {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', String(index));
            }
          },
          onDragEnter: (event) => {
            if (!editable) return;
            event.preventDefault();
            setDragOver(index);
          },
          onDragOver: (event) => {
            if (!editable) return;
            event.preventDefault();
            setDragOver(index);
          },
          onDragLeave: () => setDragOver(-1),
          onDragEnd: () => {
            setDragFrom(-1);
            setDragOver(-1);
          },
          onContextMenu: (event) => openTrackMenu(event, track),
        },
        h('button', {
          type: 'button',
          className: 'ym-queue-open',
          onClick: () => playQueue(state.tracks, index),
        },
        track.cover !== null
          ? h('img', { className: 'ym-result-cover', src: track.cover, alt: '', loading: 'lazy' })
          : h('span', { className: 'ym-result-cover' }),
        h('span', { className: 'ym-result-text' },
          h('span', { className: 'ym-result-title' }, track.title),
          h('span', { className: 'ym-result-sub' }, track.artists))),
        h('span', { className: 'ym-result-time' }, fmtTime(track.durationMs)),
        editable
          ? h('span', { className: 'ym-result-actions' },
            h('button', {
              className: 'ym-mini-button',
              type: 'button',
              'aria-label': t('moveUp'),
              title: t('moveUp'),
              disabled: state.busy || index === 0,
              onClick: () => void mutate('music/playlist/move', { kind: state.kind, from: index, to: index - 1 }),
            }, '\u2191'),
            h('button', {
              className: 'ym-mini-button',
              type: 'button',
              'aria-label': t('moveDown'),
              title: t('moveDown'),
              disabled: state.busy || index === state.tracks.length - 1,
              onClick: () => void mutate('music/playlist/move', { kind: state.kind, from: index, to: index + 1 }),
            }, '\u2193'),
            h('button', {
              className: 'ym-mini-button',
              type: 'button',
              'aria-label': t('removeRow'),
              title: t('removeRow'),
              disabled: state.busy,
              onClick: () => void mutate('music/playlist/remove', { kind: state.kind, from: index }),
            }, '\u00d7'))
          : null));

        const editPanel = state.editing && editable
          ? h('div', { className: 'ym-add ym-add-inline' },
            h('div', { className: 'ym-add-head' },
              h('span', { className: 'ym-add-title' }, t('editPlaylist')),
              h('button', {
                className: 'ym-mini-button',
                type: 'button',
                'aria-label': t('close'),
                onClick: () => setState((previous) => ({ ...previous, editing: false, confirmDelete: false })),
              }, '\u00d7')),
            h('div', { className: 'ym-add-create' },
              h('input', {
                className: 'ym-input',
                value: state.draft,
                maxLength: 120,
                placeholder: t('newPlaylistPlaceholder'),
                onChange: (event) => setState((previous) => ({ ...previous, draft: event.target.value })),
                onKeyDown: (event) => {
                  if (event.key !== 'Enter') return;
                  const next = state.draft.trim();
                  if (next !== '' && next !== state.title) {
                    void mutate('music/playlist/rename', { kind: state.kind, title: next }, t('playlistRenamed'));
                  }
                },
              }),
              h('button', {
                className: 'ym-button',
                type: 'button',
                disabled: state.busy || state.draft.trim() === '' || state.draft.trim() === state.title,
                onClick: () => void mutate(
                  'music/playlist/rename',
                  { kind: state.kind, title: state.draft.trim() },
                  t('playlistRenamed'),
                ),
              }, t('save'))),
            h('div', { className: 'ym-add-create' },
              h('span', { className: 'ym-hint' }, state.visibility === 'public' ? t('visibilityPublic') : t('visibilityPrivate')),
              h('button', {
                className: 'ym-button',
                'data-variant': 'ghost',
                type: 'button',
                disabled: state.busy,
                onClick: () => void mutate(
                  'music/playlist/visibility',
                  { kind: state.kind, visibility: state.visibility === 'public' ? 'private' : 'public' },
                  t('playlistRenamed'),
                ),
              }, state.visibility === 'public' ? t('makePrivate') : t('makePublic'))),
            h('div', { className: 'ym-add-create' },
              state.confirmDelete
                ? h('button', {
                  className: 'ym-button',
                  type: 'button',
                  disabled: state.busy,
                  onClick: () => void removePlaylist(),
                }, t('deleteConfirm'))
                : h('button', {
                  className: 'ym-button',
                  'data-variant': 'ghost',
                  type: 'button',
                  disabled: state.busy,
                  onClick: () => setState((previous) => ({ ...previous, confirmDelete: true })),
                }, t('deletePlaylist'))))
          : null;

        return h('div', { className: 'ym-form', 'data-dragging': dragFrom >= 0 ? 'true' : 'false' },
          h('div', {
            className: 'ym-row ym-sticky-bar',
            onDragOver: (event) => {
              if (editable) event.preventDefault();
            },
            // Dropping on the header means «move to the top».
            onDrop: (event) => dropTo(event, 0),
          },
            h('button', {
              type: 'button',
              className: 'ym-icon-button',
              'aria-label': t('back'),
              title: t('back'),
              onClick: () => setState((previous) => ({
                ...previous,
                view: 'list',
                error: '',
                editing: false,
                confirmDelete: false,
                message: '',
              })),
            }, '\u2190'),
            h('span', { className: 'ym-playlist-title' }, state.title),
            editable
              ? h('button', {
                type: 'button',
                className: 'ym-icon-button',
                'data-on': state.editing ? 'true' : 'false',
                'aria-label': t('editPlaylist'),
                title: t('editPlaylist'),
                onClick: () => setState((previous) => ({
                  ...previous,
                  editing: !previous.editing,
                  draft: previous.title,
                  confirmDelete: false,
                })),
              }, '\u22ef')
              : null,
            h('button', {
              type: 'button',
              className: 'ym-icon-button',
              'aria-label': t('addAllToQueue'),
              title: t('addAllToQueue'),
              disabled: state.tracks.length === 0,
              onClick: () => addToQueue(state.tracks),
            }, '+')),
          editPanel,
          state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error) : null,
          state.message !== '' ? h('p', { className: 'ym-hint' }, state.message) : null,
          state.tracksLoading && rows.length === 0 ? h(SkeletonRows, { count: 6 }) : null,
          !state.tracksLoading && rows.length === 0 && state.error === ''
            ? h('p', { className: 'ym-hint' }, t('playlistEmpty'))
            : null,
          rows.length > 0
            ? h('p', { className: 'ym-section' }, `${t('tracksSection')} \u00b7 ${state.tracks.length}`)
            : null,
          h('div', {
            className: 'ym-results',
            onDragOver: (event) => {
              if (editable) event.preventDefault();
              if (editable) autoScrollOnDrag(event);
            },
            onDrop: (event) => {
              const row = event.target instanceof Element ? event.target.closest('[data-index]') : null;
              const requested = row === null ? 0 : Number(row.getAttribute('data-index'));
              dropTo(event, requested);
            },
          }, rows));
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
        h('div', { className: 'ym-add-create' },
          h('input', {
            className: 'ym-input',
            value: state.newTitle,
            placeholder: t('newPlaylistPlaceholder'),
            maxLength: 120,
            onChange: (event) => setState((previous) => ({ ...previous, newTitle: event.target.value })),
            onKeyDown: (event) => {
              if (event.key === 'Enter') void create();
            },
          }),
          h('button', {
            className: 'ym-button',
            type: 'button',
            disabled: state.busy || state.newTitle.trim() === '',
            onClick: () => void create(),
          }, t('createPlaylist'))),
        state.loading && rows.length === 0 ? h(SkeletonRows, { count: 5 }) : null,
        state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error) : null,
        state.message !== '' ? h('p', { className: 'ym-hint' }, state.message) : null,
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

    /**
     * «Моя волна» plus the whole station catalogue: mood, activity, epoch,
     * genres and a wave started from any artist.
     */
    function WavePane({ t }) {
      const [catalog, setCatalog] = React.useState({
        loading: paneCache.stations === null,
        error: '',
        stations: paneCache.stations ?? [],
      });
      const [busy, setBusy] = React.useState('');
      const [error, setError] = React.useState('');
      const [query, setQuery] = React.useState('');
      const [artists, setArtists] = React.useState([]);
      const [searching, setSearching] = React.useState(false);

      React.useEffect(() => {
        let cancelled = false;
        (async () => {
          try {
            const value = await call('music/wave/stations');
            if (cancelled) return;
            const stations = Array.isArray(value.stations) ? value.stations : [];
            paneCache.stations = stations;
            setCatalog({ loading: false, error: '', stations });
          } catch (failure) {
            if (!cancelled) setCatalog({ loading: false, error: failure.message || 'stations failed', stations: [] });
          }
        })();
        return () => {
          cancelled = true;
        };
      }, []);

      React.useEffect(() => {
        const trimmed = query.trim();
        if (trimmed === '') {
          setArtists([]);
          setSearching(false);
          return undefined;
        }
        let cancelled = false;
        setSearching(true);
        const timer = window.setTimeout(async () => {
          try {
            const value = await call(`music/search?q=${encodeURIComponent(trimmed)}`);
            if (cancelled) return;
            setArtists(Array.isArray(value.artists) ? value.artists : []);
          } catch {
            if (!cancelled) setArtists([]);
          } finally {
            if (!cancelled) setSearching(false);
          }
        }, 350);
        return () => {
          cancelled = true;
          window.clearTimeout(timer);
        };
      }, [query]);

      const start = async (station) => {
        if (busy !== '') return;
        setBusy(station);
        setError('');
        try {
          await startWave(station);
          setBusy('');
        } catch (failure) {
          setBusy('');
          setError(failure.message || t('waveFailed'));
        }
      };

      const groups = [
        { kind: 'mood', title: t('waveMood') },
        { kind: 'activity', title: t('waveActivity') },
        { kind: 'epoch', title: t('waveEpoch') },
        { kind: 'genre', title: t('waveGenre'), limit: 24 },
        { kind: 'personal', title: t('wavePersonal') },
        { kind: 'local-language', title: t('waveLanguage') },
      ]
        .map((group) => ({
          ...group,
          stations: catalog.stations.filter((station) => station.kind === group.kind).slice(0, group.limit ?? 40),
        }))
        .filter((group) => group.stations.length > 0);

      const chips = (stations) => stations.map((station) => h('button', {
        key: station.id,
        className: 'ym-station',
        type: 'button',
        title: station.name,
        disabled: busy !== '',
        'data-on': busy === station.id ? 'true' : 'false',
        onClick: () => void start(station.id),
      },
      station.icon !== null
        ? h('img', {
          className: 'ym-station-icon',
          src: station.icon,
          alt: '',
          loading: 'lazy',
          style: station.color === '' ? {} : { background: station.color },
        })
        : h('span', {
          className: 'ym-station-icon',
          'aria-hidden': 'true',
          style: station.color === '' ? {} : { background: station.color },
        }),
      h('span', { className: 'ym-chip-title' }, station.name)));

      return h('div', { className: 'ym-form' },
        h('button', {
          className: 'ym-button',
          type: 'button',
          disabled: busy !== '',
          onClick: () => void start('user:onyourwave'),
        }, busy === 'user:onyourwave' ? t('waveLoading') : t('waveStart')),
        h(StatusLine, {
          text: error !== '' ? error : catalog.error,
          error: error !== '' || catalog.error !== '',
        }),
        catalog.loading && groups.length === 0 ? h(SkeletonRows, { count: 4 }) : null,
        groups.map((group) => h('div', { key: group.kind },
          h('p', { className: 'ym-section' }, group.title),
          h('div', { className: 'ym-strip ym-strip-wrap' }, chips(group.stations)))),
        h('p', { className: 'ym-section' }, t('waveByArtist')),
        h('input', {
          className: 'ym-input ym-search',
          value: query,
          placeholder: t('waveArtistPlaceholder'),
          autoComplete: 'off',
          onChange: (event) => setQuery(event.target.value),
        }),
        h(StatusLine, { text: searching ? t('searching') : '' }),
        artists.length > 0
          ? h('div', { className: 'ym-results' }, artists.map((artist) => h('button', {
            key: `a${artist.id}`,
            type: 'button',
            className: 'ym-result',
            disabled: busy !== '',
            onClick: () => void start(`artist:${artist.id}`),
          },
          artist.cover !== null
            ? h('img', { className: 'ym-result-cover', src: artist.cover, alt: '', loading: 'lazy' })
            : h('span', { className: 'ym-result-cover' }),
          h('span', { className: 'ym-result-text' },
            h('span', { className: 'ym-result-title' }, artist.name),
            h('span', { className: 'ym-result-sub' }, `${artist.trackCount}`)))))
          : null);
    }

    /** Queue editor: reorder by drag or arrows, remove, and jump to a track. */
    function QueuePane({ t }) {
      const state = usePlayer();
      const [dragFrom, setDragFrom] = React.useState(-1);
      const [dragOver, setDragOver] = React.useState(-1);
      const [origin, setOrigin] = React.useState({ kind: 'queue', total: 0, loading: false });
      const listRef = React.useRef(null);

      /**
       * An empty queue would make this tab look broken, so it opens with the
       * liked tracks loaded (nothing is started, the user presses play instead).
       */
      React.useEffect(() => {
        let cancelled = false;
        if (player.queue.length > 0) return undefined;
        if (paneCache.likes !== null) {
          setOrigin({ kind: 'likes', total: paneCache.likes.length, loading: false });
          loadQueue(paneCache.likes);
          return undefined;
        }
        setOrigin({ kind: 'likes', total: 0, loading: true });
        (async () => {
          try {
            const value = await call('music/playlist', { kind: 3 });
            const tracks = Array.isArray(value.tracks) ? value.tracks : [];
            if (cancelled) return;
            paneCache.likes = tracks;
            setOrigin({ kind: 'likes', total: tracks.length, loading: false });
            if (player.queue.length === 0) loadQueue(tracks);
          } catch {
            if (!cancelled) setOrigin({ kind: 'queue', total: 0, loading: false });
          }
        })();
        return () => {
          cancelled = true;
        };
      }, []);

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

      /**
       * The drop target is the row under the pointer, not the row that owns the
       * handler: the sticky toolbar sits on top of the list, so a row-level
       * `onDrop` misses the top of it and dragging upwards did nothing.
       */
      const dropTo = (event, requested) => {
        event.preventDefault();
        const raw = Number(event.dataTransfer === null || event.dataTransfer === undefined
          ? ''
          : event.dataTransfer.getData('text/plain'));
        const from = Number.isInteger(raw) && raw >= 0 ? raw : dragFrom;
        setDragFrom(-1);
        setDragOver(-1);
        if (from < 0 || !Number.isInteger(requested) || from === requested) return;
        if (requested >= state.queue.length) return;
        moveInQueue(from, requested);
      };

      const repeatLabel = state.repeat === 'one'
        ? t('repeatOne')
        : state.repeat === 'all' ? t('repeatAll') : t('repeatOff');

      const header = h('div', {
        className: 'ym-queue-head',
        onDragOver: (event) => event.preventDefault(),
        onDrop: (event) => dropTo(event, 0),
      },
        h('span', { className: 'ym-playlist-title' }, `${origin.kind === 'likes' ? t('likedPlaylist') : t('tabCurrent')} \u00b7 ${state.queue.length}`),
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
        return h('div', { className: 'ym-form', 'data-dragging': dragFrom >= 0 ? 'true' : 'false' }, header,
          origin.loading ? h(SkeletonRows, { count: 5 }) : h(StatusLine, { text: t('queueEmpty') }));
      }

      const rows = state.queue.map((track, index) => h('div', {
        key: `${track.id}-${index}`,
        className: 'ym-queue-row',
        'data-active': state.index === index ? 'true' : 'false',
        'data-over': dragOver === index ? 'true' : 'false',
        'data-index': index,
        onContextMenu: (event) => openTrackMenu(event, track),
        draggable: true,
        onDragStart: (event) => {
          setDragFrom(index);
          if (event.dataTransfer !== null && event.dataTransfer !== undefined) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(index));
          }
        },
        onDragEnter: (event) => {
          event.preventDefault();
          setDragOver(index);
        },
        onDragOver: (event) => {
          event.preventDefault();
          setDragOver(index);
        },
        onDragLeave: () => setDragOver(-1),
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

      return h('div', { className: 'ym-form', 'data-dragging': dragFrom >= 0 ? 'true' : 'false' }, header, h('div', {
        className: 'ym-results',
        ref: listRef,
        onDragOver: (event) => {
          event.preventDefault();
          autoScrollOnDrag(event);
        },
        onDrop: (event) => {
          const row = event.target instanceof Element ? event.target.closest('[data-index]') : null;
          dropTo(event, row === null ? 0 : Number(row.getAttribute('data-index')));
        },
      }, rows));
    }

    /** Add the current track to a Yandex playlist, or create one on the spot. */
    function AddToPlaylist({ t, track, onClose, inline }) {
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

      return h('div', {
        className: inline === true ? 'ym-add ym-add-inline' : 'ym-add',
        role: 'dialog',
        'aria-label': t('addToPlaylist'),
      },
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
      const percent = Math.round((state.muted ? 0 : state.volume) * 100);

      /** Mute on click, vertical slider on hover — one compact control. */
      const volumeControl = h('span', { className: 'ym-volume-wrap' },
        h('button', {
          className: 'ym-icon-button',
          type: 'button',
          'aria-label': state.muted ? t('unmute') : t('mute'),
          title: state.muted ? t('unmute') : t('mute'),
          onClick: toggleMute,
          onWheel: (event) => {
            // Wheel over the icon is the fastest way to nudge the volume.
            event.preventDefault();
            const step = event.deltaY < 0 ? 0.05 : -0.05;
            setVolume((player.muted ? 0 : player.volume) + step);
          },
        }, h(VolumeIcon, { size: 17, muted: state.muted })),
        h('div', { className: 'ym-volume-pop', role: 'group', 'aria-label': t('volume') },
          h('div', { className: 'ym-volume-slot' },
            h('input', {
              className: 'ym-volume-vert',
              type: 'range',
              min: 0,
              max: 100,
              step: 1,
              value: percent,
              'aria-label': t('volume'),
              onChange: (event) => setVolume(Number(event.target.value) / 100),
            })),
          h('span', { className: 'ym-volume-value' }, `${percent}%`)));

      return h('div', { className: 'ym-player' },
        h('div', { className: 'ym-player-head' },
          h(Marquee, { text: `${current.artists} \u2014 ${current.title}`, className: 'ym-player-title' }),
          state.preview ? h('span', { className: 'ym-badge' }, t('previewBadge')) : null),
        h('div', { className: 'ym-seek-row' },
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
            disabled: state.loading,
            onClick: togglePlay,
          }, state.loading
            ? h('span', { className: 'ym-spinner', 'aria-hidden': 'true' })
            : state.playing ? '\u23f8' : '\u25b6'),
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
                  // A «like» during a wave teaches the rotor what to keep.
                  if (state.wave && likes.ids.has(currentId)) {
                    void sendFeedback('like', current, state.position);
                  }
                } catch {
                  /* a rejected like leaves the heart as it was */
                }
              })();
            },
          }, likedNow ? '\u2665' : '\u2661'),
          state.wave
            ? h('button', {
              className: 'ym-icon-button',
              type: 'button',
              'aria-label': t('dislike'),
              title: t('dislike'),
              onClick: () => {
                void sendFeedback('dislike', current, state.position);
                void step(1, false);
              },
            }, '\u2715')
            : null,
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'aria-label': t('addToPlaylist'),
            title: t('addToPlaylist'),
            'aria-expanded': addOpen ? 'true' : 'false',
            onClick: () => setAddOpen((value) => !value),
          }, '+'),
          h('button', {
            className: 'ym-icon-button',
            type: 'button',
            'data-on': state.lyricsOpen ? 'true' : 'false',
            'aria-label': t('lyrics'),
            title: t('lyrics'),
            'aria-pressed': state.lyricsOpen ? 'true' : 'false',
            onClick: toggleLyrics,
          }, 'Aa'),
          volumeControl),
        addOpen ? h(AddToPlaylist, { t, track: current, onClose: () => setAddOpen(false) }) : null,
        state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error === 'playback' ? t('playbackFailed') : state.error) : null);
    }

    /** Cyrillic versus latin: a Cyrillic song has nothing to translate. */
    function looksForeign(lines) {
      const joined = lines.join(' ');
      const cyrillic = (joined.match(/[а-яё]/giu) ?? []).length;
      const latin = (joined.match(/[a-z]/giu) ?? []).length;
      return latin > cyrillic && latin > 10;
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
      const [data, setData] = React.useState({ loading: true, error: '', lines: [], timed: [], source: '' });
      const [tr, setTr] = React.useState({ loading: false, active: false, error: '', source: '', mode: 'lines', lines: [], text: '' });
      const bodyRef = React.useRef(null);

      React.useEffect(() => {
        let cancelled = false;
        if (currentId === '') {
          setData({ loading: false, error: '', lines: [], timed: [], source: '' });
          return undefined;
        }
        // The title is what lets the host look the text up outside Yandex.
        const query = new URLSearchParams({
          trackId: currentId,
          title: current === null ? '' : current.title,
          artist: current === null ? '' : current.artists,
          duration: String(current === null ? 0 : current.durationMs),
        });
        setData({ loading: true, error: '', lines: [], timed: [], source: '' });
        setTr({ loading: false, active: false, error: '', source: '', mode: 'lines', lines: [], text: '' });
        (async () => {
          try {
            const value = await call(`music/lyrics?${query}`);
            if (cancelled) return;
            setData({
              loading: false,
              error: '',
              lines: Array.isArray(value.lines) ? value.lines : [],
              timed: Array.isArray(value.timed) ? value.timed : [],
              source: typeof value.source === 'string' ? value.source : '',
            });
          } catch (failure) {
            if (!cancelled) setData({ loading: false, error: failure.message || 'lyrics failed', lines: [], timed: [], source: '' });
          }
        })();
        return () => {
          cancelled = true;
        };
      }, [currentId]);

      const lines = Array.isArray(data.lines) ? data.lines : [];
      const timed = Array.isArray(data.timed) ? data.timed : [];
      const durationMs = state.duration > 0 ? state.duration * 1000 : (current === null ? 0 : current.durationMs);
      const positionMs = state.position * 1000;

      const starts = [];
      let active = -1;
      if (timed.length > 0) {
        // Real timecodes: the only honest karaoke.
        for (let i = 0; i < timed.length; i += 1) {
          starts.push(timed[i].timeMs);
          if (timed[i].timeMs <= positionMs) active = i;
        }
        if (active < 0) active = 0;
      } else {
        // Plain text: spread the lines over the track by their own length.
        const weights = lines.map((line) => (line.trim() === '' ? 0.55 : Math.max(1, line.trim().length)));
        const totalWeight = weights.reduce((sum, value) => sum + value, 0);
        let cursor = 0;
        for (let i = 0; i < lines.length; i += 1) {
          starts.push(totalWeight === 0 ? 0 : (cursor / totalWeight) * durationMs);
          const end = totalWeight === 0 ? 0 : ((cursor + weights[i]) / totalWeight) * durationMs;
          if (active < 0 && durationMs > 0 && positionMs < end) active = i;
          cursor += weights[i];
        }
        if (active < 0 && lines.length > 0) active = lines.length - 1;
      }

      const canTranslate = looksForeign(lines);

      /** Fetch a Russian translation once and keep it until the track changes. */
      const translate = async () => {
        if (tr.loading) return;
        if (tr.active) {
          setTr((previous) => ({ ...previous, active: false }));
          return;
        }
        setTr({ loading: true, active: false, error: '', source: '', mode: 'lines', lines: [], text: '' });
        try {
          const value = await call('music/translate', {
            lines,
            title: current === null ? '' : current.title,
            artist: current === null ? '' : current.artists,
          });
          if (value.available !== true) {
            setTr({
              loading: false,
              active: false,
              error: value.reason === 'same-language' ? t('sameLanguage') : t('translateFailed'),
              source: '',
              mode: 'lines',
              lines: [],
              text: '',
            });
            return;
          }
          setTr({
            loading: false,
            active: true,
            error: '',
            source: typeof value.source === 'string' ? value.source : '',
            mode: typeof value.mode === 'string' ? value.mode : 'lines',
            lines: Array.isArray(value.lines) ? value.lines : [],
            text: typeof value.text === 'string' ? value.text : '',
          });
        } catch (failure) {
          setTr({ loading: false, active: false, error: failure.message || 'translate failed', source: '', mode: 'lines', lines: [], text: '' });
        }
      };

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

      return h('div', { className: 'ym-lyrics-card', 'data-yandex-music-lyrics': '', style, role: 'dialog', 'aria-label': t('lyrics') },
        h('div', {
          className: 'ym-lyrics-bg',
          'aria-hidden': 'true',
          style: current === null || typeof current.cover !== 'string' ? {} : { backgroundImage: `url("${current.cover}")` },
        }),
        h('div', { className: 'ym-lyrics-scrim', 'aria-hidden': 'true' }),
        h('div', { className: 'ym-lyrics-head' },
          h('span', { className: 'ym-card-title' }, t('lyrics')),
          h('span', { className: 'ym-lyrics-actions' },
            canTranslate
              ? h('button', {
                className: 'ym-mini-button',
                type: 'button',
                'data-on': tr.active ? 'true' : 'false',
                'aria-label': tr.active ? t('hideTranslation') : t('translate'),
                title: tr.active ? t('hideTranslation') : t('translate'),
                disabled: tr.loading,
                onClick: () => void translate(),
              }, tr.loading ? '\u2026' : '\u042f')
              : null,
            h('button', {
              className: 'ym-card-close',
              type: 'button',
              'aria-label': t('close'),
              onClick: onClose,
            }, '\u00d7'))),
        h('p', { className: 'ym-lyrics-track' }, current === null ? '' : `${current.title} \u2014 ${current.artists}`),
        h('div', { className: 'ym-lyrics-body', ref: bodyRef },
          h(StatusLine, {
            text: data.error !== ''
              ? data.error
              : data.loading
                ? t('searching')
                : lines.length === 0 ? t('noLyrics') : '',
            error: data.error !== '',
          }),
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
            }, line,
            tr.active && typeof tr.lines[index] === 'string' && tr.lines[index] !== ''
              ? h('span', { className: 'ym-lyric-tr' }, tr.lines[index])
              : null)),
          tr.active && tr.mode === 'block' && tr.text !== ''
            ? h('p', { className: 'ym-lyric-tr ym-lyric-tr-block' }, tr.text)
            : null,
          tr.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, tr.error) : null,
          lines.length > 0
            ? h('p', { className: 'ym-lyrics-note' },
              `${t('lyricsSource')}: ${data.source === 'yandex' ? 'Яндекс' : data.source === 'lrclib' ? 'lrclib' : '—'}`,
              timed.length > 0 ? ` \u00b7 ${t('lyricsSynced')}` : ` \u00b7 ${t('lyricsEstimated')}`,
              tr.active
                ? ` \u00b7 ${t('translationSource')}: ${tr.source === 'amalgama' ? 'amalgama-lab' : tr.source === 'machine' ? t('translationMachine') : '—'}`
                : '')
            : null));
    }

    /** The right-click menu itself: portalled so no pane can clip it. */
    function TrackMenu({ t }) {
      const state = useTrackMenu();
      const [pane, setPane] = React.useState('root');
      const [copied, setCopied] = React.useState(false);
      const [liked, setLiked] = React.useState(false);
      const track = state.track;

      React.useEffect(() => {
        if (state.open !== true) {
          setPane('root');
          setCopied(false);
          return undefined;
        }
        const onDown = (event) => {
          if (event.target instanceof Element && event.target.closest('.ym-menu') !== null) return;
          closeTrackMenu();
        };
        const onKey = (event) => {
          if (event.key === 'Escape') closeTrackMenu();
        };
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('keydown', onKey);
        return () => {
          document.removeEventListener('pointerdown', onDown, true);
          document.removeEventListener('keydown', onKey);
        };
      }, [state.open]);

      React.useEffect(() => {
        if (state.open !== true || track === null) return undefined;
        let alive = true;
        setLiked(likes.ids.has(String(track.id)));
        void loadLikes().then((ids) => {
          if (alive) setLiked(ids.has(String(track.id)));
        });
        return () => {
          alive = false;
        };
      }, [state.open, track]);

      if (state.open !== true || track === null) return null;

      const close = () => closeTrackMenu();
      const item = (key, icon, label, onClick) => h('button', {
        key,
        className: 'ym-menu-item',
        type: 'button',
        role: 'menuitem',
        onClick,
      }, h('span', { className: 'ym-menu-icon', 'aria-hidden': 'true' }, icon), label);

      return ReactDOM.createPortal(
        h('div', {
          className: 'ym-menu',
          'data-yandex-music-menu': '',
          role: 'menu',
          style: { left: state.x, top: state.y },
        },
        h('p', { className: 'ym-menu-title' }, `${track.artists} \u2014 ${track.title}`),
        pane === 'playlist'
          ? h(AddToPlaylist, { t, track, inline: true, onClose: () => setPane('root') })
          : [
            item('next', '\u2934', t('menuNext'), () => {
              close();
              playNextInQueue(track);
            }),
            item('queue', '\u2261', t('menuQueue'), () => {
              close();
              addToQueue(track);
            }),
            item('playlist', '+', t('menuPlaylist'), () => setPane('playlist')),
            item('like', liked ? '\u2665' : '\u2661', liked ? t('unlike') : t('like'), () => {
              void (async () => {
                try {
                  await toggleLike(track);
                  setLiked(likes.ids.has(String(track.id)));
                } catch {
                  /* a rejected like leaves the menu as it was */
                }
              })();
            }),
            typeof state.actions.onArtist === 'function' && track.artistId !== null && track.artistId !== undefined
              ? item('artist', '\u2192', t('menuArtist'), () => {
                const action = state.actions.onArtist;
                close();
                action(track.artistId, track.artists);
              })
              : null,
            typeof state.actions.onAlbum === 'function' && track.albumId !== null && track.albumId !== undefined
              ? item('album', '\u2192', t('menuAlbum'), () => {
                const action = state.actions.onAlbum;
                close();
                action(track.albumId, track.albumTitle ?? '');
              })
              : null,
            item('open', '\u2197', t('menuOpen'), () => {
              close();
              window.open(`https://music.yandex.ru/track/${track.id}`, '_blank', 'noopener');
            }),
            item('copy', '\u29c9', copied ? t('menuCopied') : t('menuCopy'), () => {
              void (async () => {
                try {
                  await navigator.clipboard.writeText(`https://music.yandex.ru/track/${track.id}`);
                  setCopied(true);
                } catch {
                  /* a blocked clipboard leaves the label as it is */
                }
              })();
            }),
          ]),
        document.body,
      );
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
        onContextMenu: (event) => openTrackMenu(event, track, { onArtist: onOpenArtist, onAlbum: onOpenAlbum }),
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
        h(StatusLine, {
          text: data.error !== '' ? data.error : !data.loading && rows.length === 0 ? t('nothingFound') : '',
          error: data.error !== '',
        }),
        data.loading && rows.length === 0 ? h(SkeletonRows, { count: 5 }) : null,
        meta,
        chips.length > 0 ? h('p', { className: 'ym-section' }, t('albumsSection')) : null,
        chips.length > 0 ? h('div', { className: 'ym-strip' }, chips) : null,
        rows.length > 0 ? h('p', { className: 'ym-section' }, t('tracksSection')) : null,
        rows.length > 0 ? h('div', { className: 'ym-results' }, rows) : null,
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
      const [tab, setTab] = React.useState('current');
      const [path, setPath] = React.useState([]);
      const [history, setHistory] = React.useState(() => {
        try {
          const raw = window.localStorage.getItem('dsh-yandex-music.searches');
          const list = raw === null ? [] : JSON.parse(raw);
          return Array.isArray(list) ? list.filter((item) => typeof item === 'string').slice(0, 8) : [];
        } catch {
          return [];
        }
      });
      const [groups, setGroups] = React.useState({ artists: [], albums: [] });
      const state = usePlayer();
      const tabsRef = React.useRef(null);
      const rootRef = React.useRef(null);
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

      /**
       * A new tab must not inherit the previous tab's scroll offset: the pane
       * would stay scrolled into a shorter list and the content would jump.
       */
      React.useEffect(() => {
        const pane = rootRef.current === null ? null : rootRef.current.closest('.ym-card-pane');
        if (pane !== null) pane.scrollTop = 0;
      }, [tab, path]);

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
            // Remember the query once it actually produced something.
            setHistory((previous) => {
              const next = [trimmed, ...previous.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
              try {
                window.localStorage.setItem('dsh-yandex-music.searches', JSON.stringify(next));
              } catch {
                /* a blocked storage simply keeps the list in memory */
              }
              return next;
            });
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
        onContextMenu: (event) => openTrackMenu(event, track, { onArtist: openArtist, onAlbum: openAlbum }),
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

      const searchStatus = error !== ''
        ? error
        : busy
          ? t('searching')
          : flash !== ''
            ? flash
            : !busy && query.trim() !== '' && tracks.length === 0 ? t('nothingFound') : '';

      const searchPane = h('div', { className: 'ym-form' },
        h('div', { className: 'ym-search-wrap' },
          h('input', {
            className: 'ym-input ym-search',
            value: query,
            placeholder: t('searchPlaceholder'),
            autoComplete: 'off',
            spellCheck: false,
            onChange: (event) => setQuery(event.target.value),
          }),
          h('span', {
            className: 'ym-search-status',
            'data-on': searchStatus === '' ? 'false' : 'true',
            'data-error': error !== '' ? 'true' : 'false',
            'aria-live': 'polite',
            title: searchStatus,
          }, searchStatus)),
        query.trim() === '' && history.length > 0
          ? h('div', null,
            h('p', { className: 'ym-section' }, t('recentSearches')),
            h('div', { className: 'ym-chips' }, history.map((item) => h('button', {
              key: item,
              className: 'ym-tab',
              type: 'button',
              style: { flex: 'none', padding: '4px 9px' },
              title: item,
              onClick: () => setQuery(item),
            }, item))))
          : null,
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

      return h('div', { className: 'ym-form', ref: rootRef, style: { '--ym-tabs-h': `${tabsHeight}px` } },
        h('div', { className: 'ym-tabs', ref: tabsRef },
          ...[
            {
              id: 'current',
              label: state.queue.length > 0 ? `${t('tabCurrent')} \u00b7 ${state.queue.length}` : t('tabCurrent'),
            },
            { id: 'playlists', label: t('tabPlaylists') },
            { id: 'wave', label: t('tabWave') },
            { id: 'search', label: t('tabSearch') },
          ].map((item) => h('button', {
            key: item.id,
            className: 'ym-tab',
            type: 'button',
            'data-active': tab === item.id ? 'true' : 'false',
            onClick: () => setTab(item.id),
          }, item.label))),
        h('div', { className: 'ym-pane', 'data-active': tab === 'current' ? 'true' : 'false' },
          h(QueuePane, { t })),
        h('div', { className: 'ym-pane', 'data-active': tab === 'playlists' ? 'true' : 'false' },
          h(PlaylistsPane, { t })),
        h('div', { className: 'ym-pane', 'data-active': tab === 'wave' ? 'true' : 'false' },
          h(WavePane, { t })),
        h('div', { className: 'ym-pane', 'data-active': tab === 'search' ? 'true' : 'false' },
          path.length > 0
            ? h(DetailPane, {
              t,
              entry: path[path.length - 1],
              onBack: goBack,
              onOpenArtist: openArtist,
              onOpenAlbum: openAlbum,
              onAdded: notify,
            })
            : searchPane));
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
    function Marquee({ text, className }) {
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

      const classes = typeof className === 'string' && className !== ''
        ? `${className} ym-mini-title-line`
        : 'ym-mini-title-line';

      return h('span', { className: classes, ref: boxRef },
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
        if (!open) {
          setAccountOpen(false);
          closeTrackMenu();
        }
      }, [open]);

      /** Keyboard transport while the popover is open: space, arrows, M. */
      React.useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event) => {
          if (event.ctrlKey || event.metaKey || event.altKey) return;
          const target = event.target;
          if (target instanceof Element) {
            const tag = target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable === true) return;
          }
          switch (event.key) {
            case ' ':
              event.preventDefault();
              togglePlay();
              break;
            case 'ArrowRight':
              event.preventDefault();
              seekBy(5);
              break;
            case 'ArrowLeft':
              event.preventDefault();
              seekBy(-5);
              break;
            case 'ArrowUp':
              event.preventDefault();
              setVolume((player.muted ? 0 : player.volume) + 0.05);
              break;
            case 'ArrowDown':
              event.preventDefault();
              setVolume((player.muted ? 0 : player.volume) - 0.05);
              break;
            case 'm':
            case 'M':
            case 'ь':
            case 'Ь':
              event.preventDefault();
              toggleMute();
              break;
            default:
              break;
          }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
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
          if (event.key !== 'Escape') return;
          // Escape peels one layer at a time: the lyrics window, then the popover.
          if (player.lyricsOpen) {
            player.lyricsOpen = false;
            emit();
            return;
          }
          setOpen(false);
        };
        const onPointerDown = (event) => {
          const node = buttonRef.current;
          if (node !== null && node.contains(event.target)) return;
          if (event.target instanceof Element && event.target.closest('[data-yandex-music-card],[data-yandex-music-lyrics],[data-yandex-music-menu]') !== null) return;
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

      /**
       * Both windows share one geometry so they stay flush with each other, and
       * the size shrinks on a short screen instead of running off the top.
       */
      const size = Math.max(340, Math.min(CARD_SIZE, window.innerHeight - 24));
      const cardPos = anchor === null
        ? { left: 8, bottom: 8 }
        : {
          left: Math.max(8, Math.min(anchor.left, window.innerWidth - size - 8)),
          bottom: Math.max(8, Math.min(window.innerHeight - anchor.top + 8, window.innerHeight - size - 8)),
        };
      const roomOnTheLeft = cardPos.left - size - 8 >= 8;
      const lyricsPos = {
        left: roomOnTheLeft
          ? cardPos.left - size - 8
          : Math.min(cardPos.left + size + 8, Math.max(8, window.innerWidth - size - 8)),
        bottom: cardPos.bottom,
      };

      const card = open && anchor !== null
        ? ReactDOM.createPortal(
          h('div', {
            className: 'ym-card',
            'data-yandex-music-card': '',
            role: 'dialog',
            'aria-label': t('title'),
            style: { ...cardPos, width: size, height: size },
          },
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
            h('div', { className: 'ym-card-pane' },
              h(Guard, { fallback: h('p', { className: 'ym-error', role: 'alert' }, t('uiFailed')) },
                h(PopoverBody, { t, auth }))),
            h('div', { className: 'ym-card-player' }, h(PlayerBar, { t })))),
          document.body,
        )
        : null;
      const lyrics = open && anchor !== null && playback.lyricsOpen
        ? ReactDOM.createPortal(
          h(Guard, { fallback: null }, h(LyricsCard, { t, style: { ...lyricsPos, width: size, height: size }, onClose: toggleLyrics })),
          document.body,
        )
        : null;
      const menuLayer = open && anchor !== null
        ? h(Guard, { fallback: null }, h(TrackMenu, { t }))
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
            title: current !== null ? `${current.artists} \u2014 ${current.title}` : t('entry'),
            'aria-label': t('entry'),
            'aria-haspopup': 'dialog',
            'aria-expanded': open ? 'true' : 'false',
            onClick: toggle,
          }, h('span', { className: 'ym-entry-icon', 'aria-hidden': 'true' }, h(NoteIcon, { size: 18 }))),
          card,
          lyrics,
          menuLayer);
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
        lyrics,
        menuLayer);
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
