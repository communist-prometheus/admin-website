import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import './screen-members.ts';
import type { ScreenMembers } from './screen-members.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/*
 * Reported 2026-10-31: settings had no way to change a role. The
 * members screen listed roles read-only. A role is the member's GitHub
 * permission on the content repo, so the screen now rewrites it.
 */
const COLLAB = '/repos/communist-prometheus/public-website-content/collaborators';

interface Collaborator {
  login: string;
  permissions: { admin: boolean; push: boolean; pull: boolean };
}

const PERMISSIONS = {
  admin: { admin: true, push: true, pull: true },
  push: { admin: false, push: true, pull: true },
  pull: { admin: false, push: false, pull: true },
} as const;

type Level = keyof typeof PERMISSIONS;

const isLevel = (value: unknown): value is Level =>
  value === 'admin' || value === 'push' || value === 'pull';

const stubGitHub = (collaborators: Collaborator[], puts: string[], refuse = false): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (url.endsWith('/user')) return Response.json({ login: 'undeadliner' });
    if (init?.method === 'PUT') {
      if (refuse) return Response.json({ message: 'Must have admin rights to Repository.' }, { status: 403 });
      const login = decodeURIComponent(url.split('/').at(-1) ?? '');
      const permission: unknown = JSON.parse(String(init.body)).permission;
      puts.push(`${login}:${String(permission)}`);
      const member = collaborators.find((c) => c.login === login);
      if (member && isLevel(permission)) member.permissions = { ...PERMISSIONS[permission] };
      return new Response(undefined, { status: 204 });
    }
    if (url.includes(COLLAB)) return Response.json(collaborators);
    return new Response('{}', { status: 404 });
  });
};

const team = (): Collaborator[] => [
  { login: 'undeadliner', permissions: { ...PERMISSIONS.admin } },
  { login: 'andswew', permissions: { ...PERMISSIONS.push } },
];

interface MembersInternals {
  loaded: boolean;
  changeAccess: (login: string, access: string) => Promise<void>;
}

const inner = (el: ScreenMembers): MembersInternals => el as unknown as MembersInternals;

const settle = async (el: ScreenMembers): Promise<void> => {
  for (let i = 0; i < 60 && !inner(el).loaded; i += 1) await new Promise((r) => setTimeout(r, 10));
  await new Promise((r) => setTimeout(r, 20));
  await el.updateComplete;
};

const mount = async (): Promise<ScreenMembers> => {
  const el = document.createElement('screen-members');
  document.body.append(el);
  await settle(el);
  return el;
};

/** The role pickers rendered in the table, keyed by member login. */
const pickers = (el: HTMLElement): Readonly<Record<string, string>> => {
  // Cells render inside cp-table's own shadow root.
  const table = el.shadowRoot?.querySelector('cp-table')?.shadowRoot;
  return Object.fromEntries(
    [...(table?.querySelectorAll('select[data-login]') ?? [])].map((select) => [
      String(select.getAttribute('data-login')),
      String(Reflect.get(select, 'value') ?? ''),
    ]),
  );
};

const text = (el: HTMLElement): string => (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

beforeEach(() => {
  document.body.replaceChildren();
  vi.stubEnv('VITE_DEV_TOKEN', '');
  vi.mocked(ensureFreshToken).mockResolvedValue('tok');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('screen-members: changing a member role', () => {
  it('offers a role picker for every other member, showing their current role', async () => {
    stubGitHub(team(), []);
    const el = await mount();
    expect(pickers(el)).toEqual({ andswew: 'push' });
  });

  it('makes a member an owner on GitHub and shows the new role', async () => {
    const collaborators = team();
    const puts: string[] = [];
    stubGitHub(collaborators, puts);
    const el = await mount();
    await inner(el).changeAccess('andswew', 'admin');
    await settle(el);
    expect(puts).toEqual(['andswew:admin']);
    expect(pickers(el)).toEqual({ andswew: 'admin' });
    expect(text(el)).toContain('andswew теперь: Владелец');
  });

  it('shows GitHub refusal and keeps the old role', async () => {
    stubGitHub(team(), [], true);
    const el = await mount();
    await inner(el).changeAccess('andswew', 'admin');
    await settle(el);
    expect(text(el)).toContain('Must have admin rights to Repository.');
    expect(pickers(el)).toEqual({ andswew: 'push' });
  });
});
