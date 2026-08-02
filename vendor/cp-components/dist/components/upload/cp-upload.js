var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import '../icon/cp-icon.js';
import '../progress/cp-progress.js';
/** Flattens a native `FileList` (or absent transfer) into a `File[]`. */
const filesOf = (list) => list === null || list === undefined ? [] : Array.from(list);
/**
 * File dropzone (R4/R5/R7, design.md §5/§6). A single `part="dropzone"` control
 * that both accepts drag-and-drop and, on click, opens a hidden native
 * `<input type="file">`. Dropping or picking files emits a bubbling+composed
 * `cp-files` `CustomEvent` with `detail: { files: File[] }`. `state` drives the
 * body: `dragover` applies the active style; `uploading` shows a `<cp-progress>`
 * bound to `progress` (0..1); `done` shows a success check; `failed` shows a
 * retry control that emits `cp-retry`. `accept`/`multiple` are forwarded to the
 * input. The zone carries an upload `<cp-icon>` and a text prompt that provides
 * its accessible name.
 */
let CpUpload = class CpUpload extends LitElement {
    constructor() {
        super(...arguments);
        /** Native `accept` filter forwarded to the file input. */
        this.accept = '';
        /** Allows selecting more than one file. */
        this.multiple = false;
        /** Current lifecycle state driving the dropzone body. */
        this.state = 'idle';
        /** Upload completion ratio (0..1), shown while `state === 'uploading'`. */
        this.progress = 0;
        /** Prompt shown in the idle/dragover states; also the zone's accessible name. */
        this.prompt = 'Drag & drop files here, or click to browse';
        this.openPicker = () => {
            this.inputEl.click();
        };
        this.handleInputChange = (event) => {
            const input = event.currentTarget;
            if (!(input instanceof HTMLInputElement)) {
                return;
            }
            this.emitFiles(filesOf(input.files));
            input.value = '';
        };
        this.handleDragOver = (event) => {
            if (!this.acceptsDrag()) {
                return;
            }
            event.preventDefault();
            this.state = 'dragover';
        };
        this.handleDragLeave = (event) => {
            if (!this.acceptsDrag()) {
                return;
            }
            event.preventDefault();
            this.state = 'idle';
        };
        this.handleDrop = (event) => {
            if (!this.acceptsDrag()) {
                return;
            }
            event.preventDefault();
            this.state = 'idle';
            this.emitFiles(filesOf(event.dataTransfer?.files));
        };
        this.handleRetry = () => {
            this.dispatchEvent(new CustomEvent('cp-retry', { bubbles: true, composed: true }));
        };
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .dropzone {
      appearance: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      width: 100%;
      padding: var(--cp-spacing-lg, 2rem);
      border: 2px dashed var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-md, 0.75rem);
      background: var(--cp-color-surface, hsl(0 0% 98%));
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      font-family: inherit;
      font-size: inherit;
      cursor: pointer;
      transition: border-color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .dropzone:hover {
      border-color: var(--cp-color-accent, hsl(12 80% 45%));
    }

    .dropzone:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .dropzone.dragover {
      border-color: var(--cp-color-accent, hsl(12 80% 45%));
      background: var(--cp-color-info-bg, hsl(210 100% 96%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .dropzone.done {
      border-style: solid;
      border-color: var(--cp-color-success, hsl(140 60% 40%));
      color: var(--cp-color-success, hsl(140 60% 40%));
    }

    .dropzone.failed {
      border-style: solid;
      border-color: var(--cp-color-danger, hsl(0 70% 50%));
      color: var(--cp-color-danger, hsl(0 70% 50%));
    }

    .prompt {
      font-weight: 500;
    }

    .progress {
      width: 100%;
    }

    .input {
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

    .retry {
      appearance: none;
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      margin-top: var(--cp-spacing-sm, 1rem);
      padding: var(--cp-spacing-xs, 0.5rem) var(--cp-spacing-md, 1.5rem);
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-sm, 0.5rem);
      background: var(--cp-color-surface-elevated, hsl(0 0% 100%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      font-family: inherit;
      font-size: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .retry:hover {
      background: var(--cp-color-surface, hsl(0 0% 98%));
    }

    .retry:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }
  `; }
    emitFiles(files) {
        if (files.length === 0) {
            return;
        }
        this.dispatchEvent(new CustomEvent('cp-files', {
            bubbles: true,
            composed: true,
            detail: { files },
        }));
    }
    acceptsDrag() {
        return this.state === 'idle' || this.state === 'dragover';
    }
    /** Body for the non-terminal states, keyed off `state`. */
    body() {
        switch (this.state) {
            case 'uploading':
                return html `
          <cp-icon name="upload" size="28" part="upload-icon"></cp-icon>
          <span class="prompt" part="prompt">Uploading…</span>
          <cp-progress
            class="progress"
            part="progress"
            .value=${this.progress}
            label="Upload progress"
          ></cp-progress>
        `;
            case 'done':
                return html `
          <cp-icon name="check" size="28" part="success-icon"></cp-icon>
          <span class="prompt" part="prompt">Upload complete</span>
        `;
            case 'failed':
                return html `
          <cp-icon name="warning" size="28" part="error-icon"></cp-icon>
          <span class="prompt" part="prompt">Upload failed</span>
        `;
            default:
                return html `
          <cp-icon name="upload" size="28" part="upload-icon"></cp-icon>
          <span class="prompt" part="prompt">${this.prompt}</span>
        `;
        }
    }
    render() {
        return html `
      <button
        class="dropzone ${this.state}"
        part="dropzone"
        type="button"
        aria-label=${this.prompt}
        @click=${this.openPicker}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
      >
        ${this.body()}
      </button>
      <input
        class="input"
        type="file"
        part="input"
        tabindex="-1"
        aria-hidden="true"
        accept=${this.accept || nothing}
        ?multiple=${this.multiple}
        @change=${this.handleInputChange}
      />
      ${this.state === 'failed'
            ? html `<button
            class="retry"
            part="retry"
            type="button"
            @click=${this.handleRetry}
          >
            <cp-icon name="refresh" size="18"></cp-icon>
            <span>Retry</span>
          </button>`
            : nothing}
    `;
    }
};
__decorate([
    property({ type: String })
], CpUpload.prototype, "accept", void 0);
__decorate([
    property({ type: Boolean })
], CpUpload.prototype, "multiple", void 0);
__decorate([
    property({ type: String })
], CpUpload.prototype, "state", void 0);
__decorate([
    property({ type: Number })
], CpUpload.prototype, "progress", void 0);
__decorate([
    property({ type: String })
], CpUpload.prototype, "prompt", void 0);
__decorate([
    query('.input')
], CpUpload.prototype, "inputEl", void 0);
CpUpload = __decorate([
    customElement('cp-upload')
], CpUpload);
export { CpUpload };
//# sourceMappingURL=cp-upload.js.map