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
  const notes = paperLogs.filter((log) => log.notes?.trim());
  const questions = paperLogs.filter((log) => log.discussionQuestion?.trim());
  const reactionCounts = paperLogs.reduce<Record<string, number>>((counts, log) => {
    if (log.reaction) counts[log.reaction] = (counts[log.reaction] ?? 0) + 1;
    return counts;
  }, {});
  const statusCounts = paperLogs.reduce<Record<string, number>>((counts, log) => {
    counts[log.status] = (counts[log.status] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <article className="rounded-lg border border-ink/10 bg-white shadow-soft" id={paper.id}>
      <div className="grid gap-4 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
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
            <h3 className="text-xl font-bold leading-snug text-ink">{paper.title}</h3>
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
          {expanded ? "Hide notes" : "Show notes and IDs"}
        </button>
      </div>

      {expanded ? (
        <div id={`${paper.id}-details`} className="border-t border-ink/10 px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <section aria-label="Paper identifiers">
              <h4 className="font-semibold text-ink">Copy-friendly IDs</h4>
              <dl className="mt-3 grid gap-2 text-sm">
                <div>
                  <dt className="font-medium text-ink/70">paperId</dt>
                  <dd className="font-mono text-ink">{paper.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink/70">member IDs</dt>
                  <dd className="font-mono text-ink">{members.map((member) => member.id).join(", ")}</dd>
                </div>
                {paper.doi ? (
                  <div>
                    <dt className="font-medium text-ink/70">DOI</dt>
                    <dd className="font-mono text-ink">{paper.doi}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
            <section aria-label="Reading summary">
              <h4 className="font-semibold text-ink">Reading summary</h4>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <span key={status} className="rounded-full bg-lagoon/10 px-2.5 py-1 text-lagoon">
                    {status.replace("_", " ")}: {count}
                  </span>
                ))}
                {Object.entries(reactionCounts).map(([reaction, count]) => (
                  <span key={reaction} className="rounded-full bg-gold/10 px-2.5 py-1 text-ink">
                    {reaction} x {count}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section aria-label="Notes">
              <h4 className="font-semibold text-ink">Notes</h4>
              {notes.length ? (
                <ul className="mt-3 grid gap-3">
                  {notes.map((log) => {
                    const member = memberById.get(log.memberId);
                    return (
                      <li key={`${log.id}-note`} className="border-l-4 border-lagoon/30 pl-3 text-sm">
                        <p className="text-ink/80">{log.notes}</p>
                        <p className="mt-1 text-xs font-medium text-ink/55">
                          {member?.displayName ?? log.memberId} on {log.date}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink/55">No notes yet - the margins are waiting.</p>
              )}
            </section>
            <section aria-label="Discussion questions">
              <h4 className="font-semibold text-ink">Discussion questions</h4>
              {questions.length ? (
                <ul className="mt-3 grid gap-3">
                  {questions.map((log) => {
                    const member = memberById.get(log.memberId);
                    return (
                      <li key={`${log.id}-question`} className="border-l-4 border-coral/30 pl-3 text-sm">
                        <p className="text-ink/80">{log.discussionQuestion}</p>
                        <p className="mt-1 text-xs font-medium text-ink/55">
                          {member?.displayName ?? log.memberId} on {log.date}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink/55">No questions yet - discussion has room to bloom.</p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </article>
  );
}
