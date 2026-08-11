import { describe, it, expect } from 'vitest';
import { navItems, canSee, type AuthState, type Role } from './nav.ts';

const item = (id: string) => {
  const found = navItems.find((navItem) => navItem.id === id);
  if (found === undefined) throw new Error(`no nav item ${id}`);
  return found;
};

const auth = (role: Role, owner: boolean): AuthState => ({ role, owner, login: 'u' });

describe('canSee (QA #2 route/nav gating)', () => {
  it('hides the owner-only newsletter from non-owners', () => {
    expect(canSee(item('newsletter'), auth('editor', false))).toBe(false);
    expect(canSee(item('newsletter'), auth('admin', false))).toBe(false);
    expect(canSee(item('newsletter'), auth('admin', true))).toBe(true);
  });

  it('gates admin-only members/settings to admins', () => {
    for (const id of ['members', 'settings']) {
      expect(canSee(item(id), auth('viewer', false))).toBe(false);
      expect(canSee(item(id), auth('editor', false))).toBe(false);
      expect(canSee(item(id), auth('admin', false))).toBe(true);
    }
  });

  it('lets editors see the content surfaces', () => {
    for (const id of ['articles', 'magazine', 'topics', 'tickets', 'deploys']) {
      expect(canSee(item(id), auth('editor', false))).toBe(true);
    }
  });

  it('hides editor surfaces from a bare viewer', () => {
    expect(canSee(item('articles'), auth('viewer', false))).toBe(false);
  });

  it('an owner-admin sees everything', () => {
    const owner = auth('admin', true);
    for (const navItem of navItems) {
      expect(canSee(navItem, owner)).toBe(true);
    }
  });
});
