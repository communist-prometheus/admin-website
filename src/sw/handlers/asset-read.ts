import { readRepoBinaryFile } from '../git/read-binary-file'
import { detectMime } from './detect-mime'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Encode a Uint8Array to base64 string.
 * @param data - Binary data
 * @returns Base64 encoded string
 */
const toBase64 = (data: Uint8Array): string => {
  let binary = ''
  for (const byte of data) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/**
 * Handle GET /api/github/asset?path=...
 * Returns binary file content as base64 JSON.
 * @param url - Request URL with query params
 * @returns JSON response with base64 content and MIME type
 */
export const handleAssetRead = async (url: URL): Promise<Response> => {
  const path = url.searchParams.get('path')
  if (!path) return errorResponse('Path is required', 400)

  try {
    const data = await readRepoBinaryFile(path)
    const mimeType = detectMime(path)
    return jsonResponse({ path, content: toBase64(data), mimeType })
  } catch {
    return errorResponse(`Asset not found: ${path}`, 404)
  }
}
