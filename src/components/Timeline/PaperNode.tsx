import { NODE_HOVER_RADIUS, NODE_RADIUS, yearToX, rowToY } from "./constants";
import type { Paper } from "../../data/types";

const COLOR_DEFAULT = "rgb(23 23 23)";
const COLOR_ACTIVE = "rgb(29 78 216)";
const COLOR_HALO = "rgba(29 78 216 / 0.15)";

interface Props {
  paper: Paper;
  rowIndex: number;
  xPerYear: number;
  hovered: boolean;
  pinned: boolean;
  dimmed: boolean;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
}

export function PaperNode({
  paper,
  rowIndex,
  xPerYear,
  hovered,
  pinned,
  dimmed,
  onHover,
  onPin,
}: Props) {
  const cx = yearToX(paper.year, xPerYear);
  const cy = rowToY(rowIndex);
  const active = hovered || pinned;
  const r = active ? NODE_HOVER_RADIUS : NODE_RADIUS;
  const stroke = active ? COLOR_ACTIVE : COLOR_DEFAULT;
  const opacity = dimmed ? 0.2 : 1;
  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      style={{ cursor: "pointer", opacity, transition: "opacity 150ms" }}
      onMouseEnter={() => onHover(paper.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onPin(paper.id)}
    >
      {active && (
        <circle r={r + 5} fill={COLOR_HALO} style={{ transition: "r 150ms" }} />
      )}
      <circle
        r={r}
        fill="white"
        stroke={stroke}
        strokeWidth={pinned ? 2.25 : active ? 2 : 1.5}
        style={{ transition: "r 150ms, stroke 120ms, stroke-width 120ms" }}
      />
    </g>
  );
}
