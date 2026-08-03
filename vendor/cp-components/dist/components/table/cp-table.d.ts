import { LitElement, type TemplateResult } from 'lit';
import '../skeleton/cp-skeleton.js';
import '../empty-state/cp-empty-state.js';
/** One table column: the row key it reads, its header label, optional alignment. */
export interface CpTableColumn {
    readonly key: string;
    readonly label: string;
    readonly align?: 'start' | 'end';
}
/** A single data row: an opaque bag of cell values keyed by column key. */
export type CpTableRow = Record<string, unknown>;
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
export declare class CpTable extends LitElement {
    static styles: import("lit").CSSResult;
    /** Column definitions in display order. */
    columns: CpTableColumn[];
    /** Row records, each keyed by column key. */
    rows: CpTableRow[];
    /** Accessible table caption. */
    caption: string;
    /** Enables the leading checkbox column and selection behaviour. */
    selectable: boolean;
    /** Currently selected row ids (controlled). */
    selected: string[];
    /** Column key that carries each row's stable id. */
    rowKey: string;
    /** Replaces the body with skeleton rows while data loads. */
    loading: boolean;
    private get columnSpan();
    private emitSelection;
    private handleSelectAll;
    private handleRowToggle;
    private renderHeadCells;
    private renderSelectAllHeader;
    private renderRow;
    private renderSkeletonRows;
    private renderEmptyRow;
    private renderBody;
    render(): TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-table': CpTable;
    }
}
//# sourceMappingURL=cp-table.d.ts.map