import type { Member, Paper, ReadingLog, SiteConfig } from "../types/data";
import { PaperCard } from "./PaperCard";

export function WeekView({
  week,
  papers,
  logs,
  members,
  config
}: {
  week: string;
  papers: Paper[];
  logs: ReadingLog[];
  members: Member[];
  config: SiteConfig;
}) {
  const theme = papers.find((paper) => paper.theme)?.theme;

  return (
    <section className="grid gap-4" aria-labelledby={`${week}-heading`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={`${week}-heading`} className="text-2xl font-bold text-ink">
            {week}
          </h2>
          {theme ? <p className="mt-1 text-sm text-ink/65">{theme}</p> : null}
        </div>
        <p className="text-sm font-medium text-ink/55">
          {papers.length} {papers.length === 1 ? "paper" : "papers"}
        </p>
      </div>
      <div className="grid gap-4">
        {papers.map((paper) => (
          <PaperCard
            key={paper.id}
            paper={paper}
            logs={logs}
            members={members}
            config={config}
          />
        ))}
      </div>
    </section>
  );
}
