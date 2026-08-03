import { LitElement } from 'lit';
import '../icon/cp-icon.js';
import '../progress/cp-progress.js';
/** Lifecycle state of the dropzone. */
export type CpUploadState = 'idle' | 'dragover' | 'uploading' | 'done' | 'failed';
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
export declare class CpUpload extends LitElement {
    static styles: import("lit").CSSResult;
    /** Native `accept` filter forwarded to the file input. */
    accept: string;
    /** Allows selecting more than one file. */
    multiple: boolean;
    /** Current lifecycle state driving the dropzone body. */
    state: CpUploadState;
    /** Upload completion ratio (0..1), shown while `state === 'uploading'`. */
    progress: number;
    /** Prompt shown in the idle/dragover states; also the zone's accessible name. */
    prompt: string;
    private inputEl;
    private openPicker;
    private emitFiles;
    private handleInputChange;
    private acceptsDrag;
    private handleDragOver;
    private handleDragLeave;
    private handleDrop;
    private handleRetry;
    /** Body for the non-terminal states, keyed off `state`. */
    private body;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-upload': CpUpload;
    }
}
//# sourceMappingURL=cp-upload.d.ts.map