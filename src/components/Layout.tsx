import { BookOpen, Github, PlusCircle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { SiteConfig } from "../types/data";
import { createPaperSuggestionIssueUrl, createReadingLogIssueUrl, createRepoUrl } from "../lib/github";

export function Layout({
  children,
  config,
  currentWeek
}: {
  children: ReactNode;
  config: SiteConfig;
  currentWeek: string;
}) {
  const repoUrl = createRepoUrl(config.repoOwner, config.repoName);

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink xl:overflow-x-visible">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-5 px-3 py-6 sm:px-6 lg:px-8">
          <nav className="flex min-w-0 flex-wrap items-center justify-between gap-3" aria-label="Primary">
            <a href="#papers" className="inline-flex min-w-0 max-w-full items-center gap-2 font-semibold text-ink">
              <BookOpen className="h-5 w-5 shrink-0 text-lagoon" aria-hidden="true" />
              <span className="truncate">{config.labName}</span>
            </a>
            <div className="flex flex-wrap items-center gap-2">
              <a
                className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-lagoon/50 focus:outline-none focus:ring-2 focus:ring-lagoon"
                href={createReadingLogIssueUrl({
                  repoOwner: config.repoOwner,
                  repoName: config.repoName,
                  paperId: "paper-id"
                })}
                target="_blank"
                rel="noreferrer"
              >
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Log reading
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral"
                href={createPaperSuggestionIssueUrl({
                  repoOwner: config.repoOwner,
                  repoName: config.repoName
                })}
                target="_blank"
                rel="noreferrer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Suggest paper
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-berry/50 focus:outline-none focus:ring-2 focus:ring-berry"
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open GitHub repository ${config.repoOwner}/${config.repoName}`}
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                Repository
              </a>
            </div>
          </nav>
          <div className="grid min-w-0 gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">
                Current week: {currentWeek}
              </p>
              <h1 className="mt-2 max-w-3xl break-words text-3xl font-bold leading-tight text-ink sm:text-4xl">
                {config.labName}
              </h1>
              {config.siteSubtitle ? (
                <p className="mt-3 max-w-2xl text-base text-ink/70">{config.siteSubtitle}</p>
              ) : null}
            </div>
            <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink/75">
              <span className="font-semibold text-ink">Tiny trophies.</span> Scholarly chaos,
              neatly indexed.
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl min-w-0 gap-6 px-3 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
