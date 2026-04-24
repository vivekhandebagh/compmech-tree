import { useEffect, useRef, useState } from "react";
import { loadCorpus } from "../data/loader";
import type { Corpus } from "../data/types";
import { RowLabels } from "../components/Timeline/RowLabels";
import { SwimLane } from "../components/Timeline/SwimLane";
import { SidePanel } from "../components/SidePanel";

export function Timeline() {
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadCorpus()
      .then(setCorpus)
      .catch((err) => {
        console.error(err);
        setError(String(err));
      });
  }, []);

  if (error) {
    return (
      <div className="p-6 text-sm text-red-400">
        Failed to load corpus: {error}
      </div>
    );
  }
  if (!corpus) {
    return <div className="p-6 text-sm text-neutral-400">Loading corpus…</div>;
  }

  const focusId = hoveredId ?? pinnedId;

  return (
    <div className="flex h-full min-h-0">
      <RowLabels
        taxonomy={corpus.taxonomy}
        hoveredRow={hoveredRow}
        onHoverRow={setHoveredRow}
      />
      <div
        ref={scrollRef}
        className="timeline-scroll relative min-w-0 flex-1"
        onClick={(e) => {
          if (e.target === e.currentTarget) setPinnedId(null);
        }}
      >
        <SwimLane
          corpus={corpus}
          hoveredId={hoveredId}
          pinnedId={pinnedId}
          hoveredRow={hoveredRow}
          onHover={setHoveredId}
          onPin={(id) => setPinnedId((cur) => (cur === id ? null : id))}
        />
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
