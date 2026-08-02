var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../icon/cp-icon.js';
/**
 * Overflow / kebab menu (R4/R5/R7, design.md §5/§6). The default slot is the
 * trigger — typically a kebab `cp-button` — and clicking it toggles `open`. When
 * open, an absolutely-positioned popup (`role="menu"`, `part="list"`) renders the
 * `items` as `role="menuitem"` buttons (`part="item"`, optional leading
 * `<cp-icon>`). ArrowUp/ArrowDown (plus Home/End) move focus between enabled
 * items; Enter/Space or click selects an item, emitting a bubbling+composed
 * `cp-select` `CustomEvent` with `detail: { id }` and closing. Escape or an
 * outside click closes and emits `cp-close`. Disabled items are inert. The
 * slotted trigger receives `aria-haspopup="menu"` and a reflected
 * `aria-expanded`, and focus returns to it when the popup closes via keyboard.
 */
let CpMenu = class CpMenu extends LitElement {
    constructor() {
        super(...arguments);
        /** Whether the popup is open. */
        this.open = false;
        /** The menu entries rendered top-to-bottom. */
        this.items = [];
        /** Optional accessible name for the popup (`aria-label` on `role="menu"`). */
        this.label = '';
        this.toggle = () => {
            this.open ? this.close(true) : this.openMenu();
        };
        this.handleKeydown = (event) => {
            const buttons = this.itemButtons;
            const current = buttons.findIndex((b) => b.matches(':focus'));
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.focusIndex(this.nextEnabled(current, 1));
                    return;
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
                    this.focusIndex(this.nextEnabled(this.items.length, -1));
                    return;
                case 'Escape':
                    event.preventDefault();
                    this.close(true);
                    this.triggerElement?.focus();
                    return;
                default:
                    return;
            }
        };
        // Close when a pointer press lands outside this element's composed subtree.
        this.handleDocumentPointerDown = (event) => {
            if (!event.composedPath().includes(this)) {
                this.close(true);
            }
        };
    }
    static { this.styles = css `
    :host {
      position: relative;
      display: inline-block;
    }

    .trigger {
      display: inline-flex;
    }

    .menu {
      position: absolute;
      z-index: 10;
      top: calc(100% + var(--cp-spacing-xs, 0.5rem));
      right: 0;
      min-width: 12rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 0;
      padding: var(--cp-spacing-xs, 0.5rem);
      list-style: none;
      background: var(--cp-color-surface-elevated, hsl(0 0% 100%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-md, 0.75rem);
      box-shadow: var(--cp-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
    }

    .item {
      appearance: none;
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      width: 100%;
      padding: var(--cp-spacing-xs, 0.5rem) var(--cp-spacing-sm, 1rem);
      border: none;
      border-radius: var(--cp-radius-sm, 0.5rem);
      background: transparent;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      font-family: inherit;
      font-size: inherit;
      font-weight: 500;
      line-height: 1.2;
      text-align: left;
      cursor: pointer;
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .item:hover:not(:disabled) {
      background: var(--cp-color-surface, hsl(0 0% 98%));
    }

    .item:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: -2px;
    }

    .item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `; }
    /** All rendered menuitem buttons, in `items` order (disabled ones included). */
    get itemButtons() {
        return Array.from(this.renderRoot.querySelectorAll('[role="menuitem"]'));
    }
    /** The slotted trigger element (first assigned element of the default slot). */
    get triggerElement() {
        const slot = this.renderRoot.querySelector('slot');
        const assigned = slot?.assignedElements({ flatten: true }) ?? [];
        const first = assigned[0];
        return first instanceof HTMLElement ? first : undefined;
    }
    openMenu() {
        this.open = true;
    }
    /** Closes the popup; `emitClose` fires `cp-close` (Escape / outside click). */
    close(emitClose) {
        if (!this.open) {
            return;
        }
        this.open = false;
        if (emitClose) {
            this.dispatchEvent(new CustomEvent('cp-close', { bubbles: true, composed: true }));
        }
    }
    select(item) {
        if (item.disabled === true) {
            return;
        }
        this.dispatchEvent(new CustomEvent('cp-select', {
            bubbles: true,
            composed: true,
            detail: { id: item.id },
        }));
        this.close(false);
        this.triggerElement?.focus();
    }
    /** Nearest enabled index from `from` stepping by `dir`, wrapping around. */
    nextEnabled(from, dir) {
        const total = this.items.length;
        for (let step = 1; step <= total; step++) {
            const idx = (((from + dir * step) % total) + total) % total;
            if (this.items[idx]?.disabled !== true) {
                return idx;
            }
        }
        return -1;
    }
    focusIndex(idx) {
        idx === -1 || this.itemButtons[idx]?.focus();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        globalThis.document.removeEventListener('mousedown', this.handleDocumentPointerDown);
    }
    updated(changed) {
        if (changed.has('open')) {
            const trigger = this.triggerElement;
            trigger?.setAttribute('aria-haspopup', 'menu');
            trigger?.setAttribute('aria-expanded', this.open ? 'true' : 'false');
            if (this.open) {
                globalThis.document.addEventListener('mousedown', this.handleDocumentPointerDown);
                this.focusIndex(this.nextEnabled(-1, 1));
            }
            else {
                globalThis.document.removeEventListener('mousedown', this.handleDocumentPointerDown);
            }
        }
    }
    render() {
        return html `
      <span class="trigger" part="trigger" @click=${this.toggle}>
        <slot></slot>
      </span>
      ${this.open
            ? html `<div
            class="menu"
            part="list"
            role="menu"
            aria-label=${this.label || nothing}
            @keydown=${this.handleKeydown}
          >
            ${this.items.map((item) => html `<button
                class="item"
                part="item"
                role="menuitem"
                tabindex="-1"
                ?disabled=${item.disabled === true}
                @click=${() => this.select(item)}
              >
                ${item.icon
                ? html `<cp-icon
                      name=${item.icon}
                      size="18"
                      part="item-icon"
                    ></cp-icon>`
                : nothing}
                <span part="item-label">${item.label}</span>
              </button>`)}
          </div>`
            : nothing}
    `;
    }
};
__decorate([
    property({ type: Boolean })
], CpMenu.prototype, "open", void 0);
__decorate([
    property({ type: Array })
], CpMenu.prototype, "items", void 0);
__decorate([
    property({ type: String })
], CpMenu.prototype, "label", void 0);
CpMenu = __decorate([
    customElement('cp-menu')
], CpMenu);
export { CpMenu };
//# sourceMappingURL=cp-menu.js.map