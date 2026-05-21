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
  const longestNameLength = Math.max(6, ...members.map((member) => member.displayName.length));
  const labelWidth = Math.min(14, Math.max(5.5, longestNameLength * 0.62 + 1.25));
  const cellWidth = 5.25;
  const heatmapWidth = `${labelWidth + weeks.length * cellWidth}rem`;
  const values = members.flatMap((member) =>
    weeks.map((week) =>
      logs
        .filter((log) => log.memberId === member.id && getWeekFromDate(log.date) === week)
        .reduce((sum, log) => sum + scoreLog(log, config), 0)
    )
  );
  const max = Math.max(1, ...values);

  return (
    <section className="min-w-0 rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:p-5" aria-labelledby="heatmap-heading">
      <div className="mb-4">
        <h2 id="heatmap-heading" className="text-xl font-bold text-ink">
          Reading Heatmap
        </h2>
        <p className="text-sm text-ink/60">Rows are members, columns are weeks, color is points logged.</p>
      </div>
      <div className="-mx-2 max-h-[24rem] max-w-full overflow-auto px-2 pb-1">
        <div style={{ width: heatmapWidth }}>
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{ gridTemplateColumns: `${labelWidth}rem repeat(${weeks.length}, ${cellWidth}rem)` }}
          >
            <div className="sticky left-0 top-0 z-30 bg-white shadow-[8px_0_10px_-10px_rgba(24,32,47,0.45)]" />
            {weeks.map((week) => (
              <div key={week} className="sticky top-0 z-10 bg-white py-1 text-center text-xs font-semibold text-ink/60">
                {week}
              </div>
            ))}
            {members.map((member) => (
              <Fragment key={member.id}>
                <div key={`${member.id}-label`} className="sticky left-0 z-20 flex h-8 items-center gap-2 truncate bg-white pr-3 text-xs font-medium text-ink shadow-[8px_0_10px_-10px_rgba(24,32,47,0.45)] sm:h-9 sm:text-sm">
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
