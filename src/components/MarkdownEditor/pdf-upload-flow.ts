import { shouldAutoSetCover } from './pdf-cover-policy'
import { coverName, sourceName } from './source-asset-naming'

interface FlowEmits {
  readonly uploadPdf: (file: File) => void
  readonly uploadCover: (file: File) => void
  readonly setCover: (name: string) => void
  readonly error: (message: string) => void
}

interface FlowDeps {
  readonly slug: string
  readonly lang: string
  readonly currentCover: string | undefined
  readonly emits: FlowEmits
}

const extractCover = async (
  file: File,
  lang: string
): Promise<File | undefined> => {
  const m = await import('@/features/magazine/extract-pdf-cover')
  const raw = await m.extractPdfCover(file)
  return new File([raw], coverName(lang), { type: raw.type || 'image/png' })
}

const fanOutCover = (cover: File, deps: FlowDeps): void => {
  deps.emits.uploadCover(cover)
  void (shouldAutoSetCover(deps.currentCover)
    ? deps.emits.setCover(coverName(deps.lang))
    : undefined)
}

const continuePdfUpload = async (
  file: File,
  deps: FlowDeps
): Promise<void> => {
  const renamed = new File([file], sourceName(deps.slug, deps.lang, 'pdf'), {
    type: file.type,
  })
  deps.emits.uploadPdf(renamed)
  const cover = await extractCover(file, deps.lang).catch((err: unknown) => {
    const reason = err instanceof Error ? err.message : String(err)
    deps.emits.error(`PDF cover extraction failed: ${reason}`)
    return undefined
  })
  void (cover === undefined ? undefined : fanOutCover(cover, deps))
}

/**
 * Run the PDF upload pipeline: rename to `<slug>.<lang>.pdf`, emit
 * upload-pdf, extract a per-lang cover image, emit upload-cover and
 * set-cover when no custom cover is in place. Errors during cover
 * extraction surface via the `error` emit so the editor can show
 * them — silent fallback to a missing cover is exactly what hid the
 * earlier extraction regression.
 * @param file - User-picked PDF
 * @param deps - Slug / lang / current cover / emit hooks
 * @returns Promise resolving once the chain settles
 */
export const runPdfUpload = (file: File, deps: FlowDeps): Promise<void> =>
  file.type === 'application/pdf'
    ? continuePdfUpload(file, deps)
    : Promise.resolve()
