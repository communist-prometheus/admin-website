import { Match, pipe } from 'effect'
import type { ContentType } from '@/types/content'
import {
  archiveFields,
  basePageFields,
  blogFields,
  commonFieldsBySlug,
  labelsFields,
  magazineFields,
  pageFieldsBySlug,
  positionsFields,
} from './field-definitions'
import type { FieldDefinition } from './field-types'

export type { FieldDefinition, SelectOptionsSource } from './field-types'

const fieldsByContentType: Readonly<
  Record<ContentType, readonly FieldDefinition[]>
> = {
  blog: blogFields,
  positions: positionsFields,
  pages: basePageFields,
  common: labelsFields,
  magazine: magazineFields,
  archive: archiveFields,
}

const fieldsForType = (type: ContentType): readonly FieldDefinition[] =>
  fieldsByContentType[type] ?? []

const resolveBySlug = (
  type: ContentType,
  slug: string
): readonly FieldDefinition[] =>
  pipe(
    Match.value(type),
    Match.when('pages', () => pageFieldsBySlug[slug] ?? basePageFields),
    Match.when('common', () => commonFieldsBySlug[slug] ?? labelsFields),
    Match.orElse(() => fieldsForType(type))
  )

/**
 * Get field definitions for a content type.
 * @param type - The content type
 * @param slug - Optional slug for page/common-specific fields
 * @returns Array of field definitions
 */
export const getFields = (
  type: ContentType,
  slug?: string
): readonly FieldDefinition[] =>
  slug === undefined ? fieldsForType(type) : resolveBySlug(type, slug)
