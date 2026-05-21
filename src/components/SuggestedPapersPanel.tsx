import { Lightbulb } from "lucide-react";
import type { Paper, ReadingLog } from "../types/data";

export function SuggestedPapersPanel({ papers, logs }: { papers: Paper[]; logs: ReadingLog[] }) {
  const suggestedPapers = papers
    .filter((paper) => Number.isInteger(paper.sourceIssue))
    .sort((a, b) => {
      if (a.week !== b.week) return b.week.localeCompare(a.week);
      return a.title.localeCompare(b.title);
    });

  return (
    <section
      className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
      aria-labelledby="suggested-papers-heading"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="suggested-papers-heading" className="text-xl font-bold text-ink">
            Suggested Papers
          </h2>
          <p className="text-sm text-ink/60">Freshly nominated papers, logged or not.</p>
        </div>
        <Lightbulb className="h-6 w-6 text-gold" aria-hidden="true" />
      </div>

      {suggestedPapers.length ? (
        <div className="grid max-h-[24rem] gap-3 overflow-y-auto pr-1">
          {suggestedPapers.map((paper) => {
            const logCount = logs.filter((log) => log.paperId === paper.id).length;
            return (
              <article key={paper.id} className="rounded-lg border border-ink/10 bg-paper/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-lagoon/10 px-2.5 py-1 text-xs font-semibold text-lagoon">
                    {paper.week}
                  </span>
                  <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold text-ink/70">
                    {logCount} {logCount === 1 ? "log" : "logs"}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug text-ink">{paper.title}</h3>
                <p className="mt-1 text-xs text-ink/60">
                  {paper.authors}, {paper.year}
                </p>
                <p className="mt-2 break-all font-mono text-xs text-ink/55">{paper.id}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {paper.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-moss/10 px-2 py-1 text-xs text-moss">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-ink/15 bg-paper/60 p-4 text-sm text-ink/60">
          No issue-generated suggestions yet. Closed paper suggestion issues will appear here after
          the hourly processor runs.
        </p>
      )}
    </section>
  );
}
