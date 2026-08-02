import type { IconName } from '@communist-prometheus/cp-components';

/**
 * Navigation model + gating for the app shell (app-shell R2/R3). The nav is
 * data-driven so gating is a pure, testable predicate over the current auth
 * state — hidden, not merely disabled. The real Role/AuthState contract is owned
 * by the auth spec; this is the shell-side shape it consumes.
 */

/** Coarse role ranking; a higher rank satisfies a lower requirement. */
export type Role = 'viewer' | 'editor' | 'admin';

/** The current session as the shell needs it (read-only). */
export interface AuthState {
  readonly role: Role;
  readonly owner: boolean;
  readonly login: string;
}

/** A primary navigation entry. */
export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly group: 'content' | 'community' | 'distribution' | 'admin';
  readonly role?: Role;
  readonly ownerOnly?: boolean;
}

/** Human labels for the four groups, in display order. */
export const groups: ReadonlyArray<readonly [NavItem['group'], string]> = [
  ['content', 'Контент'],
  ['community', 'Сообщество'],
  ['distribution', 'Распространение'],
  ['admin', 'Администрирование'],
];

/** The admin's primary navigation (roles per the inventory; refined in auth). */
export const navItems: readonly NavItem[] = [
  { id: 'articles', label: 'Статьи', icon: 'check', group: 'content', role: 'editor' },
  { id: 'magazine', label: 'Журнал', icon: 'upload', group: 'content', role: 'editor' },
  { id: 'topics', label: 'Темы', icon: 'more', group: 'content', role: 'editor' },
  { id: 'members', label: 'Участники', icon: 'plus', group: 'community', role: 'admin' },
  { id: 'tickets', label: 'Тикеты', icon: 'warning', group: 'community', role: 'editor' },
  { id: 'newsletter', label: 'Рассылка', icon: 'chevron-right', group: 'distribution', ownerOnly: true },
  { id: 'deploys', label: 'Деплои', icon: 'refresh', group: 'distribution', role: 'editor' },
  { id: 'settings', label: 'Настройки', icon: 'more', group: 'admin', role: 'admin' },
];

const rank: Record<Role, number> = { viewer: 0, editor: 1, admin: 2 };

/**
 * Whether the current session may see a nav item (R3). Owner-only items require
 * ownership; role-gated items require at least the named role; ungated items are
 * visible to any signed-in user.
 */
export const canSee = (item: NavItem, auth: AuthState): boolean =>
  (item.ownerOnly ? auth.owner : true) &&
  (item.role === undefined || rank[auth.role] >= rank[item.role]);
