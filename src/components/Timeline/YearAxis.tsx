import { YEAR_MIN, YEAR_MAX, AXIS_HEIGHT, yearToX } from "./constants";

interface Props {
  width: number;
  xPerYear: number;
}

export function YearAxis({ width, xPerYear }: Props) {
  const years: number[] = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) years.push(y);
  const showHalfLabels = xPerYear >= 60;
  const showMinorTicks = xPerYear >= 50;

  return (
    <g>
      <rect x={0} y={0} width={width} height={AXIS_HEIGHT} fill="white" />
      <line
        x1={0}
        y1={AXIS_HEIGHT - 0.5}
        x2={width}
        y2={AXIS_HEIGHT - 0.5}
        stroke="rgb(229 229 229)"
      />
      {years.map((y) => {
        const isDecade = y % 10 === 0;
        const isHalf = y % 5 === 0;
        if (!isDecade && !isHalf && !showMinorTicks) return null;
        const x = yearToX(y, xPerYear);
        return (
          <g key={y} transform={`translate(${x}, 0)`}>
            <line
              x1={0}
              y1={isDecade ? AXIS_HEIGHT - 12 : isHalf ? AXIS_HEIGHT - 8 : AXIS_HEIGHT - 4}
              x2={0}
              y2={AXIS_HEIGHT}
              stroke={isDecade ? "rgb(82 82 82)" : "rgb(163 163 163)"}
              strokeWidth={isDecade ? 1 : 0.5}
            />
            {isDecade && (
              <text
                x={0}
                y={14}
                textAnchor="middle"
                fill="rgb(38 38 38)"
                fontSize={11}
                fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
              >
                {y}
              </text>
            )}
            {!isDecade && isHalf && showHalfLabels && (
              <text
                x={0}
                y={14}
                textAnchor="middle"
                fill="rgb(163 163 163)"
                fontSize={9}
                fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
              >
                {String(y).slice(-2)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
