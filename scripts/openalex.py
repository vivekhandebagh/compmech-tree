"""Thin OpenAlex client.

OpenAlex is free and needs no API key. Including a `mailto` query param
puts us in the "polite pool" with higher rate limits.
"""

from __future__ import annotations

import time
from typing import Iterable, Iterator

import httpx

BASE = "https://api.openalex.org"
POLITE_MAILTO = "compmech-tree@example.com"
PER_PAGE = 200


def _client() -> httpx.Client:
    return httpx.Client(
        base_url=BASE,
        params={"mailto": POLITE_MAILTO},
        timeout=30.0,
        headers={"User-Agent": f"compmech-tree/0.1 ({POLITE_MAILTO})"},
    )


def search_author_id(name: str) -> str | None:
    """Resolve an author name to the top-matching OpenAlex author ID."""
    with _client() as c:
        r = c.get("/authors", params={"search": name, "per-page": 5})
        r.raise_for_status()
        results = r.json().get("results", [])
        if not results:
            return None
        return results[0]["id"].rsplit("/", 1)[-1]


def fetch_works_by_author(author_id: str) -> Iterator[dict]:
    """Yield all works by an OpenAlex author ID, paginating via cursor."""
    cursor = "*"
    with _client() as c:
        while cursor:
            r = c.get(
                "/works",
                params={
                    "filter": f"author.id:{author_id}",
                    "per-page": PER_PAGE,
                    "cursor": cursor,
                },
            )
            r.raise_for_status()
            data = r.json()
            for work in data.get("results", []):
                yield work
            cursor = data.get("meta", {}).get("next_cursor")
            if cursor:
                time.sleep(0.1)  # be polite


def decode_abstract(inverted: dict[str, list[int]] | None) -> str:
    """OpenAlex stores abstracts as {word: [positions]}. Reconstruct."""
    if not inverted:
        return ""
    positions: list[tuple[int, str]] = []
    for word, poses in inverted.items():
        for p in poses:
            positions.append((p, word))
    positions.sort(key=lambda x: x[0])
    return " ".join(w for _, w in positions)


def extract_arxiv_id(work: dict) -> str | None:
    """Try to find an arXiv ID from a work's locations."""
    for loc in work.get("locations", []) or []:
        src = (loc.get("source") or {}).get("display_name", "")
        if "arxiv" in src.lower():
            landing = loc.get("landing_page_url") or ""
            if "arxiv.org/abs/" in landing:
                return landing.split("arxiv.org/abs/")[-1].split("?")[0].rstrip("/")
    ids = work.get("ids") or {}
    openalex_url = ids.get("openalex", "")
    # Fall back to scanning ids
    for key, val in ids.items():
        if isinstance(val, str) and "arxiv.org/abs/" in val:
            return val.split("arxiv.org/abs/")[-1].split("?")[0].rstrip("/")
    _ = openalex_url
    return None


def short_id(work_id: str) -> str:
    """Turn 'https://openalex.org/W12345' into 'W12345'."""
    return work_id.rsplit("/", 1)[-1]


def referenced_ids(work: dict) -> list[str]:
    return [short_id(w) for w in work.get("referenced_works", []) or []]


def primary_author_names(work: dict) -> list[str]:
    names = []
    for a in work.get("authorships", []) or []:
        name = (a.get("author") or {}).get("display_name") or ""
        if name:
            names.append(name)
    return names


def primary_author_ids(work: dict) -> list[str]:
    """Return OpenAlex short author IDs (Axxx) for a work's authors."""
    ids: list[str] = []
    for a in work.get("authorships", []) or []:
        aid = (a.get("author") or {}).get("id") or ""
        if aid:
            ids.append(short_id(aid))
    return ids


def venue(work: dict) -> str | None:
    src = (work.get("primary_location") or {}).get("source") or {}
    name = src.get("display_name") or ""
    return name or None


def is_article(work: dict) -> bool:
    t = (work.get("type") or "").lower()
    return t in {"article", "journal-article", "preprint"} or t == ""


def unique(seq: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out
