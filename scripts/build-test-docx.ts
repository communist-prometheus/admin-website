#!/usr/bin/env bun
/*
 * Build a small `.docx` test fixture with three footnotes that
 * exercise the admin's import pipeline (mammoth → extract-footnotes
 * → GFM `[^N]`) and the public-website's popover enhancer.
 *
 * Usage:
 *   bun scripts/build-test-docx.ts [out-path]
 *
 * Default out-path: ./e2e/fixtures/footnotes-test.docx
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import JSZip from 'jszip'
import {
  contentTypesXml,
  documentRelsXml,
  documentXml,
  footnotesXml,
  rootRelsXml,
} from './build-test-docx/parts.ts'

const DEFAULT_OUT = './e2e/fixtures/footnotes-test.docx'

const main = async (): Promise<void> => {
  const out = resolve(process.argv[2] ?? DEFAULT_OUT)
  const zip = new JSZip()
  zip.file('[Content_Types].xml', contentTypesXml)
  zip.file('_rels/.rels', rootRelsXml)
  zip.file('word/_rels/document.xml.rels', documentRelsXml)
  zip.file('word/document.xml', documentXml)
  zip.file('word/footnotes.xml', footnotesXml)
  const buf = await zip.generateAsync({ type: 'nodebuffer' })
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, buf)
  process.stdout.write(`Wrote ${out} (${buf.length} bytes)\n`)
}

await main()
