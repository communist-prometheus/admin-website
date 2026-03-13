/** Asset item from the SW asset list */
export interface AssetItem {
  readonly path: string
  readonly name: string
  readonly mimeType: string
}

/** Asset content with base64-encoded data */
export interface AssetContent {
  readonly path: string
  readonly content: string
  readonly mimeType: string
}

/** Parameters for staging a file without commit */
export interface StageFileParams {
  readonly path: string
  readonly content: string
}
