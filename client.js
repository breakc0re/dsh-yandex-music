window.__ModuleLoader__.load({
  id: 'dsh-yandex-music',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'yandexMusic';
    /** Marks the injected stylesheet so a reload replaces it instead of stacking. */
    const STYLE_ID = 'yandex-music';
    /** Popover width in pixels; the card is clamped to the viewport. */
    const CARD_WIDTH = 340;
    /** Host routes owned by this plugin. */
    const API = '/api/plugins/yandex-music';

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
.ym-entry-icon{display:inline-flex;flex:none}
.ym-entry-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-card{position:fixed;z-index:60;box-sizing:border-box;padding:12px;border-radius:12px;background:var(--dsw-alias-bg-base,#1b1b1b);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.1));box-shadow:0 12px 32px rgba(0,0,0,.45);color:var(--dsw-alias-label-primary);font-size:13px}
.ym-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.ym-card-title{font-weight:600}
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
.ym-search{width:100%}
.ym-results{display:flex;flex-direction:column;gap:1px;max-height:230px;overflow-y:auto;margin:8px -4px 0;padding:0 4px}
.ym-result{display:flex;align-items:center;gap:8px;width:100%;padding:5px 6px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}
.ym-result:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-result[data-active="true"]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.ym-result-cover{flex:none;width:32px;height:32px;border-radius:6px;object-fit:cover;background:var(--dsw-alias-bg-l1,rgba(255,255,255,.06))}
.ym-result-text{min-width:0;display:flex;flex-direction:column;gap:1px}
.ym-result-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-result-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px}
.ym-result-time{margin-left:auto;flex:none;color:var(--dsw-alias-label-secondary);font-size:11px;font-variant-numeric:tabular-nums}
.ym-player{margin-top:10px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.1))}
.ym-player-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.ym-player-title{min-width:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ym-badge{flex:none;font-size:10px;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.16));color:var(--dsw-alias-label-secondary)}
.ym-controls{display:flex;align-items:center;gap:6px}
.ym-icon-button{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer}
.ym-icon-button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-icon-button[data-primary="true"]{background:var(--dsw-alias-bg-accent,#3b6fe0);color:#fff}
.ym-seek{flex:1;min-width:0;accent-color:var(--dsw-alias-bg-accent,#3b6fe0)}
.ym-time{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
`;

    /** Inject the plugin stylesheet once; the disposer removes it on teardown. */
    function installStyles() {
      if (typeof document === 'undefined') return () => {};
      if (document.querySelector(`style[data-plugin="${STYLE_ID}"]`) !== null) return () => {};
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
    /* components                                                          */
    /* ------------------------------------------------------------------ */

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

    /** Confirmation-code sign-in: open the page, then type the 7 digits. */
    function LoginScreen({ t, onSignedIn }) {
      const [session, setSession] = React.useState(null);
      const [code, setCode] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState('');

      const start = async () => {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
          const value = await call('auth/start', {});
          setSession(value);
          try {
            window.open(value.url, '_blank', 'noopener');
          } catch {
            /* the link below is the fallback */
          }
        } catch (failure) {
          setError(failure.message || t('errorGeneric'));
        } finally {
          setBusy(false);
        }
      };

      const submit = async (event) => {
        event.preventDefault();
        if (session === null || busy) return;
        setBusy(true);
        setError('');
        try {
          await call('auth/complete', { code: code.trim(), state: session.state });
          await onSignedIn();
        } catch (failure) {
          setError(failure.message || t('errorGeneric'));
        } finally {
          setBusy(false);
        }
      };

      return h('form', { className: 'ym-form', onSubmit: submit },
        h('p', { className: 'ym-hint' }, t('loginHint')),
        h('button', {
          className: 'ym-button',
          type: 'button',
          disabled: busy,
          onClick: start,
        }, session === null ? t('login') : t('openPage')),
        session !== null ? h('a', {
          className: 'ym-link',
          href: session.url,
          target: '_blank',
          rel: 'noreferrer',
        }, session.url) : null,
        h('label', { className: 'ym-field' },
          h('span', { className: 'ym-label' }, t('code')),
          h('input', {
            className: 'ym-input ym-code',
            value: code,
            autoComplete: 'one-time-code',
            spellCheck: false,
            maxLength: 512,
            disabled: session === null,
            onChange: (event) => setCode(event.target.value.trim()),
          })),
        error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, error) : null,
        h('button', {
          className: 'ym-button',
          type: 'submit',
          disabled: busy || session === null || code.trim() === '',
        }, busy ? t('submitting') : t('submit')));
    }

    /** Signed-in summary with a way out. */
    function AccountScreen({ t, status, onSignedOut }) {
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState('');

      const logout = async () => {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
          await call('auth/logout', {});
          await onSignedOut();
        } catch (failure) {
          setError(failure.message || t('errorGeneric'));
        } finally {
          setBusy(false);
        }
      };

      return h('div', { className: 'ym-form' },
        h('p', { className: 'ym-hint' }, `${t('signedIn')} ${status.login !== '' ? status.login : status.uid ?? '—'}`),
        status.plus === false ? h('p', { className: 'ym-hint' }, t('noPlus')) : null,
        error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, error) : null,
        h('button', {
          className: 'ym-button',
          'data-variant': 'ghost',
          type: 'button',
          disabled: busy,
          onClick: logout,
        }, t('logout')));
    }

    /* ------------------------------------------------------------------ */
    /* player                                                              */
    /* ------------------------------------------------------------------ */

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
      listeners: new Set(),
    };

    function emit() {
      for (const listener of player.listeners) listener();
    }

    function subscribe(listener) {
      player.listeners.add(listener);
      return () => {
        player.listeners.delete(listener);
      };
    }

    function ensureAudio() {
      if (player.audio !== null) return player.audio;
      const audio = new Audio();
      audio.preload = 'auto';
      audio.addEventListener('timeupdate', () => {
        player.position = audio.currentTime;
        emit();
      });
      audio.addEventListener('durationchange', () => {
        player.duration = Number.isFinite(audio.duration) ? audio.duration : 0;
        emit();
      });
      audio.addEventListener('play', () => {
        player.playing = true;
        emit();
      });
      audio.addEventListener('pause', () => {
        player.playing = false;
        emit();
      });
      audio.addEventListener('ended', () => {
        void step(1);
      });
      audio.addEventListener('error', () => {
        player.error = 'playback';
        player.playing = false;
        emit();
      });
      player.audio = audio;
      return audio;
    }

    async function playAt(index) {
      if (index < 0 || index >= player.queue.length) return;
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
        const audio = ensureAudio();
        player.preview = value.preview === true;
        audio.src = value.url;
        await audio.play();
      } catch (failure) {
        player.error = failure.message || 'playback';
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
      if (audio.paused) void audio.play();
      else audio.pause();
    }

    function playQueue(tracks, index) {
      player.queue = tracks.slice();
      void playAt(index);
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

    /** Transport controls for the current track. */
    function PlayerBar({ t }) {
      const state = usePlayer();
      const current = state.current;
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
        state.error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, state.error) : null);
    }

    /** Search field, result rows, and the transport for whatever is playing. */
    function SearchScreen({ t, status, onSignedOut }) {
      const [query, setQuery] = React.useState('');
      const [tracks, setTracks] = React.useState([]);
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState('');
      const state = usePlayer();

      React.useEffect(() => {
        const trimmed = query.trim();
        if (trimmed === '') {
          setTracks([]);
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
            setError('');
          } catch (failure) {
            if (cancelled) return;
            setTracks([]);
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

      const rows = tracks.map((track, index) => h('button', {
        key: `${track.id}-${index}`,
        type: 'button',
        className: 'ym-result',
        'data-active': state.current !== null && state.current.id === track.id ? 'true' : 'false',
        onClick: () => playQueue(tracks, index),
      },
      track.cover !== null
        ? h('img', { className: 'ym-result-cover', src: track.cover, alt: '', loading: 'lazy' })
        : h('span', { className: 'ym-result-cover' }),
      h('span', { className: 'ym-result-text' },
        h('span', { className: 'ym-result-title' }, track.title),
        h('span', { className: 'ym-result-sub' }, track.artists)),
      h('span', { className: 'ym-result-time' }, fmtTime(track.durationMs))));

      return h('div', { className: 'ym-form' },
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
        tracks.length > 0 ? h('div', { className: 'ym-results' }, rows) : null,
        h(PlayerBar, { t }),
        h(AccountScreen, { t, status, onSignedOut }));
    }

    /** Auth state machine for the popover body. */
    function PopoverBody({ t }) {
      const [state, setState] = React.useState({ loading: true, status: null, error: '' });

      // `t` is intentionally not a dependency: the locale binding may hand out a
      // fresh function per render, and a fetch loop is worse than a stale label.
      const reload = React.useCallback(async () => {
        try {
          const status = await call('auth/status');
          setState({ loading: false, status, error: '' });
        } catch (failure) {
          setState({ loading: false, status: null, error: failure.message || 'request failed' });
        }
      }, []);

      React.useEffect(() => {
        reload();
      }, [reload]);

      if (state.loading) return h('p', { className: 'ym-hint' }, t('loading'));
      if (state.status === null) {
        return h('div', { className: 'ym-form' },
          h('p', { className: 'ym-error', role: 'alert' }, state.error),
          h('button', { className: 'ym-button', type: 'button', onClick: reload }, t('retry')));
      }
      if (!state.status.configured) return h(SetupScreen, { t, onSaved: reload });
      if (!state.status.authorized) return h(LoginScreen, { t, onSignedIn: reload });
      return h(SearchScreen, { t, status: state.status, onSignedOut: reload });
    }

    /**
     * Footer entry: a full-width row when the sidebar is expanded, an icon-only
     * rail button when collapsed. The popover is portalled so the sidebar's
     * scroll container cannot clip it.
     */
    function MusicEntry({ wide, t }) {
      const [open, setOpen] = React.useState(false);
      const [anchor, setAnchor] = React.useState(null);
      const buttonRef = React.useRef(null);

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

      const card = open && anchor !== null
        ? ReactDOM.createPortal(
          h('div', {
            className: 'ym-card',
            'data-yandex-music-card': '',
            role: 'dialog',
            'aria-label': t('title'),
            style: {
              left: Math.max(8, Math.min(anchor.left, window.innerWidth - CARD_WIDTH - 8)),
              bottom: Math.max(8, window.innerHeight - anchor.top + 8),
              width: CARD_WIDTH,
            },
          },
          h('div', { className: 'ym-card-head' },
            h('span', { className: 'ym-card-title' }, t('title')),
            h('button', {
              type: 'button',
              className: 'ym-card-close',
              'aria-label': t('close'),
              onClick: () => setOpen(false),
            }, '\u00d7')),
          h(PopoverBody, { t })),
          document.body,
        )
        : null;

      return h(React.Fragment, null,
        h('button', {
          ref: buttonRef,
          type: 'button',
          className: 'ym-entry',
          'data-rail': wide ? 'false' : 'true',
          title: wide ? undefined : t('entry'),
          'aria-label': t('entry'),
          'aria-haspopup': 'dialog',
          'aria-expanded': open ? 'true' : 'false',
          onClick: toggle,
        },
        h('span', { className: 'ym-entry-icon', 'aria-hidden': 'true' }, h(NoteIcon, { size: 16 })),
        wide ? h('span', { className: 'ym-entry-label' }, t('entry')) : null),
        card);
    }

    /* ------------------------------------------------------------------ */
    /* plugin                                                              */
    /* ------------------------------------------------------------------ */

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { ru, en }), 'yandex-music: dictionaries');
        ctx.effect(() => installStyles(), 'yandex-music: styles');
        const t = ctx.locale.bind(NS);
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'yandex-music',
          order: 26,
          locale: NS,
          label: () => t('entry'),
        }, MusicEntry));
      },
    };
  },
});
