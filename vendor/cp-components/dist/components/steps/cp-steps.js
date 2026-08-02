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
 * The terminal states carry a distinct SHAPE via `<cp-icon>` (done → check,
 * failed → x) so meaning survives greyscale / colour-blindness — never colour
 * alone (R5/NFR-2, design.md §5, WCAG 1.4.1).
 */
const stateIcons = {
    done: 'check',
    failed: 'x',
};
/** Screen-reader word appended to each label so state is not visual-only. */
const stateWords = {
    pending: 'Pending',
    running: 'In progress',
    done: 'Done',
    failed: 'Failed',
};
/**
 * Step / progress tracker (R5/NFR-2, design.md §5). Renders an ordered list
 * (`part="list"`) of segments (`part="step"`); each step shows a marker coloured
 * by state (done → `--cp-color-success`, running → `--cp-color-accent`, failed →
 * `--cp-color-danger`, pending → `--cp-color-border`), a decorative connector
 * line, and the label. The running step is flagged with `aria-current="step"`,
 * and every state is mirrored by a visually-hidden word so nothing is conveyed
 * by colour alone.
 */
let CpSteps = class CpSteps extends LitElement {
    constructor() {
        super(...arguments);
        /** The ordered steps to render. */
        this.steps = [];
    }
    static { this.styles = css `
    :host {
      display: block;
      font-family: inherit;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .step {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      --tone: var(--cp-color-border, hsl(0 0% 88%));
    }

    .step.done {
      --tone: var(--cp-color-success, hsl(140 55% 35%));
    }

    .step.running {
      --tone: var(--cp-color-accent, hsl(12 80% 45%));
    }

    .step.failed {
      --tone: var(--cp-color-danger, hsl(0 70% 45%));
    }

    .connector {
      position: absolute;
      top: 0.75rem;
      left: 50%;
      width: 100%;
      height: 2px;
      background: var(--cp-color-border, hsl(0 0% 88%));
    }

    .step:last-child .connector {
      display: none;
    }

    .marker {
      position: relative;
      z-index: 1;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background: var(--tone);
      border: 2px solid var(--tone);
      color: var(--cp-color-on-accent, #fff);
      flex: none;
    }

    .label {
      font-size: 0.875rem;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }
  `; }
    renderStep(step) {
        const icon = stateIcons[step.state];
        return html `
      <li
        class="step ${step.state}"
        part="step"
        aria-current=${step.state === 'running' ? 'step' : nothing}
      >
        <span class="connector" part="connector" aria-hidden="true"></span>
        <span class="marker" part="marker" aria-hidden="true">
          ${icon === undefined
            ? nothing
            : html `<cp-icon name=${icon} size="14" part="icon"></cp-icon>`}
        </span>
        <span class="label" part="label">${step.label}</span>
        <span class="sr-only">${stateWords[step.state]}</span>
      </li>
    `;
    }
    render() {
        return html `
      <ol class="list" part="list">
        ${this.steps.map((step) => this.renderStep(step))}
      </ol>
    `;
    }
};
__decorate([
    property({ type: Array })
], CpSteps.prototype, "steps", void 0);
CpSteps = __decorate([
    customElement('cp-steps')
], CpSteps);
export { CpSteps };
//# sourceMappingURL=cp-steps.js.map