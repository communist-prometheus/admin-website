#!/usr/bin/env bun
/**
 * Create settings/labels.json in the real repo.
 * Requires dev server running: bun run dev:token
 */
import 'dotenv/config'

const BASE = 'http://localhost:5173'
const PATH = 'settings/labels.json'

const labels = [
  {
    key: 'technology',
    translations: {
      en: 'Technology',
      ru: 'Технологии',
      it: 'Tecnologia',
      es: 'Tecnología',
    },
  },
  {
    key: 'announcement',
    translations: {
      en: 'Announcement',
      ru: 'Объявление',
      it: 'Annuncio',
      es: 'Anuncio',
    },
  },
  {
    key: 'community',
    translations: {
      en: 'Community',
      ru: 'Сообщество',
      it: 'Comunità',
      es: 'Comunidad',
    },
  },
]

const stage = async () => {
  const r = await fetch(`${BASE}/api/github/file/stage`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: PATH,
      content: JSON.stringify(labels, null, 2),
    }),
  })
  console.log('Stage:', r.status, await r.text())
}

const commit = async () => {
  const r = await fetch(`${BASE}/api/github/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Add settings/labels.json' }),
  })
  console.log('Commit:', r.status, await r.text())
}

const run = async () => {
  await stage()
  await commit()
}

run().catch(console.error)
