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
 * List chip (R4/R7, design.md §5). Two modes on one primitive:
 *
 * - Default: a filled label chip. When `removable`, a trailing icon-button
 *   (`part="remove"`, accessible-named) emits a bubbling+composed `cp-remove`
 *   and stops propagation so a surrounding chip-list click handler is not also
 *   triggered.
 * - `add`: a ghost/dashed "＋ label" control that emits `cp-add` on click — the
 *   site's "add tag/filter" affordance at the end of a chip list.
 *
 * Decorative marks come from `<cp-icon>`; Unicode glyphs are never used.
 */
let CpChip = class CpChip extends LitElement {
    constructor() {
        super(...arguments);
        /** Visible chip label. */
        this.label = '';
        /** Renders a trailing remove control that emits `cp-remove`. */
        this.removable = false;
        /** Renders the ghost/dashed "＋ label" add control that emits `cp-add`. */
        this.add = false;
        this.handleAdd = (event) => {
            this.dispatchEvent(new CustomEvent('cp-add', {
                bubbles: true,
                composed: true,
                detail: { label: this.label, originalEvent: event },
            }));
        };
        this.handleRemove = (event) => {
            event.stopPropagation();
            this.dispatchEvent(new CustomEvent('cp-remove', {
                bubbles: true,
                composed: true,
                detail: { label: this.label, originalEvent: event },
            }));
        };
    }
    static { this.styles = css `
    :host {
      display: inline-flex;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      background: var(--cp-color-surface, hsl(0 0% 98%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-lg, 1rem);
      padding: var(--cp-spacing-xs, 0.5rem) var(--cp-spacing-sm, 1rem);
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1;
    }

    /* Add mode: a ghost/dashed interactive control. */
    button.chip {
      background: transparent;
      border-style: dashed;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      cursor: pointer;
      transition: color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        border-color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    button.chip:hover {
      color: var(--cp-color-accent, hsl(12 80% 45%));
      border-color: var(--cp-color-accent, hsl(12 80% 45%));
    }

    button.chip:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .label {
      white-space: nowrap;
    }

    .remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      cursor: pointer;
      border-radius: var(--cp-radius-sm, 0.5rem);
      transition: color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .remove:hover {
      color: var(--cp-color-danger, hsl(0 70% 45%));
    }

    .remove:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }
  `; }
    renderAdd() {
        return html `
      <button type="button" class="chip" part="chip" @click=${this.handleAdd}>
        <cp-icon name="plus" size="16" part="icon"></cp-icon>
        <span class="label">${this.label}</span>
      </button>
    `;
    }
    renderLabel() {
        return html `
      <span class="chip" part="chip">
        <span class="label">${this.label}</span>
        ${this.removable
            ? html `<button
              type="button"
              class="remove"
              part="remove"
              aria-label="Remove ${this.label}"
              @click=${this.handleRemove}
            >
              <cp-icon name="x" size="16" part="icon"></cp-icon>
            </button>`
            : nothing}
      </span>
    `;
    }
    render() {
        return this.add ? this.renderAdd() : this.renderLabel();
    }
};
__decorate([
    property({ type: String })
], CpChip.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], CpChip.prototype, "removable", void 0);
__decorate([
    property({ type: Boolean })
], CpChip.prototype, "add", void 0);
CpChip = __decorate([
    customElement('cp-chip')
], CpChip);
export { CpChip };
//# sourceMappingURL=cp-chip.js.map