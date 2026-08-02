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
 * Empty / placeholder state (R4, design.md §5). A centered, muted column that
 * explains why a region has no content and offers a next step. Used both full-
 * screen ("this area isn't designed yet") and inline ("the review queue is
 * empty"). Renders an optional `<cp-icon>` (`part="icon"`), a `title`
 * (`part="title"`), a secondary `hint` (`part="hint"`), then a default slot for
 * an action such as a `<cp-button>`. `role="status"` announces the state to
 * assistive tech without stealing focus.
 */
let CpEmptyState = class CpEmptyState extends LitElement {
    constructor() {
        super(...arguments);
        /** Optional registered icon name shown above the title. */
        this.icon = '';
        /** Primary line explaining the empty state. */
        this.title = '';
        /** Secondary, softer supporting line. */
        this.hint = '';
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: var(--cp-spacing-sm, 1rem);
      padding: var(--cp-spacing-xl, 3rem) var(--cp-spacing-lg, 2rem);
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }

    cp-icon {
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      opacity: 0.7;
    }

    .title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .hint {
      margin: 0;
      max-width: 40ch;
      line-height: 1.5;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }

    slot {
      display: block;
      margin-top: var(--cp-spacing-xs, 0.5rem);
    }
  `; }
    render() {
        return html `
      <div class="empty" part="container" role="status">
        ${this.icon === ''
            ? nothing
            : html `<cp-icon name=${this.icon} size="40" part="icon"></cp-icon>`}
        ${this.title === ''
            ? nothing
            : html `<p class="title" part="title">${this.title}</p>`}
        ${this.hint === ''
            ? nothing
            : html `<p class="hint" part="hint">${this.hint}</p>`}
        <slot></slot>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], CpEmptyState.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], CpEmptyState.prototype, "title", void 0);
__decorate([
    property({ type: String })
], CpEmptyState.prototype, "hint", void 0);
CpEmptyState = __decorate([
    customElement('cp-empty-state')
], CpEmptyState);
export { CpEmptyState };
//# sourceMappingURL=cp-empty-state.js.map