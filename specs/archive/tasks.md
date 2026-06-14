# Archive — Tasks

> **Status:** DRAFT — phase 3 of three. Traces every task to a requirement.
> Iterations ship independently; each must be green before the next.

## Iteration 1 — Section, upload, download (this PR)

- [ ] **T1.1** Register `archive` in the type union / values / `NESTED_TYPES`
      (`content-type.ts`). _(R1.7)_
- [ ] **T1.2** Add `archive` to `CONTENT_SECTIONS` routing. _(R1.7)_
- [ ] **T1.3** Add the archive nav entry, editor-visible. _(R1.1, R1.8)_
- [ ] **T1.4** Add `archive` to `content-paths.ts` and SW `content/base.ts`
      `NESTED_TYPES`. _(R1.7)_
- [ ] **T1.5** `fields-archive.ts` (title, description, published, publishDate)
      + register in `frontmatter-fields.ts` + `field-definitions.ts`. _(R1.2)_
- [ ] **T1.6** Mock fixtures: an archive item with one image + one non-image
      file; wire into `all-entries.ts`. _(R1.1, R1.3, E2E)_
- [ ] **T1.7** `DownloadIcon.vue`. _(R1.4)_
- [ ] **T1.8** `download-asset.ts` helper + unit test. _(R1.5)_
- [ ] **T1.9** Download icon-button in `AssetActions.vue`, forwarded through
      `AssetThumbnail.vue`, handled in `useAssetHandlers`; `ASSET_DOWNLOAD_ID`
      test-id. _(R1.4–R1.6, R8.2)_
- [ ] **T1.10** E2E: create archive item, upload image + non-image, assert
      both download controls + accessible names. _(R1.1–R1.6, R8.5)_
- [ ] **T1.11** Verify build / lint / type-check / unit / full stable E2E;
      MCP-browser smoke at desktop + 360px. _(R8.3, R8.5)_

## Iteration 2 — Viewer

- [ ] **T2.1** `FileViewer.vue` (`<dialog>`, focus trap, Escape, backdrop).
      _(R2.2–R2.4)_
- [ ] **T2.2** `FileViewerUnsupported.vue` (pictogram + name + download).
      _(R2.5)_
- [ ] **T2.3** `ViewIcon.vue` + view button on image thumbnails; open-state in
      ContentEditView. _(R2.1)_
- [ ] **T2.4** Viewport-fit image render, `decoding=async`, reduced-motion.
      _(R2.6)_
- [ ] **T2.5** Unit (supported/unsupported branch) + E2E (open/close/Escape) +
      mobile screenshot. _(R8.3, R8.5)_

## Iteration 3 — Navigation

- [ ] **T3.1** `ChevronLeftIcon`/`ChevronRightIcon` + prev/next buttons,
      end-disabled. _(R3.1)_
- [ ] **T3.2** Arrow-key handlers on the dialog. _(R3.2)_
- [ ] **T3.3** Pointer swipe with threshold. _(R3.3)_
- [ ] **T3.4** Lazy/prefetch strategy + responsive `<picture>` intrinsic
      sizing. _(R3.5)_
- [ ] **T3.5** Polite live region "file N of M". _(R3.6)_
- [ ] **T3.6** E2E (click/arrow/swipe nav, bounds, unsupported mid-stream).
      _(R3.4, R8.5)_

## Iteration 4 — Fullscreen

- [ ] **T4.1** Fullscreen toggle + `requestFullscreen` w/ fallback. _(R4.1,
      R4.2)_
- [ ] **T4.2** Keep controls/live-region operable; Escape precedence. _(R4.3,
      R4.4)_
- [ ] **T4.3** E2E (enter/exit, Escape precedence). _(R8.5)_

## Iteration 5 — Embed widget

- [ ] **T5.1** `archive-ref` field type + `ArchivePicker.vue`; add to
      blog/positions fields. _(R5.1, R5.2)_
- [ ] **T5.2** Content schema: `archive` collection + optional `archive` slug
      on blog/positions. _(R5.2, R5.3)_
- [ ] **T5.3** public-website `@astrojs/vue`; viewer core as island. _(R5.4)_
- [ ] **T5.4** `ArchiveWidget.astro` in blog/position pages; first image
      prominent, rest lazy. _(R5.3, R5.6)_
- [ ] **T5.5** Archive listing + detail pages; per-file download. _(R5.5)_
- [ ] **T5.6** `archive-files` build integration (copy assets, read sizes).
      _(R5.3, R5.5)_
- [ ] **T5.7** i18n labels + feature flag. _(R8.1)_
- [ ] **T5.8** Missing/unpublished reference omits widget. _(R5.7)_
- [ ] **T5.9** E2E (widget renders, opens viewer, archive link) + mobile
      screenshot. _(R5.6, R8.3, R8.5)_

## Traceability

Every requirement R1.*–R5.*, R8.* maps to at least one task above. R8.1/R8.2/
R8.4 are satisfied within each surface's task rather than as standalone items.
