# Archive — Requirements

> **Status:** DRAFT — phase 1 of three (requirements → design → tasks).
>
> _Pause for review at the end of this file before moving to design.md._

## 1. Overview

Add an **Archive** content section to the platform: a place where editors
upload arbitrary files (images, archives, documents, datasets) grouped into
named **archive items** (albums), and where those files can be downloaded,
previewed, and — eventually — embedded into articles and positions through a
gallery widget.

The work is split into five sequential **iterations**, each shippable and
green on its own. The first delivers management + download; later ones layer a
viewer, navigation, fullscreen, and an article-embed widget.

This spec spans three deployable units, but not every iteration touches all of
them:

1. **admin-website** — a new nested content section `archive`, reusing the
   existing content store / create dialog / AssetManager; the file viewer
   (lightbox) lives here too.
2. **public-website-content** — archive items stored as
   `archive/{slug}/index.{lang}.md` + `archive/{slug}/assets/*`, mirroring the
   blog/positions layout.
3. **public-website** — an `archive` content collection, listing + detail
   pages, a build-time asset-copy integration, and the article/position embed
   widget.

Out of scope across all iterations: file editing/transformation (crop, rotate,
re-encode) beyond what upload already does; video/audio playback inside the
viewer (they keep the existing inline `<video>/<audio>` controls); access
control on individual files beyond the section's role gate; archive-to-archive
linking.

## 2. Glossary

| Term | Meaning |
|---|---|
| **Archive item** | One album: a folder `archive/{slug}/` with a localized `index.{lang}.md` (title, description, metadata) and an `assets/` directory of files |
| **File** | One asset under an archive item's `assets/` — any uploaded binary |
| **Viewer** | The lightbox overlay that previews a file; images render full-bleed, unsupported types render a type pictogram + download |
| **Widget** | The embedded mini-viewer placed at the foot of an article/position, expandable to fullscreen or linkable to the archive page |
| **Supported type** | A file the viewer renders inline (iteration 2 scope: raster + SVG images). Everything else is an *unsupported type* |

## 3. Iteration 1 — Section, upload, download

> **As** an editor,
> **I want** an Archive section where I can create archive items and upload any
> kind of file into them, each file offering a one-click download,
> **so that** I can manage a library of downloadable material.

#### Acceptance criteria (EARS)

- **R1.1** WHEN an authenticated editor opens `/content/archive` THE SYSTEM SHALL render the archive items list using the same list/grid chrome as the other content sections.
- **R1.2** WHEN the editor creates an archive item via the create dialog with a valid slug + title THE SYSTEM SHALL stage `archive/{slug}/index.{lang}.md` with the title/description frontmatter and route to its edit page.
- **R1.3** WHILE editing an archive item THE SYSTEM SHALL present the AssetManager so the editor can upload one or more files of any allowed type into `archive/{slug}/assets/`.
- **R1.4** WHERE a file is present in an archive item (committed or pending) THE SYSTEM SHALL render a download control bearing a download pictogram and an accessible name of the form "Download <filename>".
- **R1.5** WHEN the editor activates a file's download control THE SYSTEM SHALL trigger a browser download of that exact file under its original filename, without navigating away.
- **R1.6** WHERE a file is not an inline-previewable image THE SYSTEM SHALL still render the download control (download is the universal action in iteration 1).
- **R1.7** THE SYSTEM SHALL register `archive` as a nested content type everywhere a section is enumerated (type union, routing, navigation, path resolver, service-worker handler, mock fixtures) so listing/create/edit/publish/delete all work with no section-specific branches.
- **R1.8** THE archive navigation entry SHALL respect the same role model as the other sections; absent a stricter decision it is editor-visible.

## 4. Iteration 2 — Image viewer

> **As** a viewer of an archive item,
> **I want** to open a file in a viewer,
> **so that** I can see images large without downloading them, and still get a
> clear download path for files the viewer can't render.

#### Acceptance criteria (EARS)

- **R2.1** WHERE a file is a supported image type THE SYSTEM SHALL render a view control bearing a view pictogram with the accessible name "Open <filename> in viewer".
- **R2.2** WHEN the view control is activated THE SYSTEM SHALL open the viewer as a modal overlay showing the image fit to the viewport, with the page behind it inert.
- **R2.3** WHEN the viewer opens THE SYSTEM SHALL move focus into the viewer, trap focus within it, and restore focus to the invoking control on close.
- **R2.4** WHEN the user presses Escape OR activates the close control THE SYSTEM SHALL close the viewer.
- **R2.5** WHERE the opened file is an unsupported type THE SYSTEM SHALL render the file-type pictogram, the filename, and a download control inside the viewer instead of attempting to display it.
- **R2.6** THE viewer SHALL load the displayed image at a resolution appropriate to the viewport (no multi-megabyte original forced into a thumbnail), honoring `prefers-reduced-motion` for its open/close transition.

## 5. Iteration 3 — Navigation

> **As** a viewer with the viewer open,
> **I want** to move to the previous/next file,
> **so that** I can browse the whole archive item without reopening.

