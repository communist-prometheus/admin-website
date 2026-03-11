const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Create a JSON Response from a plain object.
 * @param data - Serializable data
 * @param status - HTTP status code
 * @returns Response with JSON body
 */
export const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  })

/**
 * Create a JSON error Response.
 * @param message - Error description
 * @param status - HTTP status code
 * @returns Response with JSON error body
 */
export const errorResponse = (message: string, status = 500): Response =>
  jsonResponse({ error: message }, status)
