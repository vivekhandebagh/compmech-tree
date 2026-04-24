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
      <aside className="hidden w-[380px] shrink-0 border-l border-neutral-200 bg-white p-6 text-[13px] leading-relaxed text-neutral-500 lg:block">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-neutral-400">
          Hover a paper
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
    <aside className="hidden w-[380px] shrink-0 overflow-y-auto border-l border-neutral-200 bg-white p-6 text-[13px] leading-relaxed text-neutral-800 lg:block">
      <div className="mb-3 flex items-center justify-between">
        {row && (
          <span className="text-[11px] uppercase tracking-wider text-neutral-500">
            {row.name}
          </span>
        )}
        {pinnedId === paper.id && (
          <button
            onClick={onClear}
            className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-neutral-700"
          >
            unpin
          </button>
        )}
      </div>
      <h2 className="text-[15px] font-semibold leading-snug text-neutral-900">
        {paper.title}
      </h2>
      <div className="mt-1 text-[12px] text-neutral-500">
        {paper.authors.join(", ")} · {paper.year}
        {paper.venue ? ` · ${paper.venue}` : ""}
      </div>
      {paper.abstract && (
        <p className="mt-4 text-[13px] leading-relaxed text-neutral-700">
          {paper.abstract}
        </p>
      )}
      {paper.url && (
        <p className="mt-3">
          <a
            className="text-[12px] text-blue-700 underline underline-offset-2 hover:text-blue-900"
            href={paper.url}
            target="_blank"
            rel="noreferrer"
          >
            read paper →
          </a>
        </p>
      )}

      <section className="mt-6">
        <h3 className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
          Builds on ({ancestors.length})
        </h3>
        {ancestors.length === 0 ? (
          <p className="text-[12px] text-neutral-400">No in-corpus citations.</p>
        ) : (
          <ul className="space-y-1.5">
            {ancestors.map((a) => (
              <li key={a.id} className="text-[12px]">
                <Link
                  to={`/paper/${a.id}`}
                  className="block rounded px-1 py-0.5 text-blue-700 hover:bg-neutral-100 hover:text-blue-900"
                >
                  <span className="tabular-nums text-neutral-400">{a.year}</span>{" "}
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
          Cited by ({descendants.length})
        </h3>
        {descendants.length === 0 ? (
          <p className="text-[12px] text-neutral-400">Not yet cited in-corpus.</p>
        ) : (
          <ul className="space-y-1.5">
            {descendants.map((d) => (
              <li key={d.id} className="text-[12px]">
                <Link
                  to={`/paper/${d.id}`}
                  className="block rounded px-1 py-0.5 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <span className="tabular-nums text-neutral-400">{d.year}</span>{" "}
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
