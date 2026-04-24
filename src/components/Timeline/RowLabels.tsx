import { AXIS_HEIGHT, ROW_HEIGHT, LABEL_WIDTH } from "./constants";
import type { Taxonomy } from "../../data/types";

interface Props {
  taxonomy: Taxonomy;
  hoveredRow: number | null;
  onHoverRow: (rowId: number | null) => void;
}

export function RowLabels({ taxonomy, hoveredRow, onHoverRow }: Props) {
  return (
    <div
      className="relative shrink-0 border-r border-neutral-800 bg-neutral-950"
      style={{ width: LABEL_WIDTH }}
    >
      <div style={{ height: AXIS_HEIGHT }} className="border-b border-neutral-800" />
      <div className="flex flex-col">
        {taxonomy.rows.map((row) => {
          const active = hoveredRow === null || hoveredRow === row.id;
          return (
            <div
              key={row.id}
              onMouseEnter={() => onHoverRow(row.id)}
              onMouseLeave={() => onHoverRow(null)}
              className="flex cursor-default items-center gap-2 border-b border-neutral-900 px-3 text-xs transition-opacity"
              style={{
                height: ROW_HEIGHT,
                opacity: active ? 1 : 0.35,
              }}
            >
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: row.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-neutral-200">{row.short}</div>
                <div className="truncate text-[10px] text-neutral-500">{row.blurb}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
