import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import type { CpTableColumn, CpTableRow } from '@communist-prometheus/cp-components';
import { listMembers, type Member } from '../engine/github-api.js';
import { onEngineReady } from '../engine/engine-ready.js';
import { classifyEmpty } from '../engine/load-state.js';

/** Semantic tag tones used for member roles (mirrors cp-tag's tone union). */
type RoleTone = 'success' | 'info' | 'neutral';

/**
 * Members screen (settings spec — the RBAC surface). When the real content
 * engine is running (local `dev:token` with a collaborator-scoped token), it
 * reads the content repo's actual GitHub collaborators via
 * {@link listMembers} and lists them with their live role/access — proving the
 * settings (RBAC) data path end-to-end. Without that scope the list comes back
 * empty, so the screen falls back to three representative sample rows behind an
 * honest "демо-данные" badge, keeping the preview renderable while never
 * passing sample rows off as real repository data.
 */
@customElement('screen-members')
export class ScreenMembers extends LitElement {
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
    cp-button {
      margin-inline-start: auto;
    }
    .login {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .avatar {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      object-fit: cover;
      background: var(--color-surface);
    }
    .login b {
      font-weight: 600;
    }
    .note {
      margin-top: var(--spacing-md);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  `;

  /** Collaborators read from the repo; empty until loaded (or if scope is missing). */
  @state() private members: readonly Member[] = [];

  /** Whether the real read has completed. */
  @state() private loaded = false;

  /** Unsubscribes the engine-ready listener on disconnect. */
  private disposeReady: () => void = () => {};

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
    // Re-read once the engine finishes booting (first-load race, QA #12).
    this.disposeReady = onEngineReady(() => void this.load());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disposeReady();
  }

  private async load(): Promise<void> {
    const members = await listMembers();
    this.members = members;
    this.loaded = true;
  }

  private static readonly columns: readonly CpTableColumn[] = [
    { key: 'login', label: 'Логин' },
    { key: 'role', label: 'Роль' },
    { key: 'status', label: 'Статус' },
  ];

  private roleTone(role: string): RoleTone {
    if (role === 'Владелец') return 'success';
    if (role === 'Редактор') return 'info';
    return 'neutral';
  }

  private loginCell(member: Member): TemplateResult {
    return html`<span class="login">
      ${member.avatar === ''
        ? nothing
        : html`<img class="avatar" src=${member.avatar} alt="" loading="lazy" />`}
      <b>${member.login}</b>
    </span>`;
  }

  private toRow(member: Member): CpTableRow {
    return {
      login: this.loginCell(member),
      role: html`<cp-tag tone=${this.roleTone(member.role)}>${member.role}</cp-tag>`,
      status: html`<cp-status state="success" label="активен"></cp-status>`,
    };
  }

  override render() {
    const live = this.members.length > 0;
    const rows = this.members.map((member) => this.toRow(member));
    return html`
      <div class="head">
        <p class="eyebrow">Сообщество · роли и доступ</p>
        <h1 tabindex="-1">Участники</h1>
        <cp-button variant="primary" disabled title="Приглашение участников появится позже">
          Пригласить
        </cp-button>
      </div>
      ${live
        ? html`<div style="max-width:100%;overflow-x:auto">
            <cp-table
              rowKey="login"
              caption="Участники репозитория"
              .columns=${[...ScreenMembers.columns]}
              .rows=${rows}
            ></cp-table>
          </div>`
        : html`<p class="note">
            ${classifyEmpty(this.loaded) === 'loading'
              ? 'Загружаем участников…'
              : classifyEmpty(this.loaded) === 'signed-out'
                ? 'Войдите через GitHub токеном с доступом к коллабораторам репозитория, чтобы увидеть участников.'
                : 'Участники не найдены: нужен токен с доступом к коллабораторам репозитория.'}
          </p>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-members': ScreenMembers;
  }
}
