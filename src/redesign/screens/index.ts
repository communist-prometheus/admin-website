import { html, type TemplateResult } from 'lit';
import './screen-settings.js';
import './screen-articles.js';
import './screen-members.js';
import './screen-editor.js';
import './screen-deploys.js';
import './screen-magazine.js';
import './screen-newsletter.js';
import './screen-topics.js';
import './screen-tickets.js';

/**
 * Screen registry for the shell router (app-shell R4). Each screen is a
 * self-contained custom element; the shell moves focus to the content region on
 * route change. Content screens read live repo data via the git engine (with a
 * sample fallback when the engine is off).
 */
export interface Screen {
  readonly title: string;
  readonly render: () => TemplateResult;
}

/** Wraps a self-contained screen custom element as a registry entry. */
const element = (title: string, tag: () => TemplateResult): Screen => ({ title, render: tag });

/** All screens, keyed by route/nav id. */
export const screens: Readonly<Record<string, Screen>> = {
  articles: element('Статьи', () => html`<screen-articles></screen-articles>`),
  members: element('Участники', () => html`<screen-members></screen-members>`),
  settings: element('Настройки', () => html`<screen-settings></screen-settings>`),
  editor: element('Редактор', () => html`<screen-editor></screen-editor>`),
  magazine: element('Журнал', () => html`<screen-magazine></screen-magazine>`),
  topics: element('Темы', () => html`<screen-topics></screen-topics>`),
  tickets: element('Тикеты', () => html`<screen-tickets></screen-tickets>`),
  newsletter: element('Рассылка', () => html`<screen-newsletter></screen-newsletter>`),
  deploys: element('Деплои', () => html`<screen-deploys></screen-deploys>`),
};
