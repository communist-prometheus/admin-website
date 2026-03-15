/** Result of a text editing operation */
export interface TextOp {
  readonly text: string
  readonly cursorStart: number
  readonly cursorEnd: number
}
