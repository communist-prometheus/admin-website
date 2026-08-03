/**
 * Direct GitHub REST client for data that lives outside the content repo
 * (git-engine R7 boundary): repo collaborators (members) and issues (tickets).
 * Uses the dev token from the environment and GitHub's CORS-enabled API. Returns
 * empty on any failure (missing token, insufficient scope) so screens fall back
 * to sample data with an honest badge.
 */

const OWNER = 'communist-prometheus';
const API = 'https://api.github.com';

const token = (): string | undefined => {
  const t = import.meta.env.VITE_DEV_TOKEN;
  return typeof t === 'string' && t.length > 0 ? t : undefined;
};

const get = async (path: string): Promise<unknown> => {
  const t = token();
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

/** Lists issues of a repo (default: admin-website) as tickets. */
export const listTickets = async (repo = 'admin-website'): Promise<readonly Ticket[]> => {
  const data = await get(`/repos/${OWNER}/${repo}/issues?state=all&per_page=50`);
  return Array.isArray(data) ? data.map(toTicket).filter((t): t is Ticket => t !== undefined) : [];
};
