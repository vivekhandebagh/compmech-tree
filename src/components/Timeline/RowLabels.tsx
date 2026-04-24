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
      className="relative shrink-0 border-r border-neutral-200 bg-white"
      style={{ width: LABEL_WIDTH }}
    >
      <div style={{ height: AXIS_HEIGHT }} className="border-b border-neutral-200" />
      <div className="flex flex-col">
        {taxonomy.rows.map((row, i) => {
          const active = hoveredRow === null || hoveredRow === row.id;
          return (
            <div
              key={row.id}
              onMouseEnter={() => onHoverRow(row.id)}
              onMouseLeave={() => onHoverRow(null)}
              className={
                "flex cursor-default items-center px-4 text-[12.5px] leading-[1.25] text-neutral-900 transition-opacity" +
                (i < taxonomy.rows.length - 1 ? " border-b border-neutral-100" : "")
              }
              style={{
                height: ROW_HEIGHT,
                opacity: active ? 1 : 0.35,
              }}
            >
              <span className="text-balance">{row.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
