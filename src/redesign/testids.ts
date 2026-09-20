/**
 * Stable DOM anchors the end-to-end suite waits on.
 *
 * The rebuilt admin shipped without any: every E2E spec in the repository
 * drives the previous Vue client, which `redesign-as-index.ts` stopped
 * serving long ago. Tests that cannot name an element cannot wait on one,
 * so the ids live here — imported by the components that render them and
 * by the specs that wait on them, never retyped in either.
 *
 * Each id marks something a test needs to *wait for*, not merely to click:
 * a signed-in shell, a list that has loaded, an editor bound to a file, a
 * publish that has settled. Identity goes on the element as data too
 * (`data-slug`, `data-path`), so a wait can assert *which* article is open
 * rather than that *some* article is.
 */
export const TESTID = {
  /** Header chip carrying the signed-in GitHub login. */
  account: 'account',
  /** The routed screen container; carries `data-route`. */
  screen: 'screen',
  /** Articles list; present only once the listing resolved. */
  articleList: 'article-list',
  /** One row of the articles list; carries `data-slug`. */
  articleRow: 'article-row',
  /** Opens a blank new material. */
  createMaterial: 'create-material',
  /** The editor document; carries `data-path` (empty for a new material). */
  editorDoc: 'editor-doc',
  /** The editable article heading. */
  editorTitle: 'editor-title',
  /** The markdown body editor. */
  editorBody: 'editor-body',
  /** The address (slug) field. */
  editorAddress: 'editor-address',
  /** The file input behind the import affordance. */
  editorImport: 'editor-import',
  /** Feedback line an import writes (status or refusal). */
  importNote: 'import-note',
  /** Opens the add-translation dialog. */
  addLang: 'add-lang',
  /** The add-translation dialog. */
  addLangDialog: 'add-lang-dialog',
  /** Confirms the chosen translation language. */
  addLangConfirm: 'add-lang-confirm',
  /** Starts a publish. */
  publish: 'publish',
  /** The publish dialog; carries `data-state` = running | done | failed. */
  publishDialog: 'publish-dialog',
  /** The commit sha a finished publish reports. */
  publishSha: 'publish-sha',
  /** The reason a refused publish reports. */
  publishError: 'publish-error',
} as const;

/** One of the anchors above. */
export type TestId = (typeof TESTID)[keyof typeof TESTID];
