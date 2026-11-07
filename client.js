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
      logout: 'Выйти',
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
      logout: 'Sign out',
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
        error !== '' ? h('p', { className: 'ym-error', role: 'alert' }, error) : null,
        h('button', {
          className: 'ym-button',
          'data-variant': 'ghost',
          type: 'button',
          disabled: busy,
          onClick: logout,
        }, t('logout')));
    }

    /** Auth state machine for the popover body. */
    function AuthBody({ t }) {
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
      return h(AccountScreen, { t, status: state.status, onSignedOut: reload });
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
          h(AuthBody, { t })),
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
