# Bug List — Deploy & Content

## 1. Deploy detail page (NEW FEATURE)
**Current:** Deploy cards on home page show minimal info, no way to see full changes or errors.
**Desired:** Separate route `/deploy/:sha` showing: full file diff, commit message, build log link, error details for failed builds.
**Priority:** HIGH — needed to debug other issues.

## 2. Deploy status badge stuck on "queued"
**Current:** Badge shows "queued" even after progress bar turns green (completed). Never updates to "success" or "failure".
**Desired:** Badge updates reactively as check run status changes.
**Root cause:** Badge is set once from initial `fetchCommitBuilds` and never re-polled. Only `DeployDetailProgress` polls, but it doesn't update the parent list.

## 3. Progress bar turns green too early
**Current:** Bar fills to ~50%, then jumps to green (completed) while build is still running. Or bar shows green but status is "failure".
**Desired:** Bar should be green ONLY on success, red on failure. Should track actual completion, not just time.
**Root cause:** `calcProgress` is time-based (2min estimate). If CF build completes faster, bar jumps. Also bar turns green for ANY `completed` status including `failure`.

## 4. Failed builds show green bar
**Current:** Failed builds show green progress bar (100%).
**Desired:** Failed builds should show red bar.
**Root cause:** `DeployProgressTrack` color mapping: `completed` always = green. Should check `conclusion` (success vs failure).

## 5. Create article commit message uses filename
**Current:** Commit message: "Create index.en.md"
**Desired:** "Create {title} in {type}" or "Create {slug} in blog"
**Root cause:** `useContentCreator.ts` line 30: `Create ${fileName}` where fileName = `index.en.md`.

## 6. Test article "test" shows empty content but old assets
**Current:** Article "test" has assets from before but body is empty after re-clone.
**Desired:** Content should match what's in the repo.
**Root cause:** Likely the article was created with empty body, or the file path resolution is wrong (we saw `index..md` double-dot issue earlier — missing lang).
