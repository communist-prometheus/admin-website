/**
 * Direct GitHub REST client for data that lives outside the content repo
 * (git-engine R7 boundary): repo collaborators (members) and issues (tickets).
 * Uses the dev token from the environment and GitHub's CORS-enabled API. Returns
 * empty on any failure (missing token, insufficient scope) so screens fall back
 * to sample data with an honest badge.
 */

import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';

const OWNER = 'communist-prometheus';
const API = 'https://api.github.com';

/**
 * The active GitHub token: the injected dev token locally, otherwise the
 * signed-in user's session token (same one the engine pushes with). Using the
 * session token is what makes members/tickets/pushes work on the deployed
 * admin, not just in local `dev:token`.
 */
const token = async (): Promise<string | undefined> => {
  const dev = import.meta.env.VITE_DEV_TOKEN;
  if (typeof dev === 'string' && dev.length > 0) return dev;
  return (await ensureFreshToken()) ?? undefined;
};

const get = async (path: string): Promise<unknown> => {
  const t = await token();
  if (t === undefined) return undefined;
  try {
    const response = await fetch(`${API}${path}`, {
      headers: { authorization: `Bearer ${t}`, accept: 'application/vnd.github+json' },
    });
    return response.ok ? await response.json() : undefined;
  } catch {
    return undefined;
  }
};

/** Reads a property off an unknown value without casting. */
const field = (value: unknown, key: string): unknown =>
  typeof value === 'object' && value !== null && key in value ? Reflect.get(value, key) : undefined;

/** A repo collaborator (member). */
export interface Member {
  readonly login: string;
  readonly role: string;
  readonly avatar: string;
}

const roleOf = (permissions: unknown): string => {
  if (field(permissions, 'admin') === true) return 'Владелец';
  if (field(permissions, 'push') === true) return 'Редактор';
  return 'Наблюдатель';
};

const toMember = (x: unknown): Member | undefined => {
  const login = field(x, 'login');
  if (typeof login !== 'string') return undefined;
  const avatar = field(x, 'avatar_url');
  return {
    login,
    role: roleOf(field(x, 'permissions')),
    avatar: typeof avatar === 'string' ? avatar : '',
  };
};

/** The signed-in viewer's coarse role on the content repo. */
export interface ViewerRole {
  readonly role: 'viewer' | 'editor' | 'admin';
  readonly owner: boolean;
}

/**
 * Resolves the signed-in viewer's real role from GitHub instead of assuming
 * everyone is an owner (QA #2). A repo object carries the authenticated user's
 * own `permissions`, so `admin` → owner/admin, `push` → editor, otherwise a
 * read-only viewer. Returns `undefined` when signed out or on any failure, so the
 * caller can pick a conservative fallback rather than silently granting access.
 */
export const getViewerRole = async (
  repo = 'public-website-content',
): Promise<ViewerRole | undefined> => {
  const data = await get(`/repos/${OWNER}/${repo}`);
  if (data === undefined) return undefined;
  const permissions = field(data, 'permissions');
  if (field(permissions, 'admin') === true) return { role: 'admin', owner: true };
  if (field(permissions, 'push') === true) return { role: 'editor', owner: false };
  return { role: 'viewer', owner: false };
};

/** Lists collaborators of a repo (default: the content repo). */
export const listMembers = async (repo = 'public-website-content'): Promise<readonly Member[]> => {
  const data = await get(`/repos/${OWNER}/${repo}/collaborators?per_page=100`);
  return Array.isArray(data) ? data.map(toMember).filter((m): m is Member => m !== undefined) : [];
};

/** A GitHub issue surfaced as an admin ticket. */
export interface Ticket {
  readonly number: number;
  readonly title: string;
  readonly state: 'open' | 'closed';
  readonly author: string;
  readonly date: string;
  readonly kind: 'bug' | 'story' | 'other';
}

const kindOf = (labels: unknown): Ticket['kind'] => {
  if (!Array.isArray(labels)) return 'other';
  const names = labels
    .map((l) => (typeof l === 'object' && l !== null && 'name' in l ? String(l.name) : ''))
    .join(' ')
    .toLowerCase();
  if (names.includes('bug')) return 'bug';
  if (names.includes('story') || names.includes('feature') || names.includes('enhancement'))
    return 'story';
  return 'other';
};

