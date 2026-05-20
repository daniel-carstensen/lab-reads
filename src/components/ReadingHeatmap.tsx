import { Fragment } from "react";
import type { Member, ReadingLog, SiteConfig } from "../types/data";
import { getWeekFromDate } from "../lib/dates";
import { scoreLog } from "../lib/scoring";

export function ReadingHeatmap({
  members,
  logs,
  weeks,
  config
}: {
  members: Member[];
  logs: ReadingLog[];
  weeks: string[];
  config: SiteConfig;
}) {
  const values = members.flatMap((member) =>
    weeks.map((week) =>
      logs
        .filter((log) => log.memberId === member.id && getWeekFromDate(log.date) === week)
        .reduce((sum, log) => sum + scoreLog(log, config), 0)
    )
  );
  const max = Math.max(1, ...values);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" aria-labelledby="heatmap-heading">
      <div className="mb-4">
        <h2 id="heatmap-heading" className="text-xl font-bold text-ink">
          Reading Heatmap
        </h2>
        <p className="text-sm text-ink/60">Rows are members, columns are weeks, color is points logged.</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `minmax(8rem, 1fr) repeat(${weeks.length}, minmax(5rem, 0.7fr))` }}
          >
            <div />
            {weeks.map((week) => (
              <div key={week} className="text-center text-xs font-semibold text-ink/60">
                {week}
              </div>
            ))}
            {members.map((member) => (
              <Fragment key={member.id}>
                <div key={`${member.id}-label`} className="flex items-center gap-2 text-sm font-medium text-ink">
                  {member.displayName}
                </div>
                {weeks.map((week) => {
                  const points = logs
                    .filter((log) => log.memberId === member.id && getWeekFromDate(log.date) === week)
                    .reduce((sum, log) => sum + scoreLog(log, config), 0);
                  const opacity = Math.max(0.08, points / max);
                  return (
                    <div
                      key={`${member.id}-${week}`}
                      className="grid h-10 place-items-center rounded-md border border-ink/10 text-xs font-semibold text-ink"
                      style={{ backgroundColor: `rgba(52, 123, 138, ${opacity})` }}
                      title={`${member.displayName}, ${week}: ${points} points`}
                    >
                      {points || ""}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
