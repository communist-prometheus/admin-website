import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { navItems, groups, canSee, type AuthState } from './nav.js';
import { screens } from './screens/index.js';
import { createGitStateStore, type GitStateStore, type SyncStatus } from './engine/git-state.js';
import { login, loginWithToken, logout, currentUser } from './engine/auth.js';
import { bootEngine } from './engine/engine-boot.js';

/** One of the four viewport corners the draggable FAB can snap to. */
type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const FAB_SIZE = 56;
const FAB_MARGIN = 16;
const FAB_GAP = 8;
const DRAG_THRESHOLD = 10;
const FAB_STORAGE_KEY = 'fab-corner';
const DEFAULT_CORNER: Corner = 'bottom-right';

const isCorner = (value: string | undefined): value is Corner =>
  value === 'top-left' ||
  value === 'top-right' ||
  value === 'bottom-left' ||
  value === 'bottom-right';

/**
 * The admin app shell (app-shell spec R1–R7): a client-side SPA island that owns
 * the header, role/owner-gated grouped navigation, a History/hash router that
 * swaps screen modules in the content region, a persistent sync-status
 * affordance, and focus management on route change. Built on the design-system
 * primitives; no ad-hoc chrome beyond token-driven layout.
 */
@customElement('app-shell')
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      grid-template-rows: auto 1fr;
      min-height: 100dvh;
      background: var(--color-background);
      color: var(--color-text-primary);
      font-family: var(--font-sans);
      line-height: 1.6;
    }

    header {
      position: sticky;
      top: 0;
      z-index: 10;
      box-sizing: border-box;
      height: var(--app-header-h);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: 0 var(--spacing-md);
      background: var(--color-background);
      border-bottom: 1px solid var(--color-hairline);
    }
    .brand {
      display: inline-flex;
      align-items: center;
      margin-right: auto;
    }
    .brand img {
      height: 34px;
      width: auto;
    }
    .logo-dark {
      display: none;
    }
    :host([data-theme='dark']) .logo-light {
      display: none;
    }
    :host([data-theme='dark']) .logo-dark {
      display: inline;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .icon-btn {
      display: inline-grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-text-primary);
      cursor: pointer;
    }
    .icon-btn:hover {
      background: var(--color-surface);
    }
    .icon-btn:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
    .account {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }
    .auth-hint {
      margin: 0 0 var(--spacing-md);
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      max-width: 32rem;
    }
    .auth-error {
      margin: var(--spacing-sm) 0 0;
      font-size: 0.85rem;
      color: var(--danger, hsl(0 72% 45%));
    }
    .auth-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .body {
      display: grid;
      grid-template-columns: 1fr;
    }
    @media (min-width: 768px) {
      .body.has-nav {
        grid-template-columns: 15rem minmax(0, 1fr);
      }
    }
    /* Compact header on mobile: keep the sync dot, drop the long label + login. */
    @media (max-width: 767px) {
      .header-right cp-status,
      .account {
        display: none;
      }
    }

    /* Desktop: persistent rail. On mobile it is replaced by the FAB menu. */
    .body > nav {
      padding: var(--spacing-md);
      border-right: 1px solid var(--color-hairline);
    }
    @media (max-width: 767px) {
      .body > nav {
        display: none;
      }
    }

    /* Draggable FAB flying menu (<768px only). */
    .fab-menu {
      display: contents;
    }
    @media (min-width: 768px) {
      .fab-menu {
        display: none;
      }
    }
    .mobile-fab {
      position: fixed;
      z-index: 200;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--color-accent);
      color: var(--color-on-accent);
      border: none;
      cursor: pointer;
      touch-action: none;
      padding: 0;
      box-shadow: var(--shadow-md);
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .mobile-fab:active {
      transform: scale(0.92);
      box-shadow: var(--shadow-sm);
    }
    .mobile-fab:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
    .fab-line {
      position: absolute;
      left: 50%;
      width: 24px;
      height: 2px;
      background: var(--color-on-accent);
      border-radius: 1px;
      transform: translateX(-50%);
      transition: top var(--transition-base), bottom var(--transition-base),
        transform var(--transition-base), opacity var(--transition-base);
    }
    .fab-line-1 {
      top: 35%;
    }
    .fab-line-2 {
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .fab-line-3 {
      bottom: 35%;
    }
    .fab-menu.open .fab-line-1 {
      top: 50%;
      transform: translate(-50%) rotate(45deg);
    }
    .fab-menu.open .fab-line-2 {
      opacity: 0;
    }
    .fab-menu.open .fab-line-3 {
      bottom: 50%;
      transform: translate(-50%, 50%) rotate(-45deg);
    }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgb(0 0 0 / 0.4);
      z-index: 199;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transition: opacity var(--transition-base), visibility var(--transition-base);
    }
    .fab-menu.open .overlay {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }
    .popup {
      position: fixed;
      z-index: 201;
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: clamp(0.5rem, 2vw, 0.75rem);
      box-shadow: var(--shadow-lg);
      min-width: 220px;
      opacity: 0;
      transform: scale(0.95);
      pointer-events: none;
      visibility: hidden;
      transition: opacity var(--transition-base), transform var(--transition-base),
        visibility var(--transition-base);
    }
    .fab-menu.open .popup {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
      visibility: visible;
    }
    .group + .group {
      margin-top: var(--spacing-md);
    }
    .group-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-secondary);
      margin: 0 0 0.4rem 0.6rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.55rem 0.6rem;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-text-primary);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .nav-link:hover {
      background: var(--color-surface);
    }
    .nav-link:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
    .nav-link[aria-current='page'] {
      background: var(--accent-bg);
      color: var(--color-accent);
      font-weight: 600;
    }

    main {
      min-width: 0;
      padding: var(--spacing-lg) var(--spacing-md) var(--spacing-2xl);
      max-width: 60rem;
    }
    header {
      min-width: 0;
    }
    .brand {
      flex-shrink: 0;
    }
    .screen-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
    }
    .screen-head h1 {
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      margin: 0;
      margin-right: auto;
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .screen-head h1:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 4px;
    }
    .eyebrow {
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .card-grid {
      display: grid;
      gap: var(--spacing-md);
      grid-template-columns: 1fr;
    }
    @media (min-width: 640px) {
      .card-grid {
        grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
      }
    }
    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .form-stack {
      display: grid;
      gap: var(--spacing-md);
      max-width: 32rem;
      margin-top: var(--spacing-md);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
  `;

  /** Current route id (nav item id). */
  @state() private route = 'articles';

  /** Active theme; seeds the header toggle icon + circular reveal direction. */
  @state() private theme: 'light' | 'dark' = 'light';

  /** Mobile FAB flying-menu open state. */
  @state() private fabOpen = false;

  /** Corner the FAB is docked to; persisted under localStorage['fab-corner']. */
  @state() private fabCorner: Corner = DEFAULT_CORNER;

  /** Live FAB position (px) — driven by drag + corner settling. */
  @state() private fabX = 0;
  @state() private fabY = 0;

  /** Whether the FAB should animate to its position (off while dragging). */
  @state() private fabAnimate = false;

  /** Imperative handle to the FAB button for pointer capture + focus return. */
  private readonly fabRef = createRef<HTMLButtonElement>();

  /** Transient drag bookkeeping (non-reactive). */
  private dragging = false;
  private movedPastThreshold = false;
  private dragStartX = 0;
  private dragStartY = 0;

  /**
   * The session as the nav gating consumes it, derived from the real login —
   * `undefined` when signed out (so the menu is empty and screens are gated).
   * Every signed-in maintainer currently gets the full admin/owner surface;
   * finer role resolution is owned by the auth/RBAC spec.
   */
  private get auth(): AuthState | undefined {
    return this.account === undefined
      ? undefined
      : { role: 'admin', owner: true, login: this.account };
  }

  /** Live git-engine state store; drives the header sync-status affordance. */
  private store?: GitStateStore;

  /** Derived sync-status descriptor (design-system tone + label). */
  @state() private sync: SyncStatus = { tone: 'success', label: 'синхронизировано' };

  /** Signed-in GitHub login, or undefined when signed out. */
  @state() private account?: string;

  /** True once the initial session check has completed (gates first paint). */
  @state() private authChecked = false;

  /** True while a login attempt is in flight. */
  @state() private loggingIn = false;

  /** Whether the login dialog is open. */
  @state() private authOpen = false;

  /** Last login error message, if any. */
  @state() private authError?: string;

  /** The token typed into the login dialog. */
  @state() private authToken = '';

  override connectedCallback(): void {
    super.connectedCallback();
    const theme = document.documentElement.dataset.theme;
    if (theme) this.setAttribute('data-theme', theme);
    this.theme = theme === 'dark' ? 'dark' : 'light';
    this.fabCorner = this.loadCorner();
    const pos = this.cornerToFabXY(this.fabCorner);
    this.fabX = pos.x;
    this.fabY = pos.y;
    this.store = createGitStateStore();
    this.store.subscribe(() => (this.sync = this.store?.syncStatus() ?? this.sync));
    this.sync = this.store.syncStatus();
    void this.resolveAccount();
    this.syncRoute();
    globalThis.addEventListener('hashchange', this.syncRoute);
    globalThis.addEventListener('keydown', this.onKeydown);
    globalThis.addEventListener('resize', this.onResize);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    globalThis.removeEventListener('hashchange', this.syncRoute);
    globalThis.removeEventListener('keydown', this.onKeydown);
    globalThis.removeEventListener('resize', this.onResize);
    this.store?.dispose();
  }

  private syncRoute = (): void => {
    const id = window.location.hash.replace(/^#\/?/, '');
    this.route = id in screens ? id : 'articles';
    this.fabOpen = false;
    this.updateComplete.then(() => this.focusScreen());
  };

  /**
   * Moves focus into the content region on route change (R4/R7). Prefers the
   * screen's `<h1>` when it lives in the shell's shadow tree; for self-contained
   * screen elements (own shadow root) it falls back to focusing `<main>`, which
   * the `aria-live` region announces.
   */
  private focusScreen(): void {
    const target =
      this.renderRoot.querySelector<HTMLElement>('main h1') ??
      this.renderRoot.querySelector<HTMLElement>('main');
    target?.focus();
  }

  private navigate(id: string): void {
    window.location.hash = `/${id}`;
  }

  /**
   * Theme toggle with the public-site circular reveal: seeds --x/--y/--r on
   * <html> from the click point + farthest-corner distance, then swaps the
   * theme inside a typed view transition. Falls back to a plain apply when
   * view transitions are unavailable or motion is reduced.
   */
  private toggleTheme(event: MouseEvent): void {
    const root = document.documentElement;
    const next = this.theme === 'dark' ? 'light' : 'dark';
    const applyTheme = (): void => {
      this.theme = next;
      root.dataset.theme = next;
      this.setAttribute('data-theme', next);
      localStorage.setItem('cp-theme', next);
    };
    const reduce = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('startViewTransition' in document) || reduce) {
      applyTheme();
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, globalThis.innerWidth - x),
      Math.max(y, globalThis.innerHeight - y),
    );
    root.style.setProperty('--x', `${x}px`);
    root.style.setProperty('--y', `${y}px`);
    root.style.setProperty('--r', `${endRadius}px`);
    document.startViewTransition({ update: applyTheme, types: ['theme'] });
  }

  /** Reads the persisted FAB corner, defaulting when absent or invalid. */
  private loadCorner(): Corner {
    const stored = localStorage.getItem(FAB_STORAGE_KEY) ?? undefined;
    return isCorner(stored) ? stored : DEFAULT_CORNER;
  }

  /** Top-left FAB position (px) for a docked corner. */
  private cornerToFabXY(corner: Corner): { readonly x: number; readonly y: number } {
    const right = globalThis.innerWidth - FAB_SIZE - FAB_MARGIN;
    const bottom = globalThis.innerHeight - FAB_SIZE - FAB_MARGIN;
    const map: Record<Corner, { readonly x: number; readonly y: number }> = {
      'top-left': { x: FAB_MARGIN, y: FAB_MARGIN },
      'top-right': { x: right, y: FAB_MARGIN },
      'bottom-left': { x: FAB_MARGIN, y: bottom },
      'bottom-right': { x: right, y: bottom },
    };
    return map[corner];
  }

  /** Nearest corner to a viewport point. */
  private snapToCorner(x: number, y: number): Corner {
    const isRight = x > globalThis.innerWidth / 2;
    const isBottom = y > globalThis.innerHeight / 2;
    return `${isBottom ? 'bottom' : 'top'}-${isRight ? 'right' : 'left'}`;
  }

  /** Docks the FAB to a corner with an animated settle. */
  private settleToCorner(corner: Corner): void {
    this.fabCorner = corner;
    const pos = this.cornerToFabXY(corner);
    this.fabAnimate = true;
    this.fabX = pos.x;
    this.fabY = pos.y;
  }

  private openFab(): void {
    this.fabOpen = true;
    this.updateComplete.then(() =>
      this.renderRoot.querySelector<HTMLButtonElement>('.popup .nav-link')?.focus(),
    );
  }

  private closeFab(): void {
    if (!this.fabOpen) return;
    this.fabOpen = false;
    this.fabRef.value?.focus();
  }

  private onFabPointerDown = (event: PointerEvent): void => {
    this.dragging = true;
    this.movedPastThreshold = false;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.fabRef.value?.setPointerCapture(event.pointerId);
  };

  private onFabPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) this.movedPastThreshold = true;
    const base = this.cornerToFabXY(this.fabCorner);
    this.fabAnimate = false;
    this.fabX = base.x + dx;
    this.fabY = base.y + dy;
  };

  private onFabPointerUp = (event: PointerEvent): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.fabRef.value?.releasePointerCapture(event.pointerId);
    if (this.movedPastThreshold) {
      const next = this.snapToCorner(event.clientX, event.clientY);
      localStorage.setItem(FAB_STORAGE_KEY, next);
      this.settleToCorner(next);
      return;
    }
    this.fabOpen ? this.closeFab() : this.openFab();
  };

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.fabOpen) this.closeFab();
  };

  private onResize = (): void => {
    const pos = this.cornerToFabXY(this.fabCorner);
    this.fabAnimate = false;
    this.fabX = pos.x;
    this.fabY = pos.y;
  };

  /** Grouped, role-gated nav items — shared by the desktop rail + FAB popup. */
  private renderNavItems() {
    const auth = this.auth;
    if (auth === undefined) return nothing;
    const visible = navItems.filter((item) => canSee(item, auth));
    return groups.map(([key, label]) => {
      const items = visible.filter((item) => item.group === key);
      return items.length === 0
        ? nothing
        : html`
            <div class="group">
              <p class="group-label">${label}</p>
              ${items.map(
                (item) => html`
                  <button
                    class="nav-link"
                    aria-current=${this.route === item.id ? 'page' : nothing}
                    @click=${() => this.navigate(item.id)}
                  >
                    <cp-icon name=${item.icon} size="18"></cp-icon>
                    <span>${item.label}</span>
                    ${item.ownerOnly
                      ? html`<cp-tag tone="warning" style="margin-inline-start:auto">владелец</cp-tag>`
                      : nothing}
                  </button>
                `,
              )}
            </div>
          `;
    });
  }

  private renderRailNav() {
    return html`<nav aria-label="Основная навигация">${this.renderNavItems()}</nav>`;
  }

  /** The draggable FAB flying menu (<768px only). */
  private renderFabMenu() {
    const fabStyle = `left:${this.fabX}px;top:${this.fabY}px;transition:${
      this.fabAnimate ? 'all var(--transition-base)' : 'none'
    }`;
    const isRight = this.fabCorner.endsWith('right');
    const isBottom = this.fabCorner.startsWith('bottom');
    const offset = `${FAB_MARGIN + FAB_SIZE + FAB_GAP}px`;
    const popupStyle = `left:${isRight ? 'auto' : `${FAB_MARGIN}px`};right:${
      isRight ? `${FAB_MARGIN}px` : 'auto'
    };top:${isBottom ? 'auto' : offset};bottom:${isBottom ? offset : 'auto'}`;
    return html`
      <div class="fab-menu ${this.fabOpen ? 'open' : ''}">
        <button
          ${ref(this.fabRef)}
          class="mobile-fab"
          style=${fabStyle}
          aria-label="Меню"
          aria-expanded=${this.fabOpen ? 'true' : 'false'}
          aria-controls="mobile-nav-panel"
          @pointerdown=${this.onFabPointerDown}
          @pointermove=${this.onFabPointerMove}
          @pointerup=${this.onFabPointerUp}
        >
          <span class="fab-line fab-line-1"></span>
          <span class="fab-line fab-line-2"></span>
          <span class="fab-line fab-line-3"></span>
        </button>
        <div class="overlay" aria-hidden="true" @click=${() => this.closeFab()}></div>
        <nav
          id="mobile-nav-panel"
          class="popup"
          style=${popupStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Основная навигация"
        >
          ${this.renderNavItems()}
        </nav>
      </div>
    `;
  }

  /** Resolves an existing session on load (populates the account name). */
  private async resolveAccount(): Promise<void> {
    try {
      const user = await currentUser();
      this.account = user?.username;
    } finally {
      // Gate the first paint until the session is known, so a logged-in reload
      // does not flash the signed-out prompt before the app (a big layout shift).
      this.authChecked = true;
    }
  }

  /** Finishes a successful login: records the account, boots the engine, closes. */
  private async onSignedIn(username: string, token: string): Promise<void> {
    this.account = username;
    this.authOpen = false;
    this.authError = undefined;
    await bootEngine(token);
  }

  /** Runs the GitHub OAuth login, surfacing the concrete failure if any. */
  private async handleLogin(): Promise<void> {
    this.loggingIn = true;
    this.authError = undefined;
    let concrete: string | undefined;
    const user = await login((message) => (concrete = message));
    this.loggingIn = false;
    user === undefined
      ? (this.authError = concrete ?? 'Вход через GitHub не завершён (окно закрыто до ответа).')
      : void this.onSignedIn(user.username, user.accessToken);
  }

  /** Bypass login with a pasted token (stable, no OAuth). */
  private async handleTokenLogin(token: string): Promise<void> {
    this.loggingIn = true;
    const user = await loginWithToken(token);
    this.loggingIn = false;
    user === undefined
      ? (this.authError = 'Токен отклонён. Нужен GitHub PAT с доступом к репозиториям.')
      : void this.onSignedIn(user.username, token.trim());
  }

  /** Signs out and reloads to a clean, signed-out state. */
  private handleLogout(): void {
    logout();
    globalThis.location.reload();
  }

  /** Renders the login dialog (token bypass + GitHub OAuth). */
  private renderAuthDialog() {
    return html`
      <cp-dialog
        ?open=${this.authOpen}
        heading="Вход в админку"
        ?busy=${this.loggingIn}
        @cp-cancel=${() => (this.authOpen = false)}
      >
        <p class="auth-hint">
          Вставьте GitHub-токен (fine-grained PAT с доступом Contents к репозиторию контента) —
          самый стабильный способ. Или войдите через GitHub.
        </p>
        <cp-input
          label="GitHub-токен (PAT)"
          type="password"
          .value=${this.authToken}
          @cp-input=${(event: CustomEvent<{ value: string }>) =>
            (this.authToken = event.detail.value)}
        ></cp-input>
        ${this.authError ? html`<p class="auth-error">${this.authError}</p>` : nothing}
        <div slot="footer" class="auth-actions">
          <cp-button variant="secondary" @cp-click=${() => this.handleLogin()}
            >Войти через GitHub</cp-button
          >
          <cp-button arrow ?loading=${this.loggingIn} @cp-click=${() => this.handleTokenLogin(this.authToken)}
            >Войти по токену</cp-button
          >
        </div>
      </cp-dialog>
    `;
  }

  override render() {
    const screen = screens[this.route];
    return html`
      <header>
        <a class="brand" href="#/articles" aria-label="Коммунистический Прометей — на главную">
          <img class="logo-light" src="/logo-light.svg" alt="" />
          <img class="logo-dark" src="/logo-dark.svg" alt="" />
        </a>
        <div class="header-right">
          <cp-status state=${this.sync.tone} label=${this.sync.label}></cp-status>
          ${this.account
            ? html`<span class="account">${this.account}</span>
                <cp-button variant="ghost" size="sm" @cp-click=${() => this.handleLogout()}
                  >Выйти</cp-button
                >`
            : html`<cp-button size="sm" @cp-click=${() => (this.authOpen = true)}
                >Войти</cp-button
              >`}
          <button
            class="icon-btn"
            aria-label="Переключить тему"
            @click=${(event: MouseEvent) => this.toggleTheme(event)}
          >
            <cp-icon name=${this.theme === 'dark' ? 'sun' : 'moon'}></cp-icon>
          </button>
        </div>
      </header>
      <div class="body ${this.signedIn ? 'has-nav' : ''}">
        ${this.signedIn ? this.renderRailNav() : nothing}
        <main tabindex="-1" aria-live="polite">
          ${!this.authChecked
            ? this.renderChecking()
            : this.signedIn
              ? screen
                ? screen.render()
                : nothing
              : this.renderSignedOut()}
        </main>
      </div>
      ${this.signedIn ? this.renderFabMenu() : nothing} ${this.renderAuthDialog()}
    `;
  }

  /** True only once the session is confirmed present. */
  private get signedIn(): boolean {
    return this.authChecked && this.account !== undefined;
  }

  /** Neutral placeholder shown while the session is being resolved (no flash). */
  private renderChecking() {
    return html`<p class="auth-hint" style="padding-top:var(--spacing-md)">Загрузка…</p>`;
  }

  /** Content-area placeholder shown until a session exists (no repo data leaks). */
  private renderSignedOut() {
    return html`
      <div class="screen-head">
        <p class="eyebrow">Доступ</p>
        <h1 tabindex="-1">Войдите в админку</h1>
      </div>
      <p class="auth-hint">
        Управление контентом доступно после входа через GitHub. До входа данные репозитория не
        загружаются.
      </p>
      <div class="form-actions" style="justify-content:flex-start">
        <cp-button arrow @cp-click=${() => (this.authOpen = true)}>Войти</cp-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