const toTicket = (x: unknown): Ticket | undefined => {
  const number = field(x, 'number');
  if (typeof number !== 'number' || field(x, 'pull_request') !== undefined) return undefined;
  const login = field(field(x, 'user'), 'login');
  const created = field(x, 'created_at');
  return {
    number,
    title: String(field(x, 'title')),
    state: field(x, 'state') === 'closed' ? 'closed' : 'open',
    author: typeof login === 'string' ? login : '—',
    date: typeof created === 'string' ? created.slice(0, 10) : '',
    kind: kindOf(field(x, 'labels')),
  };
};

/** Lists a repo's issues (default: the `tickets` repo) as tickets; PRs are
 * excluded so a code repo's pull requests never masquerade as tickets. */
export const listTickets = async (repo = 'tickets'): Promise<readonly Ticket[]> => {
  const data = await get(`/repos/${OWNER}/${repo}/issues?state=all&per_page=50`);
  return Array.isArray(data) ? data.map(toTicket).filter((t): t is Ticket => t !== undefined) : [];
};

/** A recent push (commit) to the content repo, for the deploy board. */
export interface Push {
  readonly sha: string;
  readonly title: string;
  readonly author: string;
  readonly date: string;
  readonly url: string;
}

const toPush = (x: unknown): Push | undefined => {
  const sha = field(x, 'sha');
  if (typeof sha !== 'string') return undefined;
  const commit = field(x, 'commit');
  const message = field(commit, 'message');
  const authorName = field(field(commit, 'author'), 'name');
  const date = field(field(commit, 'author'), 'date');
  const htmlUrl = field(x, 'html_url');
  return {
    sha: sha.slice(0, 7),
    title: typeof message === 'string' ? (message.split('\n')[0] ?? sha) : sha,
    author: typeof authorName === 'string' ? authorName : '—',
    date: typeof date === 'string' ? date : '',
    url: typeof htmlUrl === 'string' ? htmlUrl : '',
  };
};

/** A deploy workflow run on the public site, used to enrich the deploy board. */
export interface DeployRun {
  readonly status: 'queued' | 'in_progress' | 'completed';
  readonly conclusion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly url: string;
}

const toDeployRun = (x: unknown): DeployRun | undefined => {
  const status = field(x, 'status');
  if (status !== 'queued' && status !== 'in_progress' && status !== 'completed') return undefined;
  const conclusion = field(x, 'conclusion');
  const createdAt = field(x, 'created_at');
  const updatedAt = field(x, 'updated_at');
  const url = field(x, 'html_url');
  return {
    status,
    conclusion: typeof conclusion === 'string' ? conclusion : '',
    createdAt: typeof createdAt === 'string' ? createdAt : '',
    updatedAt: typeof updatedAt === 'string' ? updatedAt : '',
    url: typeof url === 'string' ? url : '',
  };
};

/**
 * Recent deploy runs of the public site, keyed by the branch the admin writes to.
 * The site deploy is what actually publishes a content push, so these carry the
 * real "building / published / failed" status the deploy board shows per push.
 */
export const listDeployRuns = async (
  branch = import.meta.env.VITE_GITHUB_BRANCH ?? 'develop',
  repo = 'public-website',
): Promise<readonly DeployRun[]> => {
  const data = await get(`/repos/${OWNER}/${repo}/actions/runs?branch=${branch}&per_page=30`);
  const runs = field(data, 'workflow_runs');
  return Array.isArray(runs)
    ? runs.map(toDeployRun).filter((r): r is DeployRun => r !== undefined)
    : [];
};

/**
 * Recent commits (pushes) on a branch of the content repo — the real activity
 * feed the deploy board shows. Branch defaults to the one the admin is wired to
 * (build-time `VITE_GITHUB_BRANCH`), so prod and dev each show their own.
 */
export const listPushes = async (
  branch = import.meta.env.VITE_GITHUB_BRANCH ?? 'develop',
  repo = 'public-website-content',
): Promise<readonly Push[]> => {
  const data = await get(`/repos/${OWNER}/${repo}/commits?sha=${branch}&per_page=15`);
  return Array.isArray(data) ? data.map(toPush).filter((p): p is Push => p !== undefined) : [];
};
