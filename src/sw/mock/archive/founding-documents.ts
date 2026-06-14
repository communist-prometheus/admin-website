import type { MockEntry } from '../all-entries'

const POSTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280">
  <rect width="200" height="280" fill="#7f1d1d"/>
  <text x="100" y="150" text-anchor="middle" fill="#fde68a"
    font-family="serif" font-size="18">Manifesto</text>
</svg>`

const README_TXT = `Founding documents of the collective.
Scans and source files are kept here for the archive.`

const BASE = 'archive/founding-documents/assets'

/** Mock entries for the "founding-documents" archive item. */
export const foundingDocumentsEntries: readonly MockEntry[] = [
  {
    path: 'archive/founding-documents/index.en.md',
    content: `---
title: Founding Documents
description: Scans and source files behind the collective's manifesto.
published: true
publishDate: 2026-05-01
lang: en
---

The originals and working files of our founding texts.`,
  },
  { path: `${BASE}/manifesto-poster.svg`, content: POSTER_SVG },
  { path: `${BASE}/notes.txt`, content: README_TXT },
]
