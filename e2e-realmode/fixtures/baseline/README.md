# admin-e2e-sandbox baseline

Snapshot of content used by the admin-website real-mode E2E suite.

These files seed the sandbox repository on first setup
(`bun scripts/setup-e2e-sandbox.ts`) and are restored before every
suite run via `bun scripts/reset-e2e-sandbox.ts`. Tests push to a
working branch — never to the `baseline` tag.

Frontmatter shapes mirror `public-website-content` collection schemas
the admin app validates before commit.
