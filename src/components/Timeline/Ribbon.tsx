import { AXIS_HEIGHT, ROW_HEIGHT } from "./constants";
import type { TaxonomyRow } from "../../data/types";

interface Props {
  row: TaxonomyRow;
  rowIndex: number;
  width: number;
  dimmed: boolean;
}

export function Ribbon({ row, rowIndex, width, dimmed }: Props) {
  const y = AXIS_HEIGHT + rowIndex * ROW_HEIGHT;
  const centerY = y + ROW_HEIGHT / 2;
  const opacity = dimmed ? 0.12 : 1;
  return (
    <g style={{ opacity, transition: "opacity 150ms" }}>
      <rect
        x={0}
        y={y}
        width={width}
        height={ROW_HEIGHT}
        fill={row.color}
        fillOpacity={0.04}
      />
      <line
        x1={0}
        y1={centerY}
        x2={width}
        y2={centerY}
        stroke={row.color}
        strokeOpacity={0.25}
        strokeWidth={1}
      />
      {rowIndex > 0 && (
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="rgb(38 38 38)"
          strokeWidth={0.5}
        />
      )}
    </g>
  );
}
