import type { IssueMeta } from './docx-to-fb2'

interface DocxUploadProps {
  readonly slug: string
  readonly issueTitle?: string
  readonly issueLang?: string
  readonly issueDescription?: string
}

/**
 * Build the IssueMeta payload passed to `docxFileToFb2`, omitting
 * undefined fields so optional metadata stays absent in the FB2
 * description rather than appearing as the literal string
 * "undefined".
 *
 * @param props - DocxUpload component props
 * @returns IssueMeta with only defined fields
 */
export const buildDocxMeta = (props: DocxUploadProps): IssueMeta => ({
  slug: props.slug,
  ...(props.issueTitle === undefined ? {} : { issueTitle: props.issueTitle }),
  ...(props.issueLang === undefined ? {} : { issueLang: props.issueLang }),
  ...(props.issueDescription === undefined
    ? {}
    : { issueDescription: props.issueDescription }),
})
