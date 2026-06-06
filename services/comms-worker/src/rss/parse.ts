import type { Lang } from '../subscribers/types'
import { decodeXmlText } from './decode'
import type { Article } from './types'

const ITEM_RE = /<item\b[\s\S]*?<\/item>/g
const BOM_RE = /^﻿/

const extractTag = (xml: string, tag: string): string | undefined => {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const m = re.exec(xml)
  return m === null ? undefined : decodeXmlText(m[1] ?? '')
}

const toIsoUtc = (raw: string): string | undefined => {
  const ms = Date.parse(raw)
  return Number.isFinite(ms) ? new Date(ms).toISOString() : undefined
}

const itemToArticle = (block: string, lang: Lang): Article | undefined => {
  const guid = extractTag(block, 'guid')
  const title = extractTag(block, 'title')
  const link = extractTag(block, 'link')
  const pubDateRaw = extractTag(block, 'pubDate')
  if (
    guid === undefined ||
    title === undefined ||
    link === undefined ||
    pubDateRaw === undefined
  ) {
    return undefined
  }
  const pubDate = toIsoUtc(pubDateRaw)
  return pubDate === undefined
    ? undefined
    : { guid, title, link, lang, pubDate }
}

/**
 * Parse a well-formed RSS-2.0 document into a typed `Article[]`.
 * Tolerates a UTF-8 BOM, CDATA-wrapped fields, the common XML entities,
 * and either RFC-822 or ISO-8601 `pubDate` values. Items missing any
 * required field — or carrying an unparseable date — are skipped.
 * @param xml Raw RSS document body.
 * @param lang Language code attached to every parsed item.
 * @returns Parsed article list, preserving document order.
 */
export const parseRss = (xml: string, lang: Lang): ReadonlyArray<Article> => {
  const body = xml.replace(BOM_RE, '')
  const blocks = body.match(ITEM_RE) ?? []
  return blocks
    .map(b => itemToArticle(b, lang))
    .filter((a): a is Article => a !== undefined)
}
