import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadCorpus } from "../data/loader";
import type { Corpus, Paper } from "../data/types";
import { RowLabels } from "../components/Timeline/RowLabels";
import { SwimLane } from "../components/Timeline/SwimLane";
import { SidePanel } from "../components/SidePanel";
import {
  LEFT_PAD,
  YEAR_MIN,
  ZOOM_LEVELS,
  yearToX,
} from "../components/Timeline/constants";

const MIN_ZOOM = 18;
const MAX_ZOOM = 260;
const ZOOM_WHEEL_SENSITIVITY = 0.004;

export function Timeline() {
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [xPerYear, setXPerYear] = useState<number>(ZOOM_LEVELS.normal);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const xPerYearRef = useRef(xPerYear);
  const pendingScrollRef = useRef<number | null>(null);

  useEffect(() => {
    xPerYearRef.current = xPerYear;
  }, [xPerYear]);

  useEffect(() => {
    loadCorpus()
      .then(setCorpus)
      .catch((err) => {
        console.error(err);
        setError(String(err));
      });
  }, []);

  const papersByRow = useMemo(() => {
    if (!corpus) return new Map<number, Paper[]>();
    const m = new Map<number, Paper[]>();
    for (const p of corpus.papers) {
      const arr = m.get(p.primary_row) ?? [];
      arr.push(p);
      m.set(p.primary_row, arr);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
    }
    return m;
  }, [corpus]);

  const allPapersSorted = useMemo(() => {
    if (!corpus) return [] as Paper[];
    return [...corpus.papers].sort(
      (a, b) => a.year - b.year || a.id.localeCompare(b.id),
    );
  }, [corpus]);

  const scrollToPaper = useCallback((paper: Paper) => {
    const el = scrollRef.current;
    if (!el) return;
    const x = yearToX(paper.year, xPerYearRef.current);
    const target = x - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, []);

  const step = useCallback(
    (dir: "prev" | "next" | "up" | "down") => {
      if (!corpus) return;
      const current = pinnedId ?? hoveredId ?? null;

      if (dir === "prev" || dir === "next") {
        const currPaper = current
          ? corpus.papers.find((p) => p.id === current)
          : null;
        const list = currPaper
          ? papersByRow.get(currPaper.primary_row) ?? []
          : allPapersSorted;
        if (list.length === 0) return;
        const idx = currPaper ? list.findIndex((p) => p.id === currPaper.id) : -1;
        let nextIdx: number;
        if (idx === -1) nextIdx = dir === "next" ? 0 : list.length - 1;
        else
          nextIdx =
            dir === "next"
              ? Math.min(list.length - 1, idx + 1)
              : Math.max(0, idx - 1);
        const next = list[nextIdx];
        setPinnedId(next.id);
        scrollToPaper(next);
        return;
      }

      const rows = corpus.taxonomy.rows;
      const currPaper = current
        ? corpus.papers.find((p) => p.id === current)
        : null;
      const currRowIdx = currPaper
        ? rows.findIndex((r) => r.id === currPaper.primary_row)
        : -1;
      const delta = dir === "down" ? 1 : -1;
      for (let s = 1; s <= rows.length; s++) {
        const i = (currRowIdx + delta * s + rows.length) % rows.length;
        const targetRow = rows[i];
        const list = papersByRow.get(targetRow.id) ?? [];
        if (list.length === 0) continue;
        let target = list[Math.floor(list.length / 2)];
        if (currPaper) {
          target = list.reduce((best, p) =>
            Math.abs(p.year - currPaper.year) <
            Math.abs(best.year - currPaper.year)
              ? p
              : best,
          );
        }
        setPinnedId(target.id);
        scrollToPaper(target);
        return;
      }
    },
    [corpus, pinnedId, hoveredId, papersByRow, allPapersSorted, scrollToPaper],
  );

  const setZoomAnchored = useCallback(
    (nextXPerYear: number, anchorViewportX?: number) => {
      const el = scrollRef.current;
      const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextXPerYear));
      if (el && anchorViewportX !== undefined) {
        const current = xPerYearRef.current;
        const worldX = el.scrollLeft + anchorViewportX;
        const yearAtAnchor = YEAR_MIN + (worldX - LEFT_PAD) / current;
        const newWorldX = LEFT_PAD + (yearAtAnchor - YEAR_MIN) * clamped;
        pendingScrollRef.current = newWorldX - anchorViewportX;
      }
      setXPerYear(clamped);
    },
    [],
  );

  // Apply the anchored scroll position after the DOM has the new width.
  useLayoutEffect(() => {
    if (pendingScrollRef.current != null && scrollRef.current) {
      scrollRef.current.scrollLeft = Math.max(0, pendingScrollRef.current);
      pendingScrollRef.current = null;
    }
  }, [xPerYear]);

  // Wheel: cmd/ctrl (or trackpad pinch) zooms; otherwise let the browser scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const factor = Math.exp(-e.deltaY * ZOOM_WHEEL_SENSITIVITY);
      setZoomAnchored(xPerYearRef.current * factor, mouseX);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoomAnchored]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          step("prev");
          break;
        case "ArrowRight":
          e.preventDefault();
          step("next");
          break;
        case "ArrowUp":
          e.preventDefault();
          step("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          step("down");
          break;
        case "Escape":
          setPinnedId(null);
          break;
        case "1":
          setZoomAnchored(ZOOM_LEVELS.compact);
          break;
        case "2":
          setZoomAnchored(ZOOM_LEVELS.normal);
          break;
        case "3":
          setZoomAnchored(ZOOM_LEVELS.expanded);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, setZoomAnchored]);

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load corpus: {error}
      </div>
    );
  }
  if (!corpus) {
    return <div className="p-6 text-sm text-neutral-500">Loading corpus…</div>;
  }

  const focusId = hoveredId ?? pinnedId;

  return (
    <div className="flex h-full min-h-0 bg-white">
      <RowLabels
        taxonomy={corpus.taxonomy}
        hoveredRow={hoveredRow}
        onHoverRow={setHoveredRow}
      />
      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          className="timeline-scroll h-full bg-white"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPinnedId(null);
          }}
        >
          <SwimLane
            corpus={corpus}
            xPerYear={xPerYear}
            hoveredId={hoveredId}
            pinnedId={pinnedId}
            hoveredRow={hoveredRow}
            onHover={setHoveredId}
            onPin={(id) => setPinnedId((cur) => (cur === id ? null : id))}
          />
        </div>
        <div className="pointer-events-none absolute bottom-3 right-4 text-[10px] uppercase tracking-wider text-neutral-400">
          ⌘ + scroll to zoom · ← → ↑ ↓ to step
        </div>
      </div>
      <SidePanel
        corpus={corpus}
        focusId={focusId}
        pinnedId={pinnedId}
        onClear={() => setPinnedId(null)}
      />
    </div>
  );
}
