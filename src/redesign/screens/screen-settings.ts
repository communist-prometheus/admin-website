import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { readLanguages, type SiteLanguage } from '../engine/content.js';

/**
 * Settings screen (settings spec). When the real content engine is running
 * (local dev:token), it reads the repo's `settings/languages.json` and lists the
 * actual configured languages — proving live data end-to-end; otherwise it shows
 * a representative sample so the preview still renders.
 */
@customElement('screen-settings')
export class ScreenSettings extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
    }
    h1 {
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .eyebrow {
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .langs {
      display: grid;
      gap: 0.6rem;
      max-width: 34rem;
      margin-top: var(--spacing-md);
    }
    .lang {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
      padding: 0.7rem var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }
    .lang b {
      font-weight: 600;
    }
    .code {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .note {
      margin-top: var(--spacing-md);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  `;

  /** Languages read from the repo; empty until loaded (or if the engine is off). */
  @state() private languages: readonly SiteLanguage[] = [];

  /** Whether the real read has completed. */
  @state() private loaded = false;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  private async load(): Promise<void> {
    const languages = await readLanguages();
    this.languages = languages;
    this.loaded = true;
  }

  private sample(): readonly SiteLanguage[] {
    return [
      { code: 'ru', label: 'Русский' },
      { code: 'en', label: 'English' },
      { code: 'it', label: 'Italiano' },
    ];
  }

  override render() {
    const live = this.languages.length > 0;
    const list = live ? this.languages : this.sample();
    return html`
      <div class="head">
        <p class="eyebrow">Администрирование · языки сайта</p>
        <h1 tabindex="-1">Настройки</h1>
        ${live
          ? html`<cp-tag tone="success">данные из репозитория</cp-tag>`
          : this.loaded
            ? html`<cp-tag tone="neutral">демо-данные</cp-tag>`
            : nothing}
      </div>
      <cp-tabs
        active="languages"
        .tabs=${[
          { id: 'languages', label: 'Языки' },
          { id: 'links', label: 'Ссылки' },
          { id: 'themes', label: 'Темы' },
        ]}
      ></cp-tabs>
      <div class="langs">
        ${list.map(
          (lang) => html`
            <div class="lang">
              <b>${lang.label}</b>
              <span class="code">${lang.code}</span>
              <cp-switch checked></cp-switch>
            </div>
          `,
        )}
      </div>
      <p class="note">
        ${live
          ? `Прочитано из settings/languages.json — ${list.length} ${
              list.length === 1 ? 'язык' : 'языков'
            } реального репозитория.`
          : 'Запустите dev:token с токеном, чтобы увидеть реальные языки репозитория.'}
      </p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-settings': ScreenSettings;
  }
}
