import { config } from 'dotenv'

config()

const accountId = process.env.VITE_CF_ACCOUNT_ID
const apiToken = process.env.VITE_CF_API_TOKEN
const scriptName = 'admin-website'

if (!accountId || !apiToken) {
  console.error('Missing VITE_CF_ACCOUNT_ID or VITE_CF_API_TOKEN in .env')
  process.exit(1)
}

const baseUrl =
  `https://api.cloudflare.com/client/v4/accounts/${accountId}`

const headers = { Authorization: `Bearer ${apiToken}` }

interface Version {
  readonly id: string
  readonly created_on: string
  readonly annotations?: Record<string, string>
}

interface Deployment {
  readonly id: string
  readonly created_on: string
  readonly source: string
  readonly versions: readonly { readonly version_id: string; readonly percentage: number }[]
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { headers })
  const data = await res.json() as { result: T }
  return data.result
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })

const run = async () => {
  const { deployments } = await fetchJson<{ deployments: readonly Deployment[] }>(
    `${baseUrl}/workers/scripts/${scriptName}/deployments`
  )

  const latest = deployments[0]
  if (!latest) {
    console.log('No deployments found')
    return
  }

  const versionId = latest.versions[0]?.version_id
  const version = versionId
    ? await fetchJson<Version>(
        `${baseUrl}/workers/scripts/${scriptName}/versions/${versionId}`
      )
    : undefined

  console.log('=== Latest Deployment ===')
  console.log(`  ID:      ${latest.id}`)
  console.log(`  Source:  ${latest.source}`)
  console.log(`  Date:    ${formatDate(latest.created_on)}`)

  if (version) {
    console.log(`  Version: ${version.id}`)
    console.log(`  Created: ${formatDate(version.created_on)}`)
    const msg = version.annotations?.['workers/message']
    if (msg) console.log(`  Message: ${msg}`)
  }

  console.log(`\n=== Recent Deployments ===`)
  for (const d of deployments.slice(0, 5)) {
    const pct = d.versions.map(v => `${v.percentage}%`).join(', ')
    console.log(`  ${formatDate(d.created_on)}  [${d.source}]  ${pct}`)
  }
}

run().catch(console.error)
