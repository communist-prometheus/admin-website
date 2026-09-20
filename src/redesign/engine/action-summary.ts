import type { ActionEntry } from '@/features/action-history/types';

/**
 * One readable line per recorded action.
 *
 * The history is a discriminated union — a navigation carries a route pair,
 * a save a path and an outcome — so rendering it needs a summary per kind
 * rather than a generic text field. Every kind produces a line: a row that
 * summarises to nothing is a row nobody can act on.
 */

const AUTH_LABEL: Readonly<Record<string, string>> = {
  login: 'вход',
  logout: 'выход',
  'token-refresh': 'обновление токена',
};

const STAGE_LABEL: Readonly<Record<string, string>> = {
  stage: 'в индекс',
  unstage: 'из индекса',
  discard: 'откат',
};

/**
 * Describe one recorded action in a single line.
 * @param entry The recorded entry.
 * @returns A line naming what happened, never empty.
 */
export const summariseAction = (entry: ActionEntry): string => {
  switch (entry.kind) {
    case 'navigation':
      return `переход → ${entry.to === '' ? '(без адреса)' : entry.to}`;
    case 'save': {
      const outcome = entry.status === 'ok' ? 'успешно' : (entry.errorMessage ?? 'с ошибкой');
      return `${entry.action}: ${entry.path} — ${outcome}`;
    }
    case 'stage':
      return `${STAGE_LABEL[entry.action] ?? entry.action}: ${entry.path}`;
    case 'auth':
      return `авторизация: ${AUTH_LABEL[entry.action] ?? entry.action}`;
    case 'sw-error':
      return `ошибка воркера: ${entry.reason === '' ? '(без описания)' : entry.reason}`;
    case 'network-error':
      return `сеть: ${entry.url}${entry.status === undefined ? '' : ` (${entry.status})`} — ${entry.reason}`;
  }
};
