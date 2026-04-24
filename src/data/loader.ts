import type { Corpus, Paper, Taxonomy } from "./types";

const DATA_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/data";

export async function loadCorpus(): Promise<Corpus> {
  const [papersResp, taxonomyResp] = await Promise.all([
    fetch(`${DATA_BASE}/papers.json`),
    fetch(`${DATA_BASE}/taxonomy.json`),
  ]);
  if (!papersResp.ok) throw new Error(`papers.json: ${papersResp.status}`);
  if (!taxonomyResp.ok) throw new Error(`taxonomy.json: ${taxonomyResp.status}`);
  const papers = (await papersResp.json()) as Paper[];
  const taxonomy = (await taxonomyResp.json()) as Taxonomy;
  return { papers, taxonomy };
}
