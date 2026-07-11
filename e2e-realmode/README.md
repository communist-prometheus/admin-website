# Real-mode E2E

Tests in this directory drive the production build of admin-website
against a real GitHub repository. The Service Worker actually clones,
stages, and pushes — so a save regression here is the same defect a
user would see in production.

## Why it exists

The default suite (`bun run test:e2e`) runs with `MOCK_OAUTH=true`. The
SW git layer is replaced with an in-memory mock, the auth flow is
short-circuited, and `/api/cors` is never exercised. That is fast and
deterministic, but it cannot fail when the **real** save chain breaks
(e.g. a CORS-proxy URL regression, a frontmatter serializer crash on
real YAML, an isomorphic-git push rejection). Real-mode plugs that
gap — every spec talks to a real fork.

## One-time setup

```sh
# .env must contain GITHUB_E2E_KEY (PAT with `repo` scope)
bun run sandbox:setup
```

Defaults to `communist-prometheus/admin-e2e-sandbox`, branch `main`,
baseline tag `baseline`. Override via `SANDBOX_OWNER`, `SANDBOX_REPO`,
`SANDBOX_BRANCH`, `SANDBOX_BASELINE_TAG`.

## Running locally

```sh
bun run sandbox:reset       # force-reset main → baseline
bun run test:e2e:realmode   # build + preview + run
```

`playwright.config.realmode.ts` calls `globalSetup` which performs the
reset automatically, so the explicit `sandbox:reset` is only needed
when you want a clean slate without invoking Playwright.

If you already have a server running with the realmode build, point
tests at it via `REALMODE_BASE_URL=http://localhost:5173`.

## What's covered

Each spec drives the production preview bundle through a real user
flow. Every test verifies a sandbox-side artefact (HEAD advance + the
exact file path that should land on `main`) — the UI claim "saved" is
not enough.

| Spec | What it proves |
| --- | --- |
| `save-blog.spec.ts` | Edit → Preview → Save → Confirm pushes a real commit to `blog/welcome/index.en.md`, and the committed bytes parse against astro's collection schema |
| `create-blog.spec.ts` | New blog dialog → editor → Save commits a fresh `blog/<slug>/index.en.md` that astro accepts |
| `delete-blog.spec.ts` | Card → Delete → "Delete only en" removes a single language file |
| `delete-all-langs.spec.ts` | Card → Delete → "Delete all languages" removes the whole slug directory |
| `rename-blog.spec.ts` | Inline slug rename rewrites the directory in a single commit |
| `asset-upload.spec.ts` | Asset picker stages a binary, Save commits to `blog/<slug>/assets/<file>.png` |
| `magazine-fb2.spec.ts` | FB2 dropzone commits `magazine/<slug>/assets/<slug>.<lang>.fb2`, and the issue index passes astro's magazine schema |
| `schema-gate.spec.ts` | SW rejects writes whose filename lang is outside `supportedLangs`, and writes whose frontmatter `lang` disagrees with the filename |
| `astro-schema-drift.spec.ts` | Vendored astro mirror has the same collection + field set as upstream `public-website/src/content.config.ts` |

### Three layers of protection

The 2026-05-09 prod incident (admin commits with `lang: uk` astro
rejected → 6 hours of red deploys) is now blocked at three independent
layers:

1. **SW gate** (`src/sw/handlers/file/validate-stage.ts`) — admin
   refuses to even stage a payload that fails the per-type schema or
   has an out-of-set `lang`. Verified by `schema-gate.spec.ts`.
2. **Astro contract** (`assertAstroAccepts` in
   `helpers/astro-validate.ts`) — every save / create test parses the
   committed bytes through the vendored astro schema. If admin somehow
   ships something the build can't accept, the test goes red on the
   PR.
3. **Drift detector** (`astro-schema-drift.spec.ts`) — keeps the
   vendored mirror honest. When upstream renames / retypes a field,
   the next CI run for any PR fails with a precise diff and the
   mirror has to be updated before merge.

A new field on either side requires touching all three (vendored
mirror + admin schema + admin gate). That is the cost of cheap
cross-repo correctness.

Pending coverage (not yet wired as separate specs because the
fixtures are heavier — a real PDF with an extractable cover, a real
DOCX that mammoth converts to FB2):

- PDF upload + cover extraction commit
- DOCX import → auto-converted FB2 commit
- Cover upload via the cover slot button
- Paste-image path (clipboard event)
- Drop-image path (DataTransfer)
- Positions / pages / common variants of save / create / delete

Add new specs to this directory; `globalSetup` already resets the
sandbox before every run.

## CI

`.github/workflows/realmode-e2e.yml` runs on every PR to `master` /
`develop` (and on pushes to those branches). The job:

1. Resets the sandbox branch to baseline.
2. Builds admin-website with sandbox repo coordinates baked in.
3. Runs the suite serially against `vite preview`.

`workers: 1` and a `concurrency: realmode-e2e` group prevent two
runs from racing for the same sandbox branch.

## Troubleshooting

- **`Failed to fetch` during init** — `vite preview` is not serving
  `/api/cors`. Check `vite/token-proxy.ts` still has
  `configurePreviewServer`.
- **403 / 404 on sandbox setup** — PAT lacks `repo` scope on the
  sandbox owner, or the org disallows repo creation by the PAT user.
- **Tests hang at editor load** — SW is still cloning (first run
  against a fresh sandbox is slow). Subsequent runs reuse IndexedDB.
- **Random commit failures on rerun** — concurrency: another run
  pushed between this run's clone and stage. Reset sandbox and rerun.
