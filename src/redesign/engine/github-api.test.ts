import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import { listMembers, listPushes, listTickets, createTicket } from './github-api.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({
  ensureFreshToken: vi.fn(),
}));

const stubFetch = (payload: unknown, status = 200): string[] => {
  const urls: string[] = [];
  vi.stubGlobal('fetch', async (url: string) => {
    urls.push(url);
    return new Response(JSON.stringify(payload), { status });
  });
  return urls;
};

beforeEach(() => {
  vi.stubEnv('VITE_DEV_TOKEN', '');
  vi.mocked(ensureFreshToken).mockResolvedValue('tok');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('listTickets', () => {
  it('reads the tickets repo — never a code repo like admin-website', async () => {
    const urls = stubFetch([]);
    await listTickets();
    expect(urls[0]).toContain('/repos/communist-prometheus/tickets/issues');
    expect(urls[0]).not.toContain('admin-website');
  });

  it('surfaces real issues but excludes pull requests', async () => {
    stubFetch([
      {
        number: 30,
        title: 'every push fails',
        state: 'open',
        user: { login: 'andswew' },
        created_at: '2026-06-28T10:00:00Z',
        labels: [{ name: 'bug' }],
      },
      {
        number: 29,
        title: 'a code PR masquerading as an issue',
        pull_request: { url: 'https://gh/pull/29' },
        user: { login: 'undeadliner' },
        created_at: '2026-06-15T10:00:00Z',
      },
    ]);
    const tickets = await listTickets();
    expect(tickets.map((t) => t.number)).toEqual([30]);
    expect(tickets[0]).toMatchObject({
      title: 'every push fails',
      author: 'andswew',
      kind: 'bug',
      date: '2026-06-28',
    });
  });

  it('returns empty and issues no request when there is no token', async () => {
    vi.mocked(ensureFreshToken).mockResolvedValue(undefined);
    const urls = stubFetch([{ number: 1, title: 'x' }]);
    expect(await listTickets()).toEqual([]);
    expect(urls).toHaveLength(0);
  });
});

describe('list* repo targeting (regression: each list reads its own repo)', () => {
  it('members = collaborators of the content repo', async () => {
    const urls = stubFetch([]);
    await listMembers();
    expect(urls[0]).toContain(
      '/repos/communist-prometheus/public-website-content/collaborators'
    );
  });

  it('pushes = commits of the content repo', async () => {
    const urls = stubFetch([]);
    await listPushes();
    expect(urls[0]).toContain(
      '/repos/communist-prometheus/public-website-content/commits'
    );
  });
});

describe('createTicket (QA #9)', () => {
  interface Call {
    readonly url: string;
    readonly method?: string;
    readonly body: unknown;
  }

  const stubCreate = (payload: unknown, status = 201): Call[] => {
    const calls: Call[] = [];
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: init?.method,
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      });
      return new Response(JSON.stringify(payload), { status });
    });
    return calls;
  };

  it('POSTs a new issue to the tickets repo with the kind label', async () => {
    const calls = stubCreate({ number: 42, html_url: 'https://gh/tickets/42' });
    const result = await createTicket({ title: 'broken', body: 'steps', kind: 'bug' });

    expect(calls[0]?.method).toBe('POST');
    expect(calls[0]?.url).toContain('/repos/communist-prometheus/tickets/issues');
    expect(calls[0]?.body).toEqual({ title: 'broken', body: 'steps', labels: ['bug'] });
    expect(result).toEqual({ ok: true, number: 42, url: 'https://gh/tickets/42' });
  });

  it('sends no label for an "other" ticket', async () => {
    const calls = stubCreate({ number: 7, html_url: 'u' });
    await createTicket({ title: 't', body: '', kind: 'other' });
    expect(calls[0]?.body).toMatchObject({ labels: [] });
  });

  it('reports failure (no throw) when GitHub rejects the create', async () => {
    stubCreate({ message: 'Forbidden' }, 403);
    const result = await createTicket({ title: 't', body: '', kind: 'story' });
    expect(result.ok).toBe(false);
    expect(result.number).toBeUndefined();
  });
});
