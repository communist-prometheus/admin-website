import 'dotenv/config'
import { execSync } from 'node:child_process'

const token = process.env.GITHUB_E2E_KEY
if (!token) {
  console.error('Set GITHUB_E2E_KEY in .env')
  process.exit(1)
}

execSync('npx vite', {
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_TOKEN: token },
})
