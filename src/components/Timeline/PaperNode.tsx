import { NODE_HOVER_RADIUS, NODE_RADIUS, yearToX, rowToY } from "./constants";
import type { Paper, TaxonomyRow } from "../../data/types";

interface Props {
  paper: Paper;
  rowIndex: number;
  row: TaxonomyRow;
  hovered: boolean;
  pinned: boolean;
  dimmed: boolean;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
}

export function PaperNode({ paper, rowIndex, row, hovered, pinned, dimmed, onHover, onPin }: Props) {
  const cx = yearToX(paper.year);
  const cy = rowToY(rowIndex);
  const r = hovered || pinned ? NODE_HOVER_RADIUS : NODE_RADIUS;
  const opacity = dimmed ? 0.18 : 1;
  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      style={{ cursor: "pointer", opacity, transition: "opacity 150ms" }}
      onMouseEnter={() => onHover(paper.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onPin(paper.id)}
    >
      <circle
        r={r + 2}
        fill={row.color}
        fillOpacity={hovered || pinned ? 0.3 : 0}
        style={{ transition: "fill-opacity 150ms, r 150ms" }}
      />
      <circle
        r={r}
        fill={row.color}
        stroke={pinned ? "white" : "rgb(23 23 23)"}
        strokeWidth={pinned ? 2 : 1.5}
        style={{ transition: "r 150ms" }}
      />
    </g>
  );
}
