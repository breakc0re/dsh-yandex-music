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

    /* ------------------------------------------------------------------ */
    /* copy                                                                */
    /* ------------------------------------------------------------------ */

    const ru = {
      entry: 'Яндекс Музыка',
      title: 'Яндекс Музыка',
      placeholder: 'Плеер появится здесь: поиск, очередь и «Моя волна».',
      close: 'Закрыть',
    };

    const en = {
      entry: 'Yandex Music',
      title: 'Yandex Music',
      placeholder: 'The player will appear here: search, queue and My Wave.',
      close: 'Close',
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
.ym-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.ym-card-title{font-weight:600}
.ym-card-close{border:0;background:transparent;color:inherit;cursor:pointer;padding:2px 6px;border-radius:6px;font-size:16px;line-height:1}
.ym-card-close:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ym-card-body{color:var(--dsw-alias-label-secondary);line-height:1.5}
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
          h('div', { className: 'ym-card-body' }, t('placeholder'))),
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
