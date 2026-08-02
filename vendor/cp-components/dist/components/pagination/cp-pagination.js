var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../icon/cp-icon.js';
/** Clamps a page into the valid `1..pages` range. */
const clampPage = (page, pages) => Math.min(Math.max(1, Math.trunc(page)), Math.max(1, Math.trunc(pages)));
/** Builds the ascending page-number list `[1..pages]`. */
const pageList = (pages) => Array.from({ length: Math.max(1, Math.trunc(pages)) }, (_, index) => index + 1);
/**
 * Pagination control (R4/R5, design.md §5). A `<nav>` landmark holding a prev
 * icon-button, the numbered `part="list"` of `part="item"` page buttons, and a
 * next icon-button. The active page is marked `aria-current="page"`; prev/next
 * disable themselves at the first/last page. Any activation emits a `cp-page`
 * event carrying the requested `{ page }`, leaving the owner to update `page`
 * (the control is fully controlled).
 *
 * Theming flows through bridged `--cp-*` tokens (design.md §2) with literal
 * fallbacks so the element renders standalone.
 */
let CpPagination = class CpPagination extends LitElement {
    constructor() {
        super(...arguments);
        /** Active page (1-based, controlled). */
        this.page = 1;
        /** Total number of pages. */
        this.pages = 1;
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    nav {
      display: flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      flex-wrap: wrap;
    }

    ol {
      display: flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.25rem;
      min-height: 2.25rem;
      padding: 0 var(--cp-spacing-xs, 0.5rem);
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-sm, 0.5rem);
      background: var(--cp-color-surface, hsl(0 0% 98%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      font-family: inherit;
      font-size: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    button:hover:not(:disabled) {
      filter: brightness(0.97);
    }

    button:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button[aria-current='page'] {
      background: var(--cp-color-accent, hsl(12 80% 45%));
      color: var(--cp-color-on-accent, #fff);
      border-color: var(--cp-color-accent, hsl(12 80% 45%));
      cursor: default;
    }

    .prev cp-icon {
      transform: rotate(180deg);
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }
    }
  `; }
    emitPage(page) {
        const target = clampPage(page, this.pages);
        if (target === clampPage(this.page, this.pages))
            return;
        this.dispatchEvent(new CustomEvent('cp-page', {
            bubbles: true,
            composed: true,
            detail: { page: target },
        }));
    }
    renderStep(direction) {
        const current = clampPage(this.page, this.pages);
        const isPrev = direction === 'prev';
        const disabled = isPrev ? current <= 1 : current >= Math.max(1, Math.trunc(this.pages));
        return html `<button
      part=${direction}
      class=${direction}
      aria-label=${isPrev ? 'Previous page' : 'Next page'}
      ?disabled=${disabled}
      @click=${() => this.emitPage(current + (isPrev ? -1 : 1))}
    >
      <cp-icon name="chevron-right" size="18"></cp-icon>
    </button>`;
    }
    render() {
        const current = clampPage(this.page, this.pages);
        return html `
      <nav part="nav" aria-label="Pagination">
        ${this.renderStep('prev')}
        <ol part="list">
          ${pageList(this.pages).map((page) => {
            const isCurrent = page === current;
            return html `<li>
              <button
                part="item"
                aria-current=${isCurrent ? 'page' : nothing}
                aria-label=${`Page ${page}`}
                ?disabled=${isCurrent}
                @click=${() => this.emitPage(page)}
              >
                ${page}
              </button>
            </li>`;
        })}
        </ol>
        ${this.renderStep('next')}
      </nav>
    `;
    }
};
__decorate([
    property({ type: Number })
], CpPagination.prototype, "page", void 0);
__decorate([
    property({ type: Number })
], CpPagination.prototype, "pages", void 0);
CpPagination = __decorate([
    customElement('cp-pagination')
], CpPagination);
export { CpPagination };
//# sourceMappingURL=cp-pagination.js.map