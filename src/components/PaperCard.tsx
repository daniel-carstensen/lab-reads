import { ChevronDown, ExternalLink, Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { Member, Paper, ReadingLog, SiteConfig } from "../types/data";
import { createReadingLogIssueUrl } from "../lib/github";

const statusLabels = {
  planned: "planned",
  skimmed: "skimmed",
  read: "read",
  deep_read: "deep read",
  presented: "presented"
};

function averageRating(logs: ReadingLog[]) {
  const ratings = logs.flatMap((log) => (typeof log.rating === "number" ? [log.rating] : []));
  if (!ratings.length) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function PaperCard({
  paper,
  logs,
  members,
  config
}: {
  paper: Paper;
  logs: ReadingLog[];
  members: Member[];
  config: SiteConfig;
}) {
  const [expanded, setExpanded] = useState(false);
  const memberById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const paperLogs = logs.filter((log) => log.paperId === paper.id);
  const ratingsAverage = averageRating(paperLogs);
  const reactionCounts = paperLogs.reduce<Record<string, number>>((counts, log) => {
    if (log.reaction) counts[log.reaction] = (counts[log.reaction] ?? 0) + 1;
    return counts;
  }, {});
  const statusCounts = paperLogs.reduce<Record<string, number>>((counts, log) => {
    counts[log.status] = (counts[log.status] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <article className="min-w-0 rounded-lg border border-ink/10 bg-white shadow-soft" id={paper.id}>
      <div className="grid gap-4 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-lagoon/10 px-2.5 py-1 text-xs font-semibold text-lagoon">
                {paper.required ? "Required" : "Optional"}
              </span>
              {paper.venue ? (
                <span className="rounded-full bg-berry/10 px-2.5 py-1 text-xs font-semibold text-berry">
                  {paper.venue}
                </span>
              ) : null}
            </div>
            <h3 className="break-words text-xl font-bold leading-snug text-ink">{paper.title}</h3>
            <p className="mt-1 text-sm text-ink/65">
              {paper.authors}, {paper.year}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {paper.url ? (
              <a
                className="inline-flex items-center gap-1 rounded-md border border-ink/15 px-3 py-2 text-sm font-medium text-ink transition hover:border-lagoon/50 focus:outline-none focus:ring-2 focus:ring-lagoon"
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${paper.title}`}
              >
                Paper <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
            <a
              className="inline-flex items-center rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon focus:ring-offset-2"
              href={createReadingLogIssueUrl({
                repoOwner: config.repoOwner,
                repoName: config.repoName,
                paperId: paper.id
              })}
              target="_blank"
              rel="noreferrer"
            >
              Log reading
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {paper.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-moss/10 px-2.5 py-1 text-xs text-moss">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-3 text-sm text-ink/75 md:grid-cols-3">
          <div>
            <span className="font-semibold text-ink">Progress:</span>{" "}
            {paperLogs.length ? `${paperLogs.length} logs` : "No logs yet"}
          </div>
          <div>
            <span className="font-semibold text-ink">Average rating:</span>{" "}
            {ratingsAverage ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
                {ratingsAverage.toFixed(1)}
              </span>
            ) : (
              "Not rated"
            )}
          </div>
          <div>
            <span className="font-semibold text-ink">Discussion lead:</span>{" "}
            {paper.discussionLead ?? "TBD"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {paperLogs.length ? (
            paperLogs.map((log) => {
              const member = memberById.get(log.memberId);
              return (
                <span
                  key={log.id}
                  className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-medium text-coral"
                >
                  {member?.displayName ?? log.memberId}:{" "}
                  {statusLabels[log.status]}
                </span>
              );
            })
          ) : (
            <span className="text-sm text-ink/55">No reading logs yet. Be the first to summon the Paper Goblin.</span>
          )}
        </div>

        <button
          className="inline-flex w-fit items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-ink transition hover:border-lagoon/50 focus:outline-none focus:ring-2 focus:ring-lagoon"
          type="button"
          aria-expanded={expanded}
          aria-controls={`${paper.id}-details`}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown
            className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
          {expanded ? "Hide logs" : "Show reader logs and IDs"}
        </button>
      </div>

      {expanded ? (
        <div id={`${paper.id}-details`} className="grid gap-5 border-t border-ink/10 p-4 sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(14rem,0.75fr)_minmax(0,1.25fr)]">
            <section aria-label="Paper identifiers" className="min-w-0">
              <h4 className="font-semibold text-ink">Copy-friendly IDs</h4>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
                <div className="min-w-0 rounded-md bg-paper/70 p-3">
                  <dt className="font-medium text-ink/70">paperId</dt>
                  <dd className="break-all font-mono text-ink">{paper.id}</dd>
                </div>
                <div className="min-w-0 rounded-md bg-paper/70 p-3">
                  <dt className="font-medium text-ink/70">member IDs</dt>
                  <dd className="break-words font-mono text-ink">
                    {members.map((member) => member.id).join(", ")}
                  </dd>
                </div>
                {paper.doi ? (
                  <div className="min-w-0 rounded-md bg-paper/70 p-3 sm:col-span-2 lg:col-span-1">
                    <dt className="font-medium text-ink/70">DOI</dt>
                    <dd className="break-all font-mono text-ink">{paper.doi}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section aria-label="Reader logs" className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold text-ink">Reader logs</h4>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <span key={status} className="rounded-full bg-lagoon/10 px-2 py-1 text-lagoon">
                      {status.replace("_", " ")}: {count}
                    </span>
                  ))}
                  {Object.entries(reactionCounts).map(([reaction, count]) => (
                    <span key={reaction} className="rounded-full bg-gold/10 px-2 py-1 text-ink">
                      {reaction} x {count}
                    </span>
                  ))}
                </div>
              </div>

              {paperLogs.length ? (
                <div className="mt-3 max-h-[28rem] overflow-y-auto pr-1 xl:max-h-[24rem]">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3 xl:grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]">
                    {paperLogs.map((log) => {
                      const member = memberById.get(log.memberId);
                      return (
                        <article
                          key={`${log.id}-detail`}
                          className="min-w-0 rounded-md border border-ink/10 bg-paper/70 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h5 className="truncate text-sm font-semibold text-ink">
                                {member?.displayName ?? log.memberId}
                              </h5>
                              <p className="text-xs text-ink/55">{log.date}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">
                              {statusLabels[log.status]}
                            </span>
                          </div>
                          <dl className="mt-3 grid gap-2 text-sm">
                            {typeof log.rating === "number" ? (
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                                  Rating
                                </dt>
                                <dd className="font-medium text-ink">{log.rating}/5</dd>
                              </div>
                            ) : null}
                            {log.notes?.trim() ? (
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                                  Note
                                </dt>
                                <dd className="text-ink/80">{log.notes}</dd>
                              </div>
                            ) : null}
                            {log.discussionQuestion?.trim() ? (
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                                  Question
                                </dt>
                                <dd className="text-ink/80">{log.discussionQuestion}</dd>
                              </div>
                            ) : null}
                          </dl>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="mt-3 rounded-md border border-dashed border-ink/15 bg-paper/70 p-3 text-sm text-ink/55">
                  No reading logs yet. Be the first to summon the Paper Goblin.
                </p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </article>
  );
}
