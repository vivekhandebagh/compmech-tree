"""Keyword-heuristic primary-row assignment for MVP.

LLM-assisted assignment is a planned upgrade; for now we use a simple
keyword-rule pass that is transparent and easy to audit. Users refine
with scripts/overrides.csv.
"""

from __future__ import annotations

import re

# (primary_row_id, keyword_regex, weight)
RULES: list[tuple[int, re.Pattern[str], float]] = [
    # 8 quantum compmech (check before 2 / 3 so "quantum epsilon-machine" hits 8)
    (8, re.compile(r"\bquantum\b", re.I), 5),
    # 7 thermodynamics of computation & prediction
    (7, re.compile(r"\bthermodynam", re.I), 4),
    (7, re.compile(r"\blandauer\b", re.I), 4),
    (7, re.compile(r"\bmaxwell(?:'|)s? demon|ratchet|info(?:rmation)?[- ]engine", re.I), 4),
    (7, re.compile(r"\bdissipat|erasure\b", re.I), 2),
    # 5 inference & learning
    (5, re.compile(r"\binference|infer\b|learning|reconstruction|cssr|bayesian\b", re.I), 3),
    (5, re.compile(r"\balgorithm\b", re.I), 1),
    # 6 spatial / pattern compmech
    (6, re.compile(r"\bcellular automat|spatiotemporal|space[- ]time|lattice\b", re.I), 3),
    (6, re.compile(r"\bparticle|domain\b", re.I), 1),
    # 10 evolutionary & adaptive
    (10, re.compile(r"\bgenetic algorithm|evolutionary|evolution|adaptation\b", re.I), 3),
    # 2 foundations ε-machines
    (2, re.compile(r"epsilon[- ]?machine|ε[- ]?machine|causal state", re.I), 4),
    (2, re.compile(r"\bunifilar|minimality|equivalence\b", re.I), 2),
    # 4 stochastic-process structure
    (4, re.compile(r"hidden markov|hmm|stochastic process|mixed[- ]state|process lattice", re.I), 3),
    (4, re.compile(r"\bcrypticity|time['’]s arrow\b", re.I), 3),
    # 3 information measures
    (3, re.compile(r"statistical complex|excess entropy|entropy rate", re.I), 3),
    (3, re.compile(r"\bpredict\w*\b", re.I), 1),
    (3, re.compile(r"\binformation\b", re.I), 1),
    # 9 applications
    (9, re.compile(r"x-?ray|diffraction|close[- ]packed|material|protein|neural data|neuroscience|financ(?:e|ial)|language", re.I), 3),
    # 1 nonlinear dynamics & chaos (legacy)
    (1, re.compile(r"\bchaos|strange attractor|dynamical system|fluctuat|noise\b", re.I), 2),
]

DEFAULT_ROW = 3  # information measures is the safest fallback


def assign_primary_row(title: str, abstract: str) -> int:
    text = f"{title}\n{abstract}"
    scores: dict[int, float] = {}
    for row, pat, weight in RULES:
        if pat.search(text):
            scores[row] = scores.get(row, 0) + weight
    if not scores:
        return DEFAULT_ROW
    return max(scores.items(), key=lambda kv: (kv[1], -kv[0]))[0]


def assign_secondary_rows(title: str, abstract: str, primary: int) -> list[int]:
    text = f"{title}\n{abstract}"
    scores: dict[int, float] = {}
    for row, pat, weight in RULES:
        if row == primary:
            continue
        if pat.search(text):
            scores[row] = scores.get(row, 0) + weight
    ranked = sorted(scores.items(), key=lambda kv: -kv[1])
    # Only keep rows with score >= 2; cap at 2 secondary rows
    return [r for r, s in ranked if s >= 2][:2]
