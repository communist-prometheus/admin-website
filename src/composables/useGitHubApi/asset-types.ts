export type {
  AssetContent,
  AssetItem,
} from '@/validation/schemas/asset'

/** Parameters for staging a file without commit */
export interface StageFileParams {
  readonly path: string
  readonly content: string
}
