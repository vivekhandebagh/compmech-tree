import { Link } from "react-router-dom";
import type { Corpus, Paper } from "../data/types";

interface Props {
  corpus: Corpus;
  focusId: string | null;
  pinnedId: string | null;
  onClear: () => void;
}

export function SidePanel({ corpus, focusId, pinnedId, onClear }: Props) {
  const paper = focusId ? corpus.papers.find((p) => p.id === focusId) : null;

  if (!paper) {
    return (
      <aside className="hidden w-[380px] shrink-0 border-l border-neutral-800 bg-neutral-950 p-5 text-xs leading-relaxed text-neutral-500 lg:block">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
          hover a paper
        </p>
        <p>
          Each node is a paper. Rows are concept regions of computational
          mechanics. Hover to read the abstract and see which prior in-lab
          papers it builds on. Click to pin.
        </p>
        <p className="mt-3">
          Hover a row label on the left to isolate that concept region.
        </p>
      </aside>
    );
  }

  const row = corpus.taxonomy.rows.find((r) => r.id === paper.primary_row);
  const ancestors = paper.cites_in_corpus
    .map((cid) => corpus.papers.find((p) => p.id === cid))
    .filter((p): p is Paper => !!p)
    .sort((a, b) => a.year - b.year);
  const descendants = corpus.papers
    .filter((p) => p.cites_in_corpus.includes(paper.id))
    .sort((a, b) => a.year - b.year);

  return (
    <aside className="hidden w-[380px] shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-5 text-xs leading-relaxed text-neutral-300 lg:block">
      <div className="mb-3 flex items-center justify-between">
        {row && (
          <span
            className="inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-wider"
            style={{ background: row.color + "22", color: row.color }}
          >
            {row.short}
          </span>
        )}
        {pinnedId === paper.id && (
          <button
            onClick={onClear}
            className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300"
          >
            unpin
          </button>
        )}
      </div>
      <h2 className="text-sm font-semibold leading-snug text-neutral-100">{paper.title}</h2>
      <div className="mt-1 text-[11px] text-neutral-500">
        {paper.authors.join(", ")} · {paper.year}
        {paper.venue ? ` · ${paper.venue}` : ""}
      </div>
      {paper.abstract && (
        <p className="mt-3 text-[12px] leading-relaxed text-neutral-300">{paper.abstract}</p>
      )}
      {paper.url && (
        <p className="mt-3">
          <a
            className="text-[11px] text-sky-400 underline underline-offset-2"
            href={paper.url}
            target="_blank"
            rel="noreferrer"
          >
            read paper →
          </a>
        </p>
      )}

      <section className="mt-5">
        <h3 className="mb-2 text-[10px] uppercase tracking-wider text-neutral-500">
          Builds on ({ancestors.length})
        </h3>
        {ancestors.length === 0 ? (
          <p className="text-[11px] text-neutral-600">No in-corpus citations.</p>
        ) : (
          <ul className="space-y-1.5">
            {ancestors.map((a) => (
              <li key={a.id} className="text-[11px]">
                <Link
                  to={`/paper/${a.id}`}
                  className="block rounded px-1 py-0.5 text-sky-300 hover:bg-neutral-900 hover:text-sky-200"
                >
                  <span className="font-mono text-neutral-500">{a.year}</span>{" "}
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4">
        <h3 className="mb-2 text-[10px] uppercase tracking-wider text-neutral-500">
          Cited by ({descendants.length})
        </h3>
        {descendants.length === 0 ? (
          <p className="text-[11px] text-neutral-600">Not yet cited in-corpus.</p>
        ) : (
          <ul className="space-y-1.5">
            {descendants.map((d) => (
              <li key={d.id} className="text-[11px]">
                <Link
                  to={`/paper/${d.id}`}
                  className="block rounded px-1 py-0.5 text-amber-300 hover:bg-neutral-900 hover:text-amber-200"
                >
                  <span className="font-mono text-neutral-500">{d.year}</span>{" "}
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
