/**
 * Read the `name` of a Resend error response WITHOUT disturbing a caller
 * that also needs the body: clones the response first, so the original
 * stream stays readable. See https://resend.com/docs/api-reference/errors.
 * @param res A non-ok Resend response.
 * @returns The error name, or undefined for an unreadable body.
 */
export const readErrorName = async (
  res: Response
): Promise<string | undefined> => {
  const body: unknown = await res
    .clone()
    .json()
    .catch(() => undefined)
  const name =
    body instanceof Object && 'name' in body ? body.name : undefined
  return typeof name === 'string' ? name : undefined
}
