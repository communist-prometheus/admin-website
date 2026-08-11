import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { currentProgress, onEngineProgress, type EngineProgress } from '../engine/engine-progress.js';

/**
 * Loading indicator for SW-git-engine reads. While the engine clones the repo it
 * broadcasts phase progress; this shows a real bar naming what is being fetched
 * rather than an opaque spinner. Before any progress arrives it shows the
 * caller-supplied `label`. The raw phase strings arrive in English from
 * isomorphic-git; the render maps them to human (Russian) labels — the UI layer,
 * consistent with the rest of the admin's Russian copy.
 */
@customElement('engine-loading')
export class EngineLoading extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .wrap {
      display: grid;
      gap: var(--spacing-sm);
      max-width: 30rem;
      padding: var(--spacing-md) 0;
    }
    .label {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }
    .pct {
      font-variant-numeric: tabular-nums;
      color: var(--color-text-primary);
    }
  `;

  /** Fallback message (from the caller) shown before the first progress event. */
  @property() label = '';

  @state() private progress?: EngineProgress = currentProgress();

  private disposeProgress: () => void = () => {};

  override connectedCallback(): void {
    super.connectedCallback();
    this.progress = currentProgress();
    this.disposeProgress = onEngineProgress(() => (this.progress = currentProgress()));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disposeProgress();
  }

  /** Maps a raw isomorphic-git phase to a localised label (patched below). */
  private phaseLabel(phase: string): string {
    switch (phase) {
      case 'Counting objects':
        return 'Считаем объекты репозитория';
      case 'Compressing objects':
        return 'Сжимаем объекты';
      case 'Receiving objects':
        return 'Загружаем материалы из репозитория';
      case 'Resolving deltas':
        return 'Собираем изменения';
      case 'Analyzing workdir':
        return 'Анализируем рабочую копию';
      case 'Updating workdir':
      case 'Checking out files':
        return 'Раскладываем файлы';
      default:
        return phase;
    }
  }

  override render(): TemplateResult {
    const p = this.progress;
    const pct = p !== undefined && p.total > 0 ? Math.round((p.loaded / p.total) * 100) : undefined;
    const text = p !== undefined ? this.phaseLabel(p.phase) : this.label;
    return html`
      <div class="wrap" role="status" aria-live="polite">
        <cp-progress ?indeterminate=${pct === undefined} value=${pct === undefined ? 0 : pct / 100}></cp-progress>
        <p class="label">
          ${text}${pct === undefined ? nothing : html` · <span class="pct">${pct}%</span>`}
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'engine-loading': EngineLoading;
  }
}
