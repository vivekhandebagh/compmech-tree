# Known limitations and future work

Living document of what the MVP does *not* do, or does approximately, and
where the obvious upgrade paths are. Grouped by layer.

## Corpus / scope

### Student post-Davis work is excluded
The pipeline admits a paper only if **James P. Crutchfield** is a listed
co-author (`scripts/build_corpus.py` → co-author filter, search
`CRUTCHFIELD_NAME`). This was added to fight OpenAlex author-disambiguation
noise (see next item). Consequences:
- Post-Davis solo compmech work by Shalizi, Marzen, Ellison, Mahoney, Boyd,
  Riechers, Varn, etc. is missing.
- Upgrade path: relax the filter to `(Crutchfield is co-author) OR
  (paper's references intersect the Crutchfield-coauthored set)` — admits
  compmech-adjacent solo student work while still rejecting name-collision
  noise.

### OpenAlex name-based author resolution is unreliable
`scripts/openalex.py:search_author_id` takes the top match for a plain-text
name. That matched several wrong humans at this scale — "Ryan G. James" matched
an OpenAlex ID with 825 works, "Rajarshi Das" matched 436, etc. The co-author
filter papered over this but the underlying IDs in
`scripts/.cache/author_ids.json` may be wrong.
- Upgrade: pin verified `openalex_id` values per author in `authors.yaml`. The
  pipeline already respects a provided ID and skips the search.
- `Daniel R. Upper` failed to resolve entirely.

### `scripts/authors.yaml` is partially unverified
Eleven author entries are marked `TODO-VERIFY` — well-known in the lab's
published work but not cross-checked against the authoritative CV. Verify
against [JPCCV](https://csc.ucdavis.edu/~chaos/Biography/JPCCV.www.html).

### Duplicate preprint/journal pairs
OpenAlex sometimes treats the arXiv preprint and the journal version of the
same paper as separate works (e.g. Shalizi & Crutchfield 2001 CMPPSS appears
as both a 1999 preprint and a 2001 journal article). Dedup by DOI/arXiv
cross-reference would collapse these.

### MS students and collaborators may be missing
The seed list is PhDs + postdocs. MS-only advisees (e.g. Olof Gornerup,
Victoria Alexander) and external collaborators (Melanie Mitchell, Jim
Odell, etc.) aren't in the seed.

## Taxonomy / row assignment

### Keyword heuristic is blunt
`scripts/assign_rows.py` uses a ~30-rule keyword regex scoring pass with a
fallback to row 3 (Information Measures), which is why row 3 has 101 papers —
it absorbs anything with "information" or "predict" and no stronger signal.
Known misclassifications spot-checked so far:
- *Inferring Statistical Complexity* (Crutchfield & Young 1989) → row 3;
  belongs in row 2 (Foundations).
- Apply `scripts/overrides.csv` per paper (see its header for format).
- Upgrade path: LLM-assisted assignment pass (prompt LLM with title + abstract
  + taxonomy; keep LLM primary-row call for high-confidence papers, human
  review for the rest). This is M3's real content.

### Secondary rows are computed but not visualized
`scripts/build_corpus.py` emits `secondary_rows` per paper, and `Paper.tsx`
reads them, but `SwimLane.tsx` does not render cross-row arcs for secondary
associations. The plan called for translucent arcs connecting a paper to its
secondary-row counterparts; defer to a v2 since it adds visual density.

### No taxonomy concept-thread objects
The v2 plan calls for named "concept threads" (e.g. "the ε-machine story",
"thermodynamics of prediction") as Sankey-style ribbons that split and merge
at synthesis papers. Not implemented — all we have is 1 row per paper.

## Citation edges

### `cites_in_corpus` is raw references, not intellectual parents
An edge exists whenever a paper's OpenAlex `referenced_works` list contains
another in-corpus paper. That includes background references that aren't really
the intellectual parent. Expect the edges visible on hover to be noisier than
what a hand-curated lineage would show.
- Upgrade: hand-curate a `parents.csv` identifying the 1–3 "real" intellectual
  parents per paper. Show both; toggle in UI.

### No incoming-edge index
For a pinned paper, the descendant lookup scans all 394 papers
(`SwimLane.tsx` computes `highlightedIds` per hover). Fine at this size, but
if the corpus ever grows to O(10k), precompute an adjacency index at load
time.

## Visualization / frontend

### No mini-map (queued for M4)
A bottom-of-viewport mini-map for jump navigation is in the plan but not yet
built.

### No keyboard navigation (queued for M4)
`←/→` to step papers in time and `↑/↓` to change row are planned but not
implemented. `Escape` to unpin would be a natural add.

### No zoom levels (queued for M4)
Timeline is rendered at a single horizontal density (`X_PER_YEAR = 80`). A
zoomed-out mode showing only landmark papers, and a zoomed-in mode with per-
paper titles, would help navigation as the corpus grows.

### Same-year papers stack at the same x-coordinate
Within a row, papers in the same year are drawn at the same `x`, so their
circles overlap. Modest y-jitter within a row, or a small horizontal offset
by month, would unstack them.

### Uniform node size
Intentional per user preference. Flag in `Paper.type` is ready (`landmark`) to
support a future "landmarks larger" or "citation-count size" toggle.

### Mobile is unsupported
Side panel uses `hidden lg:block`; below `lg` (1024px) there's no way to view
paper details. Designing a mobile-friendly variant (bottom sheet, in-place
expansion) is a v2.

### `YEAR_MAX` is `new Date().getFullYear()`
Computed at runtime, so next Jan 1 the axis silently extends a year. Minor.

### No legend / key for edge colors
Hover highlights show ancestors (solid blue) and descendants (dashed warm
gray). There's no visible legend explaining which is which; discoverable only
by reading the side panel list ordering.

### No URL state for scroll position / pinned paper
Refreshing the timeline loses scroll offset. `pinnedId` also doesn't go into
the URL — `/#/paper/:id` is a separate route. Persisting these would enable
shareable deep links into a specific view.

## Infrastructure

### GitHub Pages deploy workflow exists but is untested
`.github/workflows/deploy.yml` was authored to the current GH Pages spec but
the repo hasn't been pushed to a remote or had Pages enabled. First deploy
will need the repo's Pages settings set to "GitHub Actions" as the source.

### No CI typecheck / lint
The repo has `npm run typecheck` and `npm run build`, but no GitHub Action
runs them on PRs. Should be added before the repo goes public.

### No tests
Viz components and pipeline both lack tests. Low priority for an MVP of this
shape, but the pipeline would benefit from a few unit tests of
`assign_rows.assign_primary_row` and `openalex.decode_abstract`.

### Pipeline cache is not invalidated automatically
`scripts/.cache/corpus_raw.json` is reused indefinitely. Delete it manually
to refetch (or add a `--refresh` flag).

## Data model quirks

### `arxiv_id` extraction is best-effort
`scripts/openalex.py:extract_arxiv_id` looks at locations and ids, but
OpenAlex's metadata is inconsistent — expect many missing `arxiv_id` fields
even for papers that have preprints. Fall-through to DOI URL when arXiv is
missing.

### `authors[0]` is not necessarily the first author
OpenAlex's `authorships` array is usually ordered, but not guaranteed to be.
When the side panel shows "Last-name et al., year", verify order if that
becomes important.
