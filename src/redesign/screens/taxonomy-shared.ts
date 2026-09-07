import { css } from 'lit';
import type { CpTab } from '@communist-prometheus/cp-components';

/**
 * What the two taxonomy screens (topics and categories) share: the language
 * strip and the row layout. Both edit a list of `{ key, per-language text }`
 * entries stored in the content repository's settings, so they look and behave
 * the same on purpose.
 */

/** The publication languages, as the keys used inside the settings files. */
export const TAXONOMY_LANGS: readonly CpTab[] = [
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
  { id: 'it', label: 'IT' },
  { id: 'es', label: 'ES' },
  { id: 'bl', label: 'BG' },
  { id: 'pl', label: 'PL' },
  { id: 'uk', label: 'UK' },
];

export const taxonomyStyles = css`
  :host {
    display: block;
    font-family: var(--font-sans);
    color: var(--color-text-primary);
    line-height: 1.6;
  }
  .eyebrow {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }
  h1 {
    margin: 0.2rem 0 var(--spacing-sm);
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    color: var(--color-accent);
  }
  .lede {
    margin: 0 0 var(--spacing-md);
    max-width: 46rem;
    color: var(--color-text-secondary);
  }
  .rows {
    list-style: none;
    margin: var(--spacing-md) 0 0;
    padding: 0;
    display: grid;
    gap: var(--spacing-sm);
  }
  /* One row per entry: it wraps to a column on a phone rather than scrolling. */
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-md, 10px);
  }
  .row cp-input {
    flex: 1 1 10rem;
    min-width: 0;
  }
  .row .swatch {
    flex: 0 0 auto;
    inline-size: 2.25rem;
    block-size: 2.25rem;
    padding: 0;
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-sm, 6px);
    background: none;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }
  .msg {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }
  .msg.error {
    color: var(--color-danger, #c0392b);
  }
  code {
    font-family: var(--font-mono, monospace);
    font-size: 0.9em;
  }
`;
