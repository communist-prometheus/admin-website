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

/**
 * jsdom has no `document.execCommand`. CodeMirror's `EditorView.focus()` calls
 * it through a Safari selection workaround, so every programmatic insert into
 * the markdown editor throws in tests while working fine in a browser. A no-op
 * stub keeps the workaround inert.
 */
const doc = globalThis.document as Document & { execCommand?: () => boolean };
if (doc !== undefined && doc.execCommand === undefined) {
  doc.execCommand = (): boolean => false;
}
