var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
/**
 * Surface container (R4, design.md §5). Groups related content on the site's
 * elevated surface. `hoverable`/`elevated` keep their original shadow treatment
 * and emit `cp-card-click`. `interactive` promotes the whole card to a single
 * focusable control (tabindex 0, `role="button"`, `:focus-visible` ring, hover
 * lift) that emits a bubbling+composed `cp-click` on click and Enter/Space — the
 * pattern used by the review-queue list items. Named slots (`pill`, `title`,
 * `summary`, `meta`, `actions`) lay out a headed card; the default slot carries
 * free-form body content. Empty named regions collapse after `slotchange`.
 */
let CpCard = class CpCard extends LitElement {
    constructor() {
        super(...arguments);
        /** Original hover-shadow treatment; emits `cp-card-click`. */
        this.hoverable = false;
        /** Raises the card onto a resting shadow. */
        this.elevated = false;
        /**
         * Promotes the card to a single focusable control that emits `cp-click` on
         * pointer and keyboard (Enter/Space) activation, with a hover lift.
         */
        this.interactive = false;
        /** Names of slots currently resolving to no flattened content. */
        this.empties = new Set();
        this.activate = (originalEvent) => {
            if (this.hoverable) {
                this.dispatchEvent(new CustomEvent('cp-card-click', {
                    bubbles: true,
                    composed: true,
                    detail: { originalEvent },
                }));
            }
            if (this.interactive) {
                this.dispatchEvent(new CustomEvent('cp-click', {
                    bubbles: true,
                    composed: true,
                    detail: { originalEvent },
                }));
            }
        };
        this.handleClick = (event) => {
            this.activate(event);
        };
        this.handleKeydown = (event) => {
            if (!this.activatable) {
                return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.activate(event);
            }
        };
        this.handleSlotChange = () => {
            this.syncEmpties();
        };
        // `slotchange` never fires for a slot that stays empty, so emptiness is
        // recomputed from every named slot after the first render and on each change.
        this.syncEmpties = () => {
            const slots = this.shadowRoot?.querySelectorAll('slot[name]');
            const next = new Set();
            slots?.forEach((slot) => {
                if (!(slot instanceof HTMLSlotElement)) {
                    return;
                }
                const hasContent = slot
                    .assignedNodes({ flatten: true })
                    .some((node) => node.nodeType === Node.ELEMENT_NODE ||
                    (node.textContent ?? '').trim().length > 0);
                hasContent || next.add(slot.name);
            });
            this.empties = next;
        };
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--cp-spacing-sm, 1rem);
      background: var(--cp-color-surface, hsl(0, 0%, 98%));
      border: 1px solid var(--cp-color-border, hsl(0, 0%, 88%));
      border-radius: var(--cp-radius-md, 0.75rem);
      padding: var(--cp-spacing-lg, 2rem);
      transition:
        box-shadow var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        transform var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .card:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .card.hoverable:hover {
      box-shadow: var(--cp-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
      cursor: pointer;
    }

    .card.elevated {
      box-shadow: var(--cp-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
    }

    .card.elevated.hoverable:hover {
      box-shadow: var(--cp-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
    }

    .card.interactive {
      cursor: pointer;
    }

    .card.interactive:hover {
      transform: translateY(-2px);
      box-shadow: var(--cp-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
    }

    @media (prefers-reduced-motion: reduce) {
      .card.interactive:hover {
        transform: none;
      }
    }

    [hidden] {
      display: none;
    }

    slot[name='actions'] {
      position: absolute;
      top: var(--cp-spacing-md, 1.5rem);
      right: var(--cp-spacing-md, 1.5rem);
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
    }

    slot[name='pill'] {
      display: flex;
      gap: var(--cp-spacing-xs, 0.5rem);
    }

    slot[name='title'] {
      display: block;
      font-weight: 700;
      font-size: 1.125rem;
      line-height: 1.3;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    slot[name='summary'] {
      display: block;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      line-height: 1.5;
    }

    slot[name='meta'] {
      display: block;
      font-size: 0.8125rem;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      opacity: 0.85;
    }
  `; }
    get activatable() {
        return this.hoverable || this.interactive;
    }
    firstUpdated() {
        this.syncEmpties();
    }
    render() {
        const classes = [
            'card',
            this.hoverable ? 'hoverable' : '',
            this.elevated ? 'elevated' : '',
            this.interactive ? 'interactive' : '',
        ]
            .filter(Boolean)
            .join(' ');
        return html `
      <div
        class="${classes}"
        part="card"
        role=${this.activatable ? 'button' : 'article'}
        tabindex=${this.activatable ? '0' : undefined}
        @click=${this.handleClick}
        @keydown=${this.handleKeydown}
      >
        <slot
          name="actions"
          part="actions"
          ?hidden=${this.empties.has('actions')}
          @slotchange=${this.handleSlotChange}
        ></slot>
        <slot
          name="pill"
          part="pill"
          ?hidden=${this.empties.has('pill')}
          @slotchange=${this.handleSlotChange}
        ></slot>
        <slot
          name="title"
          part="title"
          ?hidden=${this.empties.has('title')}
          @slotchange=${this.handleSlotChange}
        ></slot>
        <slot
          name="summary"
          part="summary"
          ?hidden=${this.empties.has('summary')}
          @slotchange=${this.handleSlotChange}
        ></slot>
        <slot
          name="meta"
          part="meta"
          ?hidden=${this.empties.has('meta')}
          @slotchange=${this.handleSlotChange}
        ></slot>
        <slot part="body"></slot>
      </div>
    `;
    }
};
__decorate([
    property({ type: Boolean })
], CpCard.prototype, "hoverable", void 0);
__decorate([
    property({ type: Boolean })
], CpCard.prototype, "elevated", void 0);
__decorate([
    property({ type: Boolean })
], CpCard.prototype, "interactive", void 0);
__decorate([
    state()
], CpCard.prototype, "empties", void 0);
CpCard = __decorate([
    customElement('cp-card')
], CpCard);
export { CpCard };
//# sourceMappingURL=cp-card.js.map