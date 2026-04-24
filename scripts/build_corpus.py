"""Build public/data/papers.json from OpenAlex, seeded by scripts/authors.yaml.

Pipeline:
  1. Resolve each author name in authors.yaml to an OpenAlex author ID.
  2. Fetch all works for each author.
  3. Dedup by OpenAlex work ID (same paper across co-authors → one record).
  4. For each paper, compute in-corpus citations by intersecting its
     referenced_works with the corpus set.
  5. Assign a primary row via keyword heuristic; attach secondaries.
  6. Apply scripts/overrides.csv (inclusion, row override, landmark).
  7. Emit public/data/papers.json and scripts/.cache/corpus_raw.json.

Idempotent. Re-run anytime.
"""

from __future__ import annotations

import csv
import json
import sys
import time
from pathlib import Path
from typing import Any

import yaml
from slugify import slugify
from tqdm import tqdm

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
CACHE_DIR = SCRIPT_DIR / ".cache"
OUTPUT_PATH = REPO_ROOT / "public" / "data" / "papers.json"
AUTHORS_PATH = SCRIPT_DIR / "authors.yaml"
OVERRIDES_PATH = SCRIPT_DIR / "overrides.csv"

sys.path.insert(0, str(SCRIPT_DIR))
from openalex import (  # noqa: E402
    decode_abstract,
    extract_arxiv_id,
    fetch_works_by_author,
    is_article,
    primary_author_names,
    referenced_ids,
    search_author_id,
    short_id,
    unique,
    venue,
)
from assign_rows import assign_primary_row, assign_secondary_rows  # noqa: E402


def load_authors() -> list[dict[str, Any]]:
    with AUTHORS_PATH.open() as f:
        data = yaml.safe_load(f)
    return [a for a in data.get("authors", []) if a.get("include", True)]


def resolve_author_ids(authors: list[dict[str, Any]]) -> list[dict[str, Any]]:
    CACHE_DIR.mkdir(exist_ok=True)
    id_cache_path = CACHE_DIR / "author_ids.json"
    cache: dict[str, str] = {}
    if id_cache_path.exists():
        cache = json.loads(id_cache_path.read_text())

    for a in authors:
        if a.get("openalex_id"):
            continue
        name = a["name"]
        if name in cache:
            a["openalex_id"] = cache[name]
            continue
        print(f"  resolving: {name}")
        aid = search_author_id(name)
        if aid:
            a["openalex_id"] = aid
            cache[name] = aid
        else:
            print(f"  ! could not resolve author: {name}")
        time.sleep(0.15)

    id_cache_path.write_text(json.dumps(cache, indent=2))
    return authors


def fetch_corpus_raw(authors: list[dict[str, Any]]) -> dict[str, dict]:
    """Return {work_id -> work} deduped across authors."""
    CACHE_DIR.mkdir(exist_ok=True)
    cache_path = CACHE_DIR / "corpus_raw.json"
    if cache_path.exists():
        print(f"  using cached raw corpus at {cache_path} (delete to refetch)")
        return json.loads(cache_path.read_text())

    works: dict[str, dict] = {}
    for author in authors:
        aid = author.get("openalex_id")
        if not aid:
            continue
        print(f"  fetching works for {author['name']} ({aid})")
        count_before = len(works)
        for w in tqdm(fetch_works_by_author(aid), desc=author["name"], unit="pap"):
            wid = short_id(w["id"])
            if wid not in works:
                works[wid] = w
        print(f"    +{len(works) - count_before} new (total {len(works)})")

    cache_path.write_text(json.dumps(works))
    return works


def make_paper_id(authors: list[str], year: int, title: str) -> str:
    first = authors[0] if authors else "unknown"
    second = authors[1] if len(authors) > 1 else None
    last_of = lambda n: slugify(n.split(" ")[-1])
    parts = [last_of(first)]
    if second and len(authors) == 2:
        parts.append(last_of(second))
    parts.append(str(year))
    parts.append(slugify(title)[:40])
    return "-".join(parts)


def load_overrides() -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    if not OVERRIDES_PATH.exists():
        return out
    with OVERRIDES_PATH.open() as f:
        reader = csv.DictReader((row for row in f if not row.startswith("#")))
        for row in reader:
            pid = (row.get("id") or "").strip()
            if not pid:
                continue
            out[pid] = row
    return out


def apply_override(paper: dict[str, Any], override: dict[str, Any]) -> dict[str, Any] | None:
    include = (override.get("include") or "").strip().upper()
    if include == "FALSE":
        return None
    pr = (override.get("primary_row") or "").strip()
    if pr:
        paper["primary_row"] = int(pr)
    sec = (override.get("secondary_rows") or "").strip()
    if sec:
        paper["secondary_rows"] = [int(x) for x in sec.split(";") if x.strip()]
    landmark = (override.get("landmark") or "").strip().upper()
    if landmark == "TRUE":
        paper["landmark"] = True
    elif landmark == "FALSE":
        paper["landmark"] = False
    return paper


def build_paper(work: dict, corpus_work_ids: set[str], id_map: dict[str, str]) -> dict[str, Any] | None:
    if not is_article(work):
        return None
    year = work.get("publication_year")
    if not year:
        return None
    title = (work.get("title") or "").strip()
    if not title:
        return None
    authors = primary_author_names(work)
    if not authors:
        return None
    abstract = decode_abstract(work.get("abstract_inverted_index"))

    wid = short_id(work["id"])
    pid = id_map.get(wid) or make_paper_id(authors, int(year), title)
    id_map[wid] = pid

    refs = referenced_ids(work)
    cites_in_corpus = unique(id_map[r] for r in refs if r in id_map and r in corpus_work_ids)

    primary = assign_primary_row(title, abstract)
    secondary = assign_secondary_rows(title, abstract, primary)

    doi = work.get("doi")
    if doi and doi.startswith("https://doi.org/"):
        doi = doi.removeprefix("https://doi.org/")

    arxiv = extract_arxiv_id(work)
    url = None
    if arxiv:
        url = f"https://arxiv.org/abs/{arxiv}"
    elif doi:
        url = f"https://doi.org/{doi}"

    return {
        "id": pid,
        "title": title,
        "authors": authors,
        "year": int(year),
        "venue": venue(work),
        "arxiv_id": arxiv,
        "doi": doi,
        "abstract": abstract or None,
        "url": url,
        "primary_row": primary,
        "secondary_rows": secondary,
        "cites_in_corpus": cites_in_corpus,
    }


def main() -> None:
    print("→ loading authors.yaml")
    authors = load_authors()
    print(f"  {len(authors)} authors in seed")

    print("→ resolving OpenAlex author IDs")
    authors = resolve_author_ids(authors)
    unresolved = [a for a in authors if not a.get("openalex_id")]
    if unresolved:
        print(f"  ! {len(unresolved)} unresolved authors; skipping")

    print("→ fetching works")
    raw = fetch_corpus_raw(authors)
    print(f"  {len(raw)} unique works")

    print("→ building paper records")
    corpus_work_ids = set(raw.keys())
    id_map: dict[str, str] = {}
    # Two passes so that cites_in_corpus can reference paper ids for refs we haven't processed yet.
    sorted_works = sorted(raw.values(), key=lambda w: (w.get("publication_year") or 0))
    for w in sorted_works:
        wid = short_id(w["id"])
        year = w.get("publication_year") or 0
        title = (w.get("title") or "").strip()
        authors_ = primary_author_names(w)
        if year and title and authors_:
            id_map[wid] = make_paper_id(authors_, int(year), title)

    papers: list[dict[str, Any]] = []
    for w in sorted_works:
        p = build_paper(w, corpus_work_ids, id_map)
        if p:
            papers.append(p)

    print(f"  {len(papers)} paper records")

    print("→ applying overrides")
    overrides = load_overrides()
    kept: list[dict[str, Any]] = []
    for p in papers:
        if p["id"] in overrides:
            out = apply_override(p, overrides[p["id"]])
            if out is not None:
                kept.append(out)
        else:
            kept.append(p)
    papers = kept
    print(f"  {len(papers)} papers after overrides")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(papers, indent=2, ensure_ascii=False))
    print(f"→ wrote {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size / 1024:.1f} KiB)")


if __name__ == "__main__":
    main()
