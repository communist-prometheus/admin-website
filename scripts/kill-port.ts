import { execSync } from 'node:child_process'
import process from 'node:process'

const port = process.argv[2] ?? '3000'

/**
 * Kill any process listening on the given port.
 * @param p - Port number as string
 */
const killPort = (p: string): void => {
  try {
    if (process.platform === 'win32') {
      const out = execSync(
        `netstat -ano | findstr :${p} | findstr LISTENING`,
        { encoding: 'utf8' }
      )
      const pids = new Set(
        out
          .trim()
          .split('\n')
          .map(l => l.trim().split(/\s+/).pop())
          .filter(Boolean)
      )
      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, {
          stdio: 'ignore',
        })
      }
    } else {
      execSync(`fuser -k ${p}/tcp`, { stdio: 'ignore' })
    }
  } catch {
    /* no process on port — nothing to kill */
  }
}

killPort(port)
