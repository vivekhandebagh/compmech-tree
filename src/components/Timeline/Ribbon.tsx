import { AXIS_HEIGHT, ROW_HEIGHT } from "./constants";

interface Props {
  rowIndex: number;
  width: number;
  dimmed: boolean;
}

export function Ribbon({ rowIndex, width, dimmed }: Props) {
  const y = AXIS_HEIGHT + rowIndex * ROW_HEIGHT;
  const centerY = y + ROW_HEIGHT / 2;
  const opacity = dimmed ? 0.25 : 1;
  return (
    <g style={{ opacity, transition: "opacity 150ms" }}>
      <line
        x1={0}
        y1={centerY}
        x2={width}
        y2={centerY}
        stroke="rgb(229 229 229)"
        strokeWidth={1}
      />
      {rowIndex > 0 && (
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="rgb(245 245 245)"
          strokeWidth={0.5}
        />
      )}
    </g>
  );
}
