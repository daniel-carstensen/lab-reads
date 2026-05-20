import { BarChart3 } from "lucide-react";
import type { Member, Paper, ReadingLog } from "../types/data";
import { getWeekFromDate } from "../lib/dates";

function topEntry<T>(items: T[], getKey: (item: T) => string | undefined) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    if (key) acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
}

export function StatsPanel({
  papers,
  logs,
  members,
  currentWeek
}: {
  papers: Paper[];
  logs: ReadingLog[];
  members: Member[];
  currentWeek: string;
}) {
  const paperById = new Map(papers.map((paper) => [paper.id, paper]));
  const logsThisWeek = logs.filter((log) => getWeekFromDate(log.date) === currentWeek);
  const readPaperIdsThisWeek = new Set(logsThisWeek.map((log) => log.paperId));
  const mostRead = topEntry(logs, (log) => log.paperId);
  const mostDiscussed = topEntry(
    logs.filter((log) => log.discussionQuestion?.trim()),
    (log) => log.paperId
  );
  const tagCounts = papers
    .flatMap((paper) => paper.tags)
    .reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {});
  const commonTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag)
    .join(", ");
  const ratings = logs.flatMap((log) => (typeof log.rating === "number" ? [log.rating] : []));
  const averageRating = ratings.length
    ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
    : "n/a";
  const activeReaders = new Set(logsThisWeek.map((log) => log.memberId)).size;

  const stats = [
    { label: "Total papers", value: papers.length },
    { label: "Reading logs", value: logs.length },
    { label: "Papers read this week", value: readPaperIdsThisWeek.size },
    { label: "Active readers this week", value: `${activeReaders}/${members.length}` },
    {
      label: "Most-read paper",
      value: mostRead ? paperById.get(mostRead[0])?.title ?? mostRead[0] : "n/a"
    },
    {
      label: "Most-discussed paper",
      value: mostDiscussed ? paperById.get(mostDiscussed[0])?.title ?? mostDiscussed[0] : "n/a"
    },
    { label: "Common tags", value: commonTags || "n/a" },
    { label: "Average rating", value: averageRating }
  ];

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" aria-labelledby="stats-heading">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-lagoon" aria-hidden="true" />
        <h2 id="stats-heading" className="text-xl font-bold text-ink">
          Lab Stats
        </h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-ink/10 bg-paper/60 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink/55">{stat.label}</dt>
            <dd className="mt-2 line-clamp-3 text-lg font-bold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
