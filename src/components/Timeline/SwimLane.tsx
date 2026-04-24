import { forwardRef, useMemo } from "react";
import type { Corpus, Paper } from "../../data/types";
import { YearAxis } from "./YearAxis";
import { Ribbon } from "./Ribbon";
import { PaperNode } from "./PaperNode";
import {
  AXIS_HEIGHT,
  ROW_HEIGHT,
  bodyHeight,
  rowToY,
  totalWidth,
  yearToX,
} from "./constants";

interface Props {
  corpus: Corpus;
  xPerYear: number;
  hoveredId: string | null;
  pinnedId: string | null;
  hoveredRow: number | null;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
}

const EDGE_ANCESTOR = "rgb(29 78 216)";
const EDGE_DESCENDANT = "rgb(120 113 108)";

export const SwimLane = forwardRef<SVGSVGElement, Props>(function SwimLane(
  { corpus, xPerYear, hoveredId, pinnedId, hoveredRow, onHover, onPin },
  ref,
) {
  const width = totalWidth(xPerYear);
  const height = bodyHeight(corpus.taxonomy.rows.length);
  const rowIndexById = useMemo(
    () =>
      new Map<number, number>(corpus.taxonomy.rows.map((r, i) => [r.id, i])),
    [corpus.taxonomy.rows],
  );
  const papersById = useMemo(
    () => new Map(corpus.papers.map((p) => [p.id, p])),
    [corpus.papers],
  );

  const focusId = hoveredId ?? pinnedId;
  const focusPaper: Paper | null = focusId ? papersById.get(focusId) ?? null : null;

  const highlightedIds = useMemo(() => {
    if (!focusPaper) return null;
    const set = new Set<string>([focusPaper.id]);
    for (const cid of focusPaper.cites_in_corpus) set.add(cid);
    for (const p of corpus.papers) {
      if (p.cites_in_corpus.includes(focusPaper.id)) set.add(p.id);
    }
    return set;
  }, [focusPaper, corpus.papers]);

  const edges = useMemo(() => {
    if (!focusPaper) return [];
    const out: Array<{ from: Paper; to: Paper; kind: "ancestor" | "descendant" }> = [];
    for (const cid of focusPaper.cites_in_corpus) {
      const a = papersById.get(cid);
      if (a) out.push({ from: a, to: focusPaper, kind: "ancestor" });
    }
    for (const p of corpus.papers) {
      if (p.cites_in_corpus.includes(focusPaper.id)) {
        out.push({ from: focusPaper, to: p, kind: "descendant" });
      }
    }
    return out;
  }, [focusPaper, papersById, corpus.papers]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className="block"
      style={{ background: "white" }}
    >
      <g>
        {corpus.taxonomy.rows.map((row, i) => {
          const dimmed = hoveredRow !== null && hoveredRow !== row.id;
          return <Ribbon key={row.id} rowIndex={i} width={width} dimmed={dimmed} />;
        })}
      </g>

      <YearAxis width={width} xPerYear={xPerYear} />

      <g>
        {edges.map((e, i) => {
          const fromRow = rowIndexById.get(e.from.primary_row);
          const toRow = rowIndexById.get(e.to.primary_row);
          if (fromRow === undefined || toRow === undefined) return null;
          const x1 = yearToX(e.from.year, xPerYear);
          const y1 = rowToY(fromRow);
          const x2 = yearToX(e.to.year, xPerYear);
          const y2 = rowToY(toRow);
          const midX = (x1 + x2) / 2;
          const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
          const stroke = e.kind === "ancestor" ? EDGE_ANCESTOR : EDGE_DESCENDANT;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={stroke}
              strokeOpacity={e.kind === "ancestor" ? 0.7 : 0.45}
              strokeWidth={1}
              strokeDasharray={e.kind === "descendant" ? "3 3" : undefined}
            />
          );
        })}
      </g>

      <g>
        {corpus.papers.map((p) => {
          const rowIndex = rowIndexById.get(p.primary_row);
          if (rowIndex === undefined) return null;
          const isHovered = hoveredId === p.id;
          const isPinned = pinnedId === p.id;
          const rowDimmed = hoveredRow !== null && hoveredRow !== p.primary_row;
          const focusDimmed =
            highlightedIds !== null && !highlightedIds.has(p.id);
          const dimmed = rowDimmed || focusDimmed;
          return (
            <PaperNode
              key={p.id}
              paper={p}
              rowIndex={rowIndex}
              xPerYear={xPerYear}
              hovered={isHovered}
              pinned={isPinned}
              dimmed={dimmed}
              onHover={onHover}
              onPin={onPin}
            />
          );
        })}
      </g>
    </svg>
  );
});

export const SWIMLANE_DIMENSIONS = { AXIS_HEIGHT, ROW_HEIGHT };
