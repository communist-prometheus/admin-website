var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
/**
 * Rounded-rectangle segmented tabs (R4, design.md §5). Mirrors the public site's
 * category filter: the active segment is a SOLID accent fill (not a tinted pill),
 * inactive segments are transparent with secondary text and a subtle surface
 * hover. Renders an ARIA `tablist` of `tab` buttons with roving `tabindex`,
 * ArrowLeft/ArrowRight focus movement, Home/End, and Enter/Space activation.
 * Selecting an enabled tab updates `active` and emits a bubbling+composed
 * `cp-tab-change` `CustomEvent` with `detail: { id }`; disabled tabs are inert.
 */
let CpTabs = class CpTabs extends LitElement {
    constructor() {
        super(...arguments);
        /** The tab definitions rendered left-to-right. */
        this.tabs = [];
        /** The active tab id. */
        this.active = '';
        this.handleKeydown = (event) => {
            const buttons = this.tabButtons;
            const current = buttons.findIndex((b) => b.matches(':focus'));
            if (current === -1) {
                return;
            }
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    this.focusIndex(this.nextEnabled(current, 1));
                    return;
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    this.focusIndex(this.nextEnabled(current, -1));
                    return;
                case 'Home':
                    event.preventDefault();
                    this.focusIndex(this.nextEnabled(-1, 1));
                    return;
                case 'End':
                    event.preventDefault();
                    this.focusIndex(this.nextEnabled(this.tabs.length, -1));
                    return;
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    const tab = this.tabs[current];
                    tab === undefined || this.selectTab(tab);
                    return;
                }
                default:
                    return;
            }
        };
    }
    static { this.styles = css `
    :host {
      display: inline-block;
    }

    .list {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      padding: var(--cp-spacing-xs, 0.5rem);
      background: var(--cp-color-surface, hsl(0 0% 98%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-lg, 1rem);
    }

    .tab {
      appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--cp-spacing-xs, 0.5rem) var(--cp-spacing-md, 1.5rem);
      border: none;
      border-radius: var(--cp-radius-md, 0.75rem);
      background: transparent;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      font-family: inherit;
      font-size: inherit;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .tab:hover:not(.active):not(:disabled) {
      background: var(--cp-color-surface-elevated, hsl(0 0% 100%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .tab.active {
      background: var(--cp-color-accent, hsl(12 80% 45%));
      color: var(--cp-color-on-accent, #fff);
    }

    .tab.active:hover:not(:disabled) {
      background: var(--cp-color-accent-hover, hsl(12 80% 38%));
    }

    .tab:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .tab:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `; }
    /** All rendered tab buttons, in `tabs` order (disabled ones included). */
    get tabButtons() {
        return Array.from(this.renderRoot.querySelectorAll('[role="tab"]'));
    }
    /** The id that carries `tabindex="0"`: active-if-enabled, else first enabled. */
    focusableId() {
        const active = this.tabs.find((t) => t.id === this.active && t.disabled !== true);
        const first = this.tabs.find((t) => t.disabled !== true);
        return (active ?? first)?.id;
    }
    /** Nearest enabled index from `from` stepping by `dir`, wrapping around. */
    nextEnabled(from, dir) {
        const total = this.tabs.length;
        for (let step = 1; step <= total; step++) {
            const idx = (((from + dir * step) % total) + total) % total;
            if (this.tabs[idx]?.disabled !== true) {
                return idx;
            }
        }
        return -1;
    }
    focusIndex(idx) {
        idx === -1 || this.tabButtons[idx]?.focus();
    }
    selectTab(tab) {
        if (tab.disabled === true) {
            return;
        }
        this.active = tab.id;
        this.dispatchEvent(new CustomEvent('cp-tab-change', {
            bubbles: true,
            composed: true,
            detail: { id: tab.id },
        }));
    }
    render() {
        const focusable = this.focusableId();
        return html `
      <div class="list" role="tablist" part="list" @keydown=${this.handleKeydown}>
        ${this.tabs.map((tab) => {
            const selected = tab.id === this.active;
            return html `<button
            class="tab ${selected ? 'active' : ''}"
            part="tab"
            role="tab"
            aria-selected=${selected ? 'true' : 'false'}
            tabindex=${tab.id === focusable ? 0 : -1}
            ?disabled=${tab.disabled === true}
            @click=${() => this.selectTab(tab)}
          >
            ${tab.label}
          </button>`;
        })}
      </div>
    `;
    }
};
__decorate([
    property({ type: Array })
], CpTabs.prototype, "tabs", void 0);
__decorate([
    property({ type: String })
], CpTabs.prototype, "active", void 0);
CpTabs = __decorate([
    customElement('cp-tabs')
], CpTabs);
export { CpTabs };
//# sourceMappingURL=cp-tabs.js.map