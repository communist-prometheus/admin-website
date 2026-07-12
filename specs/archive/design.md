# Archive — Design

> **Status:** DRAFT — phase 2 of three. Resolves the open decisions from
> requirements.md §9 and specifies the implementation per iteration.
>
> _Pause for review before tasks.md._

## 1. Resolved decisions

1. **Data model — archive item = nested content type.** An archive item is a
   folder `archive/{slug}/` with `index.{lang}.md` (frontmatter only matters;
   body optional) plus `assets/`. This makes it a peer of blog/positions and
   flows through every existing section-agnostic mechanism (content store,
   list, create dialog, edit view, AssetManager, publish, delete, SW handlers)
   with only registration boilerplate.

2. **Frontmatter shape.** `title` (required), `description` (optional),
   `published` (checkbox), `publishDate` (date). No `category` in v1. A future
   per-file caption/order manifest is deferred; iteration order = directory
   listing order until a manifest is needed.

3. **Viewer framework.** The viewer is a self-contained Vue 3 component in the
   admin (iterations 2–4). For the public widget (iteration 5) we add
   `@astrojs/vue` to public-website and mount the **same** viewer core as an
   Astro island (`client:visible`), feeding it plain props (image URLs +
   metadata) so it has no admin/SW coupling. The viewer core therefore takes
   data, never fetches it.

4. **Role gate.** Editor-visible (no `minRole`), matching blog.

5. **Public exposure timing.** Public listing/detail pages land in iteration 5
   alongside the widget (the widget links to them). Iterations 1–4 are
   admin-only; this matches the user's sequencing (manage + view first, expose
   publicly last).

## 2. Iteration 1 — Section, upload, download

### 2.1 Registration (the section boilerplate)

`archive` is added to every enumeration point:

| File | Change |
|---|---|
| `src/types/content-type.ts` | `'archive'` in the union, `CONTENT_TYPE_VALUES`, `NESTED_TYPES` |
| `src/router/content-routes.ts` | `'archive'` in `CONTENT_SECTIONS` |
| `src/components/ContentNav/nav-by-role.ts` | `{ path: '/content/archive', label: 'Archive' }` |
| `src/config/content-paths.ts` | `'archive'` in the local `NESTED_TYPES` set |
| `src/sw/handlers/content/base.ts` | `'archive'` in the SW `NESTED_TYPES` set |
| `src/components/MarkdownEditor/fields-archive.ts` (new) | field list |
| `src/components/MarkdownEditor/frontmatter-fields.ts` | map `archive → archiveFields` |
| `src/components/MarkdownEditor/field-definitions.ts` | re-export `archiveFields` |
| `src/sw/mock/archive/*`, `src/sw/mock/archive-entries.ts`, `all-entries.ts` | mock fixtures incl. a non-image file |

`hasAssets`/`hasCover` derive from `NESTED_TYPES` already
(`page-computeds.ts`), so the AssetManager appears for archive automatically.

### 2.2 Download control

The download action is added to the shared AssetManager (benefits every
section, satisfies R1.4–R1.6 for archive):

- **`src/components/AssetManager/icons/DownloadIcon.vue`** (new) — inline SVG,
  `aria-hidden`, `currentColor`, 24×24 viewBox, ~18px rendered, matching the
  existing icon convention.
- **`src/composables/useAssets/download-asset.ts`** (new) — pure helper:
  ```
  downloadAsset({ path, name, blobUrl }):
    url = blobUrl ?? await resolveAssetUrl(path)   // pending vs committed
    anchor = <a href=url download=name>; click(); remove()
  ```
  Reuses `resolveAssetUrl` (SW fetch → cached blob URL). No new SW protocol.
- **`AssetActions.vue`** — add a download icon-button (`type=button`,
  `aria-label="Download <name>"`, `data-testid=ASSET_DOWNLOAD_ID`) emitting
  `download`. `AssetThumbnail.vue` forwards it with `{ path, name, blobUrl }`;
  the parent (`useAssetHandlers`) calls `downloadAsset`.
- **`test-ids.ts`** — `ASSET_DOWNLOAD_ID = 'asset-download'`.

The control shows for every non-deleted asset (committed and pending-add);
pending uses the in-memory `blobUrl`, committed resolves via SW.

### 2.3 Accessibility & mobile

Icon-button: ≥44px hit area (padding), `:focus-visible` accent outline,
visible on `@media (hover: none)` like the existing actions. Accessible name
includes the filename to stay unique and avoid the `view/save/new` collisions.

## 3. Iteration 2 — Viewer

- **`src/components/FileViewer/FileViewer.vue`** — `<dialog>`-based modal
  (native focus trap + Escape), `aria-modal`, `role=dialog`, `::backdrop`
  dimmer, `--z-modal`. Props: `files: ViewerFile[]`, `index`, emits
  `close`/`update:index`. A `ViewerFile` is `{ name, mimeType, url(s) }` — the
  component never fetches.
- **Supported-type check** = `mimeType` starts with `image/`. Unsupported →
  `FileViewerUnsupported.vue` (pictogram by type + filename + download).
- **Image rendering** = responsive `<picture>`/`<img>` fit to viewport
  (`max-width/height: 100%`, `object-fit: contain`), `decoding=async`.
- Reduced-motion: open/close transition collapses to ~0ms.
- AssetThumbnail gains a view icon-button (image types only) → ContentEditView
  owns viewer open-state + current index.

## 4. Iteration 3 — Navigation

- Prev/next icon-buttons (`ChevronLeftIcon`/`ChevronRightIcon`), disabled at
  ends. Keyboard: ArrowLeft/ArrowRight on the dialog. Touch: `pointerdown/up`
  delta past ~50px threshold (no library).
- Lazy strategy: current `loading=eager`, immediate neighbors prefetched, rest
  `loading=lazy`; `<picture>` with `width/height` for intrinsic sizing.
- Polite `aria-live` region announces "file N of M".

## 5. Iteration 4 — Fullscreen

- Fullscreen toggle uses `requestFullscreen()` on the dialog container with a
  graceful no-op fallback (modal already fills the viewport). State tracked via
  `fullscreenchange`. Escape semantics: exit fullscreen first, then close.

## 6. Iteration 5 — Embed widget

- **Admin:** `archive` reference field added to `fields-blog.ts` /
  `fields-positions.ts` via a new `archive-ref` field type backed by an
  `ArchivePicker.vue` (lists archive items from the content store). Persists
  `archive: <slug>` in frontmatter.
- **Content schema:** `blog`/`positions` collections gain optional `archive`
  slug; new `archive` collection (`title`, `description?`, `published?`,
  `publishDate?`, `lang`).
- **public-website:**
  - `@astrojs/vue` integration; mount the viewer core as `client:visible`.
  - `ArchiveWidget.astro` slotted before `SuggestChangesLink` in blog/position
    pages; first image via existing `BlogPicture` presets, rest lazy.
  - `archive` listing (`/[lang]/archive/`) + detail (`/[lang]/archive/[slug]`)
    pages, mirroring blog; `DownloadLink`-style controls per file.
  - `src/integrations/archive-files/` build hook copying
    `archive/{slug}/assets/*` → `dist/archive/{slug}/assets/*` (model:
    `magazine-pdfs`), reading sizes at build time.
  - i18n labels (`archiveTitle`, `openViewer`, `downloadFile`, …) + a feature
    flag in `settings/features.json`.

## 7. Testing strategy

- **Unit:** `download-asset` (picks blobUrl vs resolveAssetUrl, sets `download`
  attr); path resolver for `archive`; viewer supported/unsupported branch;
  navigation bounds; schema validation (public).
- **E2E (admin):** create archive item → upload an image + a non-image →
  assert both download controls present with correct accessible names →
  (it2+) open viewer, navigate, fullscreen.
- **E2E (public, it5):** build renders a referencing article with the widget;
  widget opens viewer; archive page lists downloads.
- Full stable pass, zero retries, mobile-viewport screenshot of viewer/widget.
