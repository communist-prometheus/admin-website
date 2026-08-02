var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../skeleton/cp-skeleton.js';
import '../empty-state/cp-empty-state.js';
/** Number of placeholder rows drawn while `loading` with no data to size against. */
const LOADING_ROW_FALLBACK = 3;
/** Reads a row's id (the `rowKey` cell) as a stable string, safe for empty cells. */
const readRowId = (row, rowKey) => {
    const value = row[rowKey];
    return value === undefined || value === null ? '' : String(value);
};
/** Collects every row id in order (used by the header select-all control). */
const collectIds = (rows, rowKey) => rows.map((row) => readRowId(row, rowKey));
/** Toggles one id in/out of the current selection, preserving order. */
const toggleId = (selected, id) => selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id];
/**
 * Data table (R4/R5, design.md §5). Renders a real semantic `<table>` with a
 * `<caption>`, `scope="col"` headers and hover-highlighted body rows, wrapped in
 * an `overflow-x:auto` container so wide content scrolls the table — never the
 * page. Opt into `selectable` for a leading checkbox column with a header
 * select-all (with an indeterminate partial state) and per-row checkboxes;
 * either emits `cp-select-change` with the full `selected` id list. While
 * `loading` the body renders `<cp-skeleton>` placeholder rows; with no rows and
 * no load in flight it renders an empty state (an `empty` slot overriding the
 * default `<cp-empty-state>`).
 *
 * All theming flows through bridged `--cp-*` tokens (design.md §2) with literal
 * fallbacks so the element renders standalone.
 */
let CpTable = class CpTable extends LitElement {
    constructor() {
        super(...arguments);
        /** Column definitions in display order. */
        this.columns = [];
        /** Row records, each keyed by column key. */
        this.rows = [];
        /** Accessible table caption. */
        this.caption = '';
        /** Enables the leading checkbox column and selection behaviour. */
        this.selectable = false;
        /** Currently selected row ids (controlled). */
        this.selected = [];
        /** Column key that carries each row's stable id. */
        this.rowKey = 'id';
        /** Replaces the body with skeleton rows while data loads. */
        this.loading = false;
        this.handleSelectAll = () => {
            const ids = collectIds(this.rows, this.rowKey);
            const allSelected = ids.length > 0 && ids.every((id) => this.selected.includes(id));
            this.emitSelection(allSelected ? [] : ids);
        };
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .scroll {
      overflow-x: auto;
      max-width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-family: inherit;
      font-size: 0.9375rem;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    caption {
      text-align: start;
      padding: var(--cp-spacing-sm, 1rem) var(--cp-spacing-md, 1.5rem);
      font-weight: 600;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    th,
    td {
      padding: var(--cp-spacing-sm, 1rem) var(--cp-spacing-md, 1.5rem);
      text-align: start;
      white-space: nowrap;
      border-block-end: 1px solid var(--cp-color-border, hsl(0 0% 88%));
    }

    th {
      font-weight: 600;
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      background: var(--cp-color-surface, hsl(0 0% 98%));
    }

    .align-end {
      text-align: end;
    }

    tbody tr {
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    tbody tr:hover {
      background: var(--cp-color-surface, hsl(0 0% 98%));
    }

    .select-cell {
      width: 1px;
      white-space: nowrap;
    }

    input[type='checkbox'] {
      width: 1.05rem;
      height: 1.05rem;
      accent-color: var(--cp-color-accent, hsl(12 80% 45%));
      cursor: pointer;
    }

    input[type='checkbox']:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .empty-cell {
      padding: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      tbody tr {
        transition: none;
      }
    }
  `; }
    get columnSpan() {
        return this.columns.length + (this.selectable ? 1 : 0);
    }
    emitSelection(selected) {
        this.dispatchEvent(new CustomEvent('cp-select-change', {
            bubbles: true,
            composed: true,
            detail: { selected },
        }));
    }
    handleRowToggle(id) {
        this.emitSelection(toggleId(this.selected, id));
    }
    renderHeadCells() {
        return html `
      ${this.selectable ? this.renderSelectAllHeader() : nothing}
      ${this.columns.map((column) => html `<th
            scope="col"
            part="header-cell"
            class=${column.align === 'end' ? 'align-end' : nothing}
          >
            ${column.label}
          </th>`)}
    `;
    }
    renderSelectAllHeader() {
        const ids = collectIds(this.rows, this.rowKey);
        const selectedCount = ids.filter((id) => this.selected.includes(id)).length;
        const allSelected = ids.length > 0 && selectedCount === ids.length;
        const partial = selectedCount > 0 && !allSelected;
        return html `<th scope="col" part="header-cell" class="select-cell">
      <input
        type="checkbox"
        part="select-all"
        aria-label="Select all rows"
        .checked=${allSelected}
        .indeterminate=${partial}
        @change=${this.handleSelectAll}
      />
    </th>`;
    }
    renderRow(row) {
        const id = readRowId(row, this.rowKey);
        return html `<tr part="row">
      ${this.selectable
            ? html `<td part="cell" class="select-cell">
            <input
              type="checkbox"
              part="select-row"
              aria-label="Select row"
              .checked=${this.selected.includes(id)}
              @change=${() => this.handleRowToggle(id)}
            />
          </td>`
            : nothing}
      ${this.columns.map((column) => html `<td part="cell" class=${column.align === 'end' ? 'align-end' : nothing}>
            ${row[column.key]}
          </td>`)}
    </tr>`;
    }
    renderSkeletonRows() {
        const count = this.rows.length > 0 ? this.rows.length : LOADING_ROW_FALLBACK;
        const cells = this.columnSpan || 1;
        return html `${Array.from({ length: count }, () => html `<tr part="row">
          ${Array.from({ length: cells }, () => html `<td part="cell">
                <cp-skeleton variant="text" lines="1"></cp-skeleton>
              </td>`)}
        </tr>`)}`;
    }
    renderEmptyRow() {
        return html `<tr>
      <td part="empty" class="empty-cell" colspan=${this.columnSpan || 1}>
        <slot name="empty">
          <cp-empty-state title="No data" hint="There is nothing to show here yet."></cp-empty-state>
        </slot>
      </td>
    </tr>`;
    }
    renderBody() {
        if (this.loading)
            return this.renderSkeletonRows();
        if (this.rows.length === 0)
            return this.renderEmptyRow();
        return html `${this.rows.map((row) => this.renderRow(row))}`;
    }
    render() {
        return html `
      <div class="scroll" part="scroll">
        <table part="table">
          ${this.caption === ''
            ? nothing
            : html `<caption part="caption">${this.caption}</caption>`}
          <thead part="head">
            <tr>
              ${this.renderHeadCells()}
            </tr>
          </thead>
          <tbody part="body" aria-busy=${this.loading ? 'true' : nothing}>
            ${this.renderBody()}
          </tbody>
        </table>
      </div>
    `;
    }
};
__decorate([
    property({ type: Array })
], CpTable.prototype, "columns", void 0);
__decorate([
    property({ type: Array })
], CpTable.prototype, "rows", void 0);
__decorate([
    property()
], CpTable.prototype, "caption", void 0);
__decorate([
    property({ type: Boolean })
], CpTable.prototype, "selectable", void 0);
__decorate([
    property({ type: Array })
], CpTable.prototype, "selected", void 0);
__decorate([
    property()
], CpTable.prototype, "rowKey", void 0);
__decorate([
    property({ type: Boolean })
], CpTable.prototype, "loading", void 0);
CpTable = __decorate([
    customElement('cp-table')
], CpTable);
export { CpTable };
//# sourceMappingURL=cp-table.js.map