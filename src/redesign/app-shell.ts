import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { navItems, groups, canSee, type AuthState } from './nav.js';
import { screens } from './screens/index.js';
import { createGitStateStore, type GitStateStore, type SyncStatus } from './engine/git-state.js';

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
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: 0.7rem var(--spacing-md);
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

    .body {
      display: grid;
      grid-template-columns: 1fr;
    }
    @media (min-width: 768px) {
      .body {
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

    nav {
      padding: var(--spacing-md);
      border-right: 1px solid var(--color-hairline);
    }
    .nav-toggle {
      display: inline-flex;
    }
    /* Mobile: nav is an overlay drawer, hidden unless opened. */
    @media (max-width: 767px) {
      nav {
        position: fixed;
        inset: 3.6rem 0 auto 0;
        z-index: 9;
        display: none;
        background: var(--color-background);
        border-right: none;
        border-bottom: 1px solid var(--color-hairline);
      }
      :host([nav-open]) nav {
        display: block;
      }
    }
    /* Desktop: persistent rail, no toggle. */
    @media (min-width: 768px) {
      .nav-toggle {
        display: none;
      }
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

  /** Mobile nav drawer open state; reflected so CSS can show the drawer. */
  @property({ type: Boolean, reflect: true, attribute: 'nav-open' }) navOpen = false;

  /** Mock session for the local preview — replaced by real auth later. */
  private auth: AuthState = { role: 'admin', owner: true, login: 'undeadliner' };

  /** Live git-engine state store; drives the header sync-status affordance. */
  private store?: GitStateStore;

  /** Derived sync-status descriptor (design-system tone + label). */
  @state() private sync: SyncStatus = { tone: 'success', label: 'синхронизировано' };

  override connectedCallback(): void {
    super.connectedCallback();
    const theme = document.documentElement.getAttribute('data-theme');
    theme && this.setAttribute('data-theme', theme);
    this.store = createGitStateStore();
    this.store.subscribe(() => (this.sync = this.store?.syncStatus() ?? this.sync));
    this.sync = this.store.syncStatus();
    this.syncRoute();
    window.addEventListener('hashchange', this.syncRoute);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.syncRoute);
    this.store?.dispose();
  }

  private syncRoute = (): void => {
    const id = window.location.hash.replace(/^#\/?/, '');
    this.route = id in screens ? id : 'articles';
    this.navOpen = false;
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

  private toggleTheme(): void {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const apply = (): void => {
      root.setAttribute('data-theme', next);
      this.setAttribute('data-theme', next);
      localStorage.setItem('cp-theme', next);
    };
    'startViewTransition' in document && !matchMedia('(prefers-reduced-motion: reduce)').matches
      ? document.startViewTransition(apply)
      : apply();
  }

  private renderNav() {
    const visible = navItems.filter((item) => canSee(item, this.auth));
    return html`
      <nav aria-label="Основная навигация">
        ${groups.map(([key, label]) => {
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
        })}
      </nav>
    `;
  }

  override render() {
    const screen = screens[this.route];
    return html`
      <header>
        <button
          class="icon-btn nav-toggle"
          aria-label="Меню"
          aria-expanded=${this.navOpen ? 'true' : 'false'}
          @click=${() => (this.navOpen = !this.navOpen)}
        >
          <cp-icon name="more"></cp-icon>
        </button>
        <a class="brand" href="#/articles" aria-label="Коммунистический Прометей — на главную">
          <img class="logo-light" src="/logo-light.svg" alt="" />
          <img class="logo-dark" src="/logo-dark.svg" alt="" />
        </a>
        <div class="header-right">
          <cp-status state=${this.sync.tone} label=${this.sync.label}></cp-status>
          <span class="account">${this.auth.login}</span>
          <button class="icon-btn" aria-label="Переключить тему" @click=${() => this.toggleTheme()}>
            <cp-icon name="sun"></cp-icon>
          </button>
        </div>
      </header>
      <div class="body">
        ${this.renderNav()}
        <main tabindex="-1" aria-live="polite">${screen ? screen.render() : nothing}</main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
