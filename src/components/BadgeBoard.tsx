import type { Member, Paper, ReadingLog } from "../types/data";
import { getAllBadges, getEarnedBadges } from "../lib/badges";

export function BadgeBoard({
  members,
  papers,
  logs,
  allWeeks
}: {
  members: Member[];
  papers: Paper[];
  logs: ReadingLog[];
  allWeeks: string[];
}) {
  const allBadges = getAllBadges();

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" aria-labelledby="badges-heading">
      <div className="mb-4">
        <h2 id="badges-heading" className="text-xl font-bold text-ink">
          Badge Board
        </h2>
        <p className="text-sm text-ink/60">Little merit badges for useful reading habits.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {allBadges.map((badge) => {
          const earners = members.filter((member) =>
            getEarnedBadges(member, papers, logs, allWeeks).some((earned) => earned.id === badge.id)
          );
          return (
            <article key={badge.id} className="rounded-lg border border-ink/10 bg-paper/60 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {badge.emoji}
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{badge.name}</h3>
                  <p className="mt-1 text-sm text-ink/60">{badge.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-moss">
                    {earners.length ? `${earners.length} earned` : "Waiting for its first claimant"}
                  </p>
                  {earners.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {earners.map((member) => (
                        <span key={member.id} className="rounded-full bg-white px-2 py-1 text-xs text-ink/75">
                          {member.displayName}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
