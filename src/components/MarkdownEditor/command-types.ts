/** A wrap-style formatting command */
export interface WrapDef {
  readonly label: string
  readonly title: string
  readonly testId: string
  readonly pre: string
  readonly suf: string
  readonly key?: string
}

/** A line-prefix block command */
export interface BlockDef {
  readonly label: string
  readonly title: string
  readonly prefix: string
}
