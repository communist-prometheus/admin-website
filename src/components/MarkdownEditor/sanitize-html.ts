import DOMPurify from 'dompurify'

/*
 * marked does NOT sanitize its output. Content comes from the shared
 * content repo, which editor-role users can write to — without
 * sanitization a crafted post becomes stored XSS running in a
 * chief-editor's or admin's session via v-html in MarkdownPreview
 * (and localStorage holds the GitHub token). The URI regexp is the
 * DOMPurify default plus `blob:` so resolved asset previews keep
 * working; relative ./assets/ paths and #footnote anchors pass via
 * the non-alpha branch.
 */
const URI_ALLOW =
  /^(?:(?:(?:f|ht)tps?|mailto|tel|blob|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i

/**
 * Sanitize rendered markdown HTML before it reaches v-html.
 * @param html - HTML produced by marked
 * @returns Sanitized HTML safe for v-html injection
 */
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, { ALLOWED_URI_REGEXP: URI_ALLOW })
