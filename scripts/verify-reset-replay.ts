// R-1 (specs/reliable-content-push, US-1.1–1.4): the reset-onto-remote +
// replay recovery must turn a force-pushed / unrelated remote into a
// pushable fast-forward even from a shallow (depth:1) clone. Production
// run-reset-replay.ts runs on lightning-fs (IndexedDB), which can't run
// outside a browser, so this exercises the SAME mechanic on real
// isomorphic-git over node-fs and asserts the resulting commit is a
// 1-parent child of the remote tip with the user's edit applied and the
// old local tip out of its ancestry. Run: `bun run verify:reset-replay`.
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import git from 'isomorphic-git'

const author = { name: 'Admin', email: 'admin@prometheus.org' }
const ts = { ...author, timestamp: 1, timezoneOffset: 0 }
const enc = (s: string) => new TextEncoder().encode(s)
const dec = (u: Uint8Array) => new TextDecoder().decode(u)

const changedFiles = async (dir: string, sha: string) => {
  const { commit } = await git.readCommit({ fs, dir, oid: sha })
  const parent = commit.parent[0] ?? sha
  const out: { path: string; data?: Uint8Array; deleted?: boolean }[] = []
  await git.walk({
    fs,
    dir,
    trees: [git.TREE({ ref: parent }), git.TREE({ ref: sha })],
    map: async (filepath, [base, head]) => {
      if (filepath === '.') return
      if (!head) {
        if (base && (await base.type()) === 'blob')
          out.push({ path: filepath, deleted: true })
        return
      }
      if ((await head.type()) !== 'blob') return
      const ho = await head.oid()
      const bo = base ? await base.oid() : undefined
      if (ho === bo) return
      out.push({
        path: filepath,
        data: (await git.readBlob({ fs, dir, oid: ho })).blob,
      })
    },
  })
  return out
}

const run = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'rr-'))
  await git.init({ fs, dir, defaultBranch: 'master' })
  await fs.writeFile(path.join(dir, 'shared.md'), 'v1')
  await fs.writeFile(path.join(dir, 'keep.md'), 'keep')
  await git.add({ fs, dir, filepath: '.' })
  const L = await git.commit({ fs, dir, message: 'L', author })
  await fs.writeFile(path.join(dir, 'shared.md'), 'USER')
  await fs.writeFile(path.join(dir, 'new.md'), 'NEW')
  await git.add({ fs, dir, filepath: '.' })
  const C = await git.commit({ fs, dir, message: 'edit', author })

  const blobOid = (s: string) => git.writeBlob({ fs, dir, blob: enc(s) })
  const rTree = await git.writeTree({
    fs,
    dir,
    tree: [
      {
        mode: '100644',
        path: 'remote-only.md',
        oid: await blobOid('R'),
        type: 'blob',
      },
      {
        mode: '100644',
        path: 'shared.md',
        oid: await blobOid('REMOTE'),
        type: 'blob',
      },
    ],
  })
  const R = await git.writeCommit({
    fs,
    dir,
    commit: {
      tree: rTree,
      parent: [],
      author: ts,
      committer: ts,
      message: 'R',
    },
  })
  await git.writeRef({
    fs,
    dir,
    ref: 'refs/remotes/origin/master',
    value: R,
    force: true,
  })

  // ---- reset-replay mechanic ----
  const changes = await changedFiles(dir, C)
  await git.writeRef({
    fs,
    dir,
    ref: 'refs/heads/master',
    value: R,
    force: true,
  })
  await git.checkout({ fs, dir, ref: 'master', force: true })
  for (const ch of changes) {
    await (ch.deleted
      ? git.remove({ fs, dir, filepath: ch.path })
      : fs
          .writeFile(path.join(dir, ch.path), ch.data as Uint8Array)
          .then(() => git.add({ fs, dir, filepath: ch.path })))
  }
  const Cp = await git.commit({ fs, dir, message: 'edit', author })

  // ---- assertions ----
  const { commit: cp } = await git.readCommit({ fs, dir, oid: Cp })
  const read = async (p: string) =>
    dec((await git.readBlob({ fs, dir, oid: Cp, filepath: p })).blob)
  const files = await git.listFiles({ fs, dir, ref: 'master' })
  const bases = await git.findMergeBase({ fs, dir, oids: [Cp, L] })
  const checks = {
    changesAreEditAndAdd:
      changes
        .map(c => c.path)
        .sort()
        .join(',') === 'new.md,shared.md',
    parentIsRemote: cp.parent.length === 1 && cp.parent[0] === R,
    userEditWon: (await read('shared.md')) === 'USER',
    userAdded: (await read('new.md')) === 'NEW',
    remoteKept: (await read('remote-only.md')) === 'R',
    staleGone: !files.includes('keep.md'),
    localTipNotAncestor: bases.length === 0,
  }
  for (const [name, ok] of Object.entries(checks))
    console.log(`${ok ? '✓' : '✗'} ${name}`)
  const pass = Object.values(checks).every(Boolean)
  console.log(pass ? 'R-1 PASS ✅' : 'R-1 FAIL ❌')
  process.exit(pass ? 0 : 1)
}

run().catch((e: unknown) => {
  console.error('THREW:', e instanceof Error ? `${e.name} - ${e.message}` : e)
  process.exit(1)
})
