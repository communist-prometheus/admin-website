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
 * Bordered list row (R4/R5/R7, design.md §5/§6). The horizontal item used by the
 * review queue, deploy log, conflict list and link groups — a bordered container
 * (`part="row"`, `--cp-radius-md`, hairline border), NOT a table row. Layout:
 * a leading icon-circle (`part="icon"`), a content column (`part="content"`
 * holding the `title`, a default/`content` slot for free-form body, and a `meta`
 * line), and a right-aligned `actions` slot (`part="actions"`) for buttons or a
 * `cp-menu`. Purely presentational: interactivity lives in the slotted controls.
 */
let CpListRow = class CpListRow extends LitElement {
    constructor() {
        super(...arguments);
        /** Registered `cp-icon` name for the leading icon-circle. */
        this.icon = '';
        /** Primary row title. */
        this.title = '';
        /** Secondary meta line under the title. */
        this.meta = '';
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .row {
      display: flex;
      align-items: center;
      gap: var(--cp-spacing-sm, 1rem);
      padding: var(--cp-spacing-sm, 1rem) var(--cp-spacing-md, 1.5rem);
      background: var(--cp-color-surface, hsl(0 0% 98%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-md, 0.75rem);
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--cp-radius-lg, 999px);
      background: var(--cp-color-surface-elevated, hsl(0 0% 100%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .title {
      font-weight: 600;
      line-height: 1.3;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .meta {
      font-size: 0.8125rem;
      line-height: 1.3;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }

    slot[name='content']::slotted(*) {
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      line-height: 1.4;
    }

    .actions {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      flex: none;
      margin-left: auto;
    }
  `; }
    render() {
        return html `
      <div class="row" part="row">
        ${this.icon
            ? html `<span class="icon" part="icon">
              <cp-icon name=${this.icon} size="18"></cp-icon>
            </span>`
            : nothing}
        <div class="content" part="content">
          ${this.title
            ? html `<span class="title" part="title">${this.title}</span>`
            : nothing}
          <slot name="content"></slot>
          <slot></slot>
          ${this.meta
            ? html `<span class="meta" part="meta">${this.meta}</span>`
            : nothing}
        </div>
        <span class="actions" part="actions">
          <slot name="actions"></slot>
        </span>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], CpListRow.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], CpListRow.prototype, "title", void 0);
__decorate([
    property({ type: String })
], CpListRow.prototype, "meta", void 0);
CpListRow = __decorate([
    customElement('cp-list-row')
], CpListRow);
export { CpListRow };
//# sourceMappingURL=cp-list-row.js.map