/** Localised chrome strings used by the digest renderer. */
export type DigestChrome = {
  readonly subject: (n: number) => string
  /** Subject when there are no new articles but a new issue is out. */
  readonly newIssueSubject: (title: string) => string
  readonly intro: string
  readonly readLabel: string
  /** Banner above a freshly-published newspaper issue. */
  readonly newIssueLabel: string
  /** Label for the already-announced latest issue, shown at the foot. */
  readonly currentIssueLabel: string
  readonly unsubscribeLabel: string
  readonly unsubscribeNote: string
}
