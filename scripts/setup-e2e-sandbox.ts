import 'dotenv/config'
import process from 'node:process'
import { loadBaselineFiles } from './sandbox-baseline-files'
import { readSandboxConfig, type SandboxConfig } from './sandbox-config'
import {
  createBlob,
  createCommit,
  createRef,
  createRepo,
  createTree,
  getRef,
  getRepo,
  updateRef,
} from './sandbox-gh'

const log = (s: string): void => process.stdout.write(`${s}\n`)
const force = process.argv.includes('--force')

const seedBaseline = async (
  cfg: SandboxConfig,
  parentSha: string
): Promise<string> => {
  const files = loadBaselineFiles()
  log(`uploading ${files.length} baseline blobs…`)
  const blobs = await Promise.all(
    files.map(f => createBlob(cfg, f.path, f.content))
  )
  const treeSha = await createTree(cfg, blobs)
  return createCommit(cfg, treeSha, 'baseline: seed sandbox content', [
    parentSha,
  ])
}

const ensureRepo = async (cfg: SandboxConfig): Promise<boolean> => {
  const existing = await getRepo(cfg)
  if (existing) {
    log(`repo ${cfg.owner}/${cfg.repo} exists — skipping create.`)
    return false
  }
  log(`creating repo ${cfg.owner}/${cfg.repo}…`)
  await createRepo(cfg)
  return true
}

const ensureBranchAndTag = async (
  cfg: SandboxConfig,
  baselineSha: string
): Promise<void> => {
  if (await getRef(cfg, `heads/${cfg.branch}`)) {
    log(`force-resetting heads/${cfg.branch} to ${baselineSha.slice(0, 7)}`)
    await updateRef(cfg, `heads/${cfg.branch}`, baselineSha)
  } else {
    log(`creating heads/${cfg.branch} at ${baselineSha.slice(0, 7)}`)
    await createRef(cfg, `refs/heads/${cfg.branch}`, baselineSha)
  }
  if (await getRef(cfg, `tags/${cfg.baselineTag}`)) {
    log(`force-moving tag ${cfg.baselineTag} to ${baselineSha.slice(0, 7)}`)
    await updateRef(cfg, `tags/${cfg.baselineTag}`, baselineSha)
    return
  }
  log(`creating tag ${cfg.baselineTag} at ${baselineSha.slice(0, 7)}`)
  await createRef(cfg, `refs/tags/${cfg.baselineTag}`, baselineSha)
}

const waitForRef = async (cfg: SandboxConfig): Promise<string> => {
  /* Brand-new repos take a moment for `auto_init` to populate the
   * default branch. Poll briefly so the first run does not race. */
  for (let i = 0; i < 20; i += 1) {
    const sha = await getRef(cfg, `heads/${cfg.branch}`)
    if (sha) return sha
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error(`heads/${cfg.branch} never appeared on new repo`)
}

const main = async (): Promise<void> => {
  const cfg = readSandboxConfig()
  log(`sandbox: ${cfg.owner}/${cfg.repo}@${cfg.branch}`)
  const created = await ensureRepo(cfg)
  if (!created && !force) {
    const head = await getRef(cfg, `heads/${cfg.branch}`)
    const tag = await getRef(cfg, `tags/${cfg.baselineTag}`)
    if (head && tag) {
      log(
        'repo + branch + baseline tag already provisioned. ' +
          'Re-run with --force to refresh the baseline from fixtures.'
      )
      return
    }
  }
  if (force) log('--force: re-seeding baseline from fixtures')
  const parentSha = await waitForRef(cfg)
  const baselineSha = await seedBaseline(cfg, parentSha)
  await ensureBranchAndTag(cfg, baselineSha)
  log(`done. baseline=${baselineSha}`)
}

main().catch(err => {
  process.stderr.write(
    `${err instanceof Error ? err.message : String(err)}\n`
  )
  process.exit(1)
})
