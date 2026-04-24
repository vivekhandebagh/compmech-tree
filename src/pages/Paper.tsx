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

  if (!corpus) return <div className="p-6 text-sm text-neutral-400">Loading…</div>;
  const paper = corpus.papers.find((p) => p.id === id);
  if (!paper) return <div className="p-6 text-sm text-neutral-400">Paper not found.</div>;

  const ancestors = paper.cites_in_corpus
    .map((cid) => corpus.papers.find((p) => p.id === cid))
    .filter((p): p is PaperT => !!p);
  const descendants = corpus.papers.filter((p) => p.cites_in_corpus.includes(paper.id));
  const row = corpus.taxonomy.rows.find((r) => r.id === paper.primary_row);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-neutral-300">
      <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-300">
        ← timeline
      </Link>
      <h1 className="mt-3 text-lg font-semibold text-neutral-100">{paper.title}</h1>
      <div className="mt-1 text-xs text-neutral-500">
        {paper.authors.join(", ")} · {paper.year}
        {paper.venue ? ` · ${paper.venue}` : ""}
      </div>
      {row && (
        <div className="mt-2">
          <span
            className="inline-block rounded px-2 py-0.5 text-xs"
            style={{ background: row.color + "22", color: row.color }}
          >
            {row.name}
          </span>
        </div>
      )}
      {paper.abstract && (
        <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-300">{paper.abstract}</p>
      )}
      {paper.url && (
        <p className="mt-3">
          <a className="text-xs text-sky-400 underline" href={paper.url} target="_blank" rel="noreferrer">
            read paper →
          </a>
        </p>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Builds on (in-corpus)</h2>
        {ancestors.length === 0 ? (
          <p className="text-xs text-neutral-500">No in-corpus citations.</p>
        ) : (
          <ul className="space-y-1">
            {ancestors.map((a) => (
              <li key={a.id}>
                <Link to={`/paper/${a.id}`} className="text-sky-300 hover:underline">
                  {a.authors[0]?.split(" ").slice(-1)[0]} et al., {a.year} — {a.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Cited by (in-corpus)</h2>
        {descendants.length === 0 ? (
          <p className="text-xs text-neutral-500">Not yet cited by another in-corpus paper.</p>
        ) : (
          <ul className="space-y-1">
            {descendants.map((d) => (
              <li key={d.id}>
                <Link to={`/paper/${d.id}`} className="text-sky-300 hover:underline">
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