#### Acceptance criteria (EARS)

- **R3.1** WHILE the viewer is open THE SYSTEM SHALL expose previous/next controls with accessible names "Previous file" / "Next file", disabled at the respective ends (no wrap, unless design later opts into wrap).
- **R3.2** WHILE the viewer is open THE SYSTEM SHALL advance on ArrowRight and retreat on ArrowLeft.
- **R3.3** WHILE the viewer is open on a touch device THE SYSTEM SHALL advance on left-swipe and retreat on right-swipe past a sensible threshold.
- **R3.4** WHEN navigating to an unsupported-type file THE SYSTEM SHALL show its pictogram + download per R2.5 rather than a broken image.
- **R3.5** WHILE navigating THE SYSTEM SHALL lazy-load non-current images (current eager, neighbors prefetched, far images deferred) using a responsive `<picture>` with intrinsic sizing to avoid layout shift.
- **R3.6** THE SYSTEM SHALL announce the current position ("file N of M") to assistive technology on each change via a polite live region.

## 6. Iteration 4 — Fullscreen

> **As** a viewer,
> **I want** to take the viewer fullscreen,
> **so that** I can see images at maximum size.

#### Acceptance criteria (EARS)

- **R4.1** WHILE the viewer is open THE SYSTEM SHALL expose a fullscreen toggle ("Enter fullscreen" / "Exit fullscreen").
- **R4.2** WHEN fullscreen is requested THE SYSTEM SHALL use the Fullscreen API on the viewer container, falling back gracefully (the modal already covers the viewport) where the API is unavailable or rejected.
- **R4.3** WHILE fullscreen THE SYSTEM SHALL keep all navigation, the live region, and the close/exit controls operable.
- **R4.4** WHEN the user exits fullscreen (control, Escape, or browser UI) THE SYSTEM SHALL return to the windowed modal without closing the viewer, and a subsequent Escape SHALL close the modal.

## 7. Iteration 5 — Article / position embed widget

> **As** an editor authoring an article or position,
> **I want** to attach an existing archive item to it,
> **so that** readers see a gallery widget at the foot of the piece that they
> can expand or follow to the archive page.

#### Acceptance criteria (EARS)

- **R5.1** WHILE editing a blog article or position THE SYSTEM SHALL offer an archive picker that lists existing archive items by title (a selection interface, not free-text path entry).
- **R5.2** WHEN the editor selects an archive item THE SYSTEM SHALL persist its slug into the piece's frontmatter as an `archive` reference.
- **R5.3** WHERE a published piece references an archive item THE public-website SHALL render a widget at the foot of the article/position showing a mini version of the viewer (first image prominent, the rest as thumbnails).
- **R5.4** WHEN a reader activates the widget THE SYSTEM SHALL open the full viewer (iterations 2–4) over the page.
- **R5.5** THE widget SHALL provide a link to the standalone archive page for that item.
- **R5.6** THE widget SHALL lazy-load every image past the first with responsive `<picture>` + intrinsic sizing, and SHALL be fully keyboard- and screen-reader-operable.
- **R5.7** WHERE the referenced archive item does not exist or is unpublished THE public build SHALL omit the widget rather than fail.

## 8. Cross-cutting requirements (all iterations)

- **R8.1 — Design fidelity.** Every surface SHALL use the existing design tokens, card/grid/dialog primitives, and icon conventions; no new color or spacing values outside the token set.
- **R8.2 — Accessibility.** All controls SHALL be reachable and operable by keyboard, carry non-colliding accessible names (avoid bare "view"/"save"/"new"/"create"/"delete" per the repo's test-locator hygiene), expose state via ARIA, respect `prefers-reduced-motion`, and meet AA contrast.
- **R8.3 — Mobile.** Every surface SHALL be usable at a 360px viewport: touch targets ≥44px, swipe where specified, no horizontal scroll; the viewer and widget SHALL be verified at a mobile viewport with a screenshot.
- **R8.4 — Performance.** Images beyond the first visible one SHALL be lazy-loaded; the viewer and widget SHALL use responsive `<picture>` with width-appropriate sources and intrinsic dimensions to prevent layout shift and oversized downloads.
- **R8.5 — Quality gate.** Each iteration SHALL ship with unit + E2E coverage, pass build/lint/type-check, and survive a full stable E2E pass (zero retries) before merge.

## 9. Open decisions (resolve in design.md)

1. **Viewer framework reuse across repos.** The viewer is Vue in the admin; the public widget runs in Astro. Decide: shared Vue island (requires `@astrojs/vue` on public-website) vs. a framework-light viewer core consumed by both.
2. **Archive item frontmatter shape.** Minimum is `title` + optional `description`; decide whether to add `category`, `published`, `publishDate` for parity with blog, and an optional per-file caption/order manifest.
3. **Role gate.** Editor-visible (like blog) vs. chief-editor (like positions). Default: editor-visible.
4. **Public exposure timing.** The public archive listing/detail pages are required by iteration 5 (the widget links to them). Decide whether to bring them forward to accompany the viewer or keep them at iteration 5.
