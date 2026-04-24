# compmech-tree

An interactive, horizontal-scroll timeline visualizing the chronology and
evolution of ideas in computational mechanics — the framework developed by
James P. Crutchfield and his students.

## What you see

A swim-lane timeline where each row is a **concept region** of the field
(foundations / ε-machines, information measures, stochastic-process structure,
inference, spatial, thermodynamics, quantum, applications, and two legacy
threads). Each paper is a node placed at (x = year, y = primary concept region).
Hover a paper to see its abstract and which prior in-lab papers it builds on.

## Scope

Corpus: James P. Crutchfield + his direct PhD students. ~400–600 papers,
~1980–present.

## Running locally

```bash
npm install
npm run dev            # http://localhost:5173
```

## Rebuilding the corpus

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/build_corpus.py
```

Edit `scripts/authors.yaml` to change the author seed list, and
`scripts/overrides.csv` to hand-adjust per-paper row assignments.

## Tech

React + TypeScript + Vite + Tailwind, D3 for scales, SVG for rendering. Static
JSON data, hosted on GitHub Pages.
