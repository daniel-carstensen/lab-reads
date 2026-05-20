import { Trophy } from "lucide-react";
import type { Member, Paper, ReadingLog, SiteConfig } from "../types/data";
import { getEarnedBadges } from "../lib/badges";
import { buildLeaderboard } from "../lib/scoring";

export function Leaderboard({
  members,
  papers,
  logs,
  config,
  allWeeks
}: {
  members: Member[];
  papers: Paper[];
  logs: ReadingLog[];
  config: SiteConfig;
  allWeeks: string[];
}) {
  const rows = buildLeaderboard(members, papers, logs, config);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" aria-labelledby="leaderboard-heading">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="leaderboard-heading" className="text-xl font-bold text-ink">
            Lab Reading Leaderboard
          </h2>
          <p className="text-sm text-ink/60">Tiny trophies for scholarly chaos</p>
        </div>
        <Trophy className="h-6 w-6 text-gold" aria-hidden="true" />
      </div>
      <div className="grid gap-3">
        {rows.map((row, index) => {
          const badges = getEarnedBadges(row.member, papers, logs, allWeeks);
          return (
            <article key={row.member.id} className="rounded-lg border border-ink/10 bg-paper/60 p-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-lagoon/10 text-sm font-bold text-lagoon">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-ink">{row.member.displayName}</h3>
                  <p className="truncate text-xs text-ink/55">{row.member.role ?? "Lab member"}</p>
                </div>
                <div className="min-w-[4.5rem] text-right">
                  <p className="font-mono text-2xl font-bold tabular-nums text-ink">{row.totalPoints}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">pts</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 xl:grid-cols-2">
                <div className="rounded-md bg-white/75 p-2">
                  <dt className="text-xs text-ink/55">Papers</dt>
                  <dd className="font-mono font-semibold tabular-nums">{row.papersRead}</dd>
                </div>
                <div className="rounded-md bg-white/75 p-2">
                  <dt className="text-xs text-ink/55">Deep reads</dt>
                  <dd className="font-mono font-semibold tabular-nums">{row.deepReads}</dd>
                </div>
                <div className="rounded-md bg-white/75 p-2">
                  <dt className="text-xs text-ink/55">Presented</dt>
                  <dd className="font-mono font-semibold tabular-nums">{row.presentations}</dd>
                </div>
                <div className="rounded-md bg-white/75 p-2">
                  <dt className="text-xs text-ink/55">Notes</dt>
                  <dd className="font-mono font-semibold tabular-nums">{row.notes}</dd>
                </div>
                <div className="rounded-md bg-white/75 p-2">
                  <dt className="text-xs text-ink/55">Streak</dt>
                  <dd className="font-mono font-semibold tabular-nums">{row.currentWeeklyStreak}</dd>
                </div>
                <div className="rounded-md bg-white/75 p-2">
                  <dt className="text-xs text-ink/55">Best streak</dt>
                  <dd className="font-mono font-semibold tabular-nums">{row.longestWeeklyStreak}</dd>
                </div>
              </dl>
              {badges.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {badges.slice(0, 5).map((badge) => (
                    <span key={badge.id} className="rounded-full bg-berry/10 px-2.5 py-1 text-xs text-berry">
                      {badge.emoji} {badge.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
