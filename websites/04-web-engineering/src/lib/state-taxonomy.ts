/** The five kinds of frontend state (L18 Part 3) and a worked example screen to classify. */
export const KINDS = {
  server: 'Server-cache state',
  url: 'URL state',
  client: 'Client state',
  form: 'Form state',
  ui: 'Ephemeral UI state',
} as const;

export type Kind = keyof typeof KINDS;

export interface StateItem {
  id: string;
  label: string;
  kind: Kind;
  why: string;
}

export const DASHBOARD_STATE: StateItem[] = [
  {
    id: 'orders',
    label: 'The list of orders shown in the table',
    kind: 'server',
    why: 'Fetched data: a query cache with a stale time, keyed by the filters.',
  },
  {
    id: 'status',
    label: 'The "status: shipped" filter',
    kind: 'url',
    why: 'Shareable and restorable: ?status=shipped.',
  },
  {
    id: 'page',
    label: 'Current page of the table',
    kind: 'url',
    why: '?page=3 so Back and reload work.',
  },
  {
    id: 'user',
    label: 'The signed-in user and their role',
    kind: 'client',
    why: 'Session-wide, set at login; the server re-checks every request anyway.',
  },
  {
    id: 'theme',
    label: 'Dark mode preference',
    kind: 'client',
    why: 'App-wide preference, persisted locally.',
  },
  {
    id: 'draft',
    label: 'Half-typed note in the "Add note" box',
    kind: 'form',
    why: 'Draft values and validation belong to the form; persist to sessionStorage if losing it hurts.',
  },
  {
    id: 'submitting',
    label: 'Whether "Save" is currently submitting',
    kind: 'form',
    why: 'Submission status of that form.',
  },
  {
    id: 'menu',
    label: 'Whether the row actions menu is open',
    kind: 'ui',
    why: 'Local to one component; nobody else needs it and it should reset.',
  },
  {
    id: 'hover',
    label: 'Which row is hovered',
    kind: 'ui',
    why: 'Transient; often CSS alone (:hover) handles it.',
  },
  {
    id: 'count',
    label: '"12 orders need attention" badge',
    kind: 'server',
    why: 'Derived from server data: compute it from the cache, never store a copy.',
  },
  {
    id: 'tab',
    label: 'Selected tab: Orders / Returns',
    kind: 'url',
    why: 'Part of where you are: /orders vs /returns or ?tab=returns.',
  },
  {
    id: 'flags',
    label: 'Feature flag "new-checkout" is on',
    kind: 'client',
    why: 'Evaluated per user at session start (ideally on the server or edge).',
  },
];

export function score(
  answers: Record<string, string>,
  items: StateItem[] = DASHBOARD_STATE,
): number {
  return items.filter((item) => answers[item.id] === item.kind).length;
}
