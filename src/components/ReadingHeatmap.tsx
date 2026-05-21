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
  const cellWidth = 3.35;
  const heatmapMinWidth = weeks.length > 4 ? `${6 + weeks.length * cellWidth}rem` : "100%";
  const values = members.flatMap((member) =>
    weeks.map((week) =>
      logs
        .filter((log) => log.memberId === member.id && getWeekFromDate(log.date) === week)
        .reduce((sum, log) => sum + scoreLog(log, config), 0)
    )
  );
  const max = Math.max(1, ...values);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:p-5" aria-labelledby="heatmap-heading">
      <div className="mb-4">
        <h2 id="heatmap-heading" className="text-xl font-bold text-ink">
          Reading Heatmap
        </h2>
        <p className="text-sm text-ink/60">Rows are members, columns are weeks, color is points logged.</p>
      </div>
      <div className="-mx-2 overflow-x-auto px-2">
        <div style={{ minWidth: heatmapMinWidth }}>
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{ gridTemplateColumns: `minmax(5.5rem, 0.85fr) repeat(${weeks.length}, minmax(3rem, 1fr))` }}
          >
            <div />
            {weeks.map((week) => (
              <div key={week} className="truncate text-center text-[0.68rem] font-semibold text-ink/60 sm:text-xs">
                <span className="hidden sm:inline">{week}</span>
                <span className="sm:hidden">{week.replace(/^20/, "'").replace("-W", " W")}</span>
              </div>
            ))}
            {members.map((member) => (
              <Fragment key={member.id}>
                <div key={`${member.id}-label`} className="flex items-center gap-2 truncate text-xs font-medium text-ink sm:text-sm">
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
                      className="grid h-8 place-items-center rounded-md border border-ink/10 text-xs font-semibold text-ink sm:h-9"
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
