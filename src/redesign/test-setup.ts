/**
 * jsdom implements `attachInternals()` but omits parts of the form-association
 * API (`setFormValue`, validity setters) that the vendored form-control
 * components call from their `updated()` lifecycle. Without these, mounting any
 * screen that embeds a `cp-input`/`cp-select` throws. Stub them as no-ops so
 * component tests can render real screens.
 */
const internals = (globalThis as { ElementInternals?: { prototype: Record<string, unknown> } })
  .ElementInternals;

if (internals !== undefined) {
  const proto = internals.prototype;
  proto['setFormValue'] ??= (): void => {};
  proto['setValidity'] ??= (): void => {};
  proto['checkValidity'] ??= (): boolean => true;
  proto['reportValidity'] ??= (): boolean => true;
}
