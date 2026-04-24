import { YEAR_MIN, YEAR_MAX, AXIS_HEIGHT, yearToX } from "./constants";

interface Props {
  width: number;
}

export function YearAxis({ width }: Props) {
  const years: number[] = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) years.push(y);

  return (
    <g>
      <rect x={0} y={0} width={width} height={AXIS_HEIGHT} fill="rgb(23 23 23)" />
      <line
        x1={0}
        y1={AXIS_HEIGHT - 0.5}
        x2={width}
        y2={AXIS_HEIGHT - 0.5}
        stroke="rgb(64 64 64)"
      />
      {years.map((y) => {
        const isDecade = y % 10 === 0;
        const isHalf = y % 5 === 0;
        const x = yearToX(y);
        return (
          <g key={y} transform={`translate(${x}, 0)`}>
            <line
              x1={0}
              y1={isDecade ? AXIS_HEIGHT - 12 : isHalf ? AXIS_HEIGHT - 8 : AXIS_HEIGHT - 4}
              x2={0}
              y2={AXIS_HEIGHT}
              stroke="rgb(115 115 115)"
              strokeWidth={isDecade ? 1 : 0.5}
            />
            {isDecade && (
              <text
                x={0}
                y={14}
                textAnchor="middle"
                className="fill-neutral-300"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
              >
                {y}
              </text>
            )}
            {!isDecade && isHalf && (
              <text
                x={0}
                y={14}
                textAnchor="middle"
                className="fill-neutral-500"
                fontSize={9}
                fontFamily="ui-monospace, monospace"
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
