export function About() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-[14px] leading-relaxed text-neutral-800">
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">About compmech-tree</h1>
      <p className="mb-4">
        An interactive timeline of the ideas of <em>computational mechanics</em> — the framework
        developed by James P. Crutchfield and collaborators for detecting, quantifying, and modeling
        pattern and structure in stochastic processes.
      </p>
      <p className="mb-4">
        Each paper is a node placed at its publication year (x-axis) within a concept region
        (y-axis). The ten rows are hand-chosen to reflect how the field is organized internally:
        from ε-machine foundations and information measures to thermodynamics of prediction and
        quantum computational mechanics, with two threads — early nonlinear dynamics and
        evolutionary / adaptive systems — at the edges.
      </p>
      <p className="mb-4">
        <strong>Corpus</strong>: James P. Crutchfield + his direct PhD students. In-corpus citation
        edges are taken directly from reference lists (OpenAlex) — they are noisy, and a curated
        "intellectual parent" pass is a planned upgrade.
      </p>
      <p className="mb-4">
        <strong>Limitations</strong>: This MVP treats all in-corpus citations equally; primary-row
        assignment is keyword-heuristic with human review; some recent students may be missing from
        the seed list.
      </p>
    </div>
  );
}
