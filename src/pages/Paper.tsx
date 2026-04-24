import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadCorpus } from "../data/loader";
import type { Corpus, Paper as PaperT } from "../data/types";

export function Paper() {
  const { id } = useParams<{ id: string }>();
  const [corpus, setCorpus] = useState<Corpus | null>(null);

  useEffect(() => {
    loadCorpus().then(setCorpus).catch((err) => console.error(err));
  }, []);

  if (!corpus) return <div className="p-6 text-sm text-neutral-500">Loading…</div>;
  const paper = corpus.papers.find((p) => p.id === id);
  if (!paper) return <div className="p-6 text-sm text-neutral-500">Paper not found.</div>;

  const ancestors = paper.cites_in_corpus
    .map((cid) => corpus.papers.find((p) => p.id === cid))
    .filter((p): p is PaperT => !!p);
  const descendants = corpus.papers.filter((p) => p.cites_in_corpus.includes(paper.id));
  const row = corpus.taxonomy.rows.find((r) => r.id === paper.primary_row);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 text-[14px] text-neutral-800">
      <Link to="/" className="text-[12px] text-neutral-500 hover:text-neutral-800">
        ← timeline
      </Link>
      <h1 className="mt-3 text-lg font-semibold text-neutral-900">{paper.title}</h1>
      <div className="mt-1 text-[12px] text-neutral-500">
        {paper.authors.join(", ")} · {paper.year}
        {paper.venue ? ` · ${paper.venue}` : ""}
      </div>
      {row && (
        <div className="mt-2 text-[11px] uppercase tracking-wider text-neutral-500">
          {row.name}
        </div>
      )}
      {paper.abstract && (
        <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-700">{paper.abstract}</p>
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
        <h2 className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
          Builds on (in-corpus)
        </h2>
        {ancestors.length === 0 ? (
          <p className="text-[12px] text-neutral-400">No in-corpus citations.</p>
        ) : (
          <ul className="space-y-1">
            {ancestors.map((a) => (
              <li key={a.id} className="text-[13px]">
                <Link to={`/paper/${a.id}`} className="text-blue-700 hover:text-blue-900 hover:underline">
                  {a.authors[0]?.split(" ").slice(-1)[0]} et al., {a.year} — {a.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
          Cited by (in-corpus)
        </h2>
        {descendants.length === 0 ? (
          <p className="text-[12px] text-neutral-400">Not yet cited by another in-corpus paper.</p>
        ) : (
          <ul className="space-y-1">
            {descendants.map((d) => (
              <li key={d.id} className="text-[13px]">
                <Link to={`/paper/${d.id}`} className="text-neutral-700 hover:text-neutral-900 hover:underline">
                  {d.authors[0]?.split(" ").slice(-1)[0]} et al., {d.year} — {d.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
