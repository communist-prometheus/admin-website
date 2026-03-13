import { writeBinaryAndStage } from '../git/write-binary-file'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Decode a base64 string to Uint8Array.
 * @param base64 - Base64 encoded string
 * @returns Binary data
 */
const fromBase64 = (base64: string): Uint8Array => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Handle POST /api/github/asset — write binary asset.
 * @param request - Incoming Request with { path, content }
 * @returns JSON response with { success, path }
 */
export const handleAssetWrite = async (
  request: Request
): Promise<Response> => {
  const { path, content } = await request.json()
  if (!path || !content) {
    return errorResponse('Path and content are required', 400)
  }

  const data = fromBase64(content)
  await writeBinaryAndStage(path, data)
  return jsonResponse({ success: true, path })
}
