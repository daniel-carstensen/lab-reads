import { useEffect, useMemo, useState } from "react";
import { BadgeBoard } from "./components/BadgeBoard";
import { EmptyState } from "./components/EmptyState";
import { Filters, type FiltersState } from "./components/Filters";
import { Layout } from "./components/Layout";
import { Leaderboard } from "./components/Leaderboard";
import { ReadingHeatmap } from "./components/ReadingHeatmap";
import { StatsPanel } from "./components/StatsPanel";
import { SuggestedPapersPanel } from "./components/SuggestedPapersPanel";
import { WeekView } from "./components/WeekView";
import { loadAppData } from "./lib/data";
import { getCurrentWeek, getFutureWeekRange, getWeekFromDate, sortWeeksAsc, sortWeeksDesc } from "./lib/dates";
import type { AppData, Paper } from "./types/data";

const initialFilters: FiltersState = {
  week: "",
  memberId: "",
  tag: "",
  status: "",
  required: "",
  search: ""
};

function groupPapersByWeek(papers: Paper[]) {
  return papers.reduce<Record<string, Paper[]>>((groups, paper) => {
    groups[paper.week] = [...(groups[paper.week] ?? []), paper];
    return groups;
  }, {});
}

function matchesSearch(paper: Paper, search: string) {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;
  return [paper.title, paper.authors, paper.venue, paper.theme, paper.abstract, ...paper.tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    loadAppData()
      .then(setData)
      .catch((unknownError) => {
        setError(unknownError instanceof Error ? unknownError.message : "Unable to load site data.");
      });
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const paperWeeks = Array.from(new Set(data.papers.map((paper) => paper.week))).sort(sortWeeksDesc);
    const tags = Array.from(new Set(data.papers.flatMap((paper) => paper.tags))).sort((a, b) =>
      a.localeCompare(b)
    );
    const currentWeek = getCurrentWeek(paperWeeks, data.config.currentWeekMode);
    const logWeeks = data.logs.map((log) => getWeekFromDate(log.date));
    const heatmapWeeks = Array.from(
      new Set([...paperWeeks, ...logWeeks, ...getFutureWeekRange(currentWeek, 4)])
    ).sort(sortWeeksAsc);
    const filteredPapers = data.papers.filter((paper) => {
      const paperLogs = data.logs.filter((log) => log.paperId === paper.id);
      if (filters.week && paper.week !== filters.week) return false;
      if (filters.tag && !paper.tags.includes(filters.tag)) return false;
      if (filters.required === "required" && !paper.required) return false;
      if (filters.required === "optional" && paper.required) return false;
      if (filters.memberId && !paperLogs.some((log) => log.memberId === filters.memberId)) return false;
      if (filters.status && !paperLogs.some((log) => log.status === filters.status)) return false;
      return matchesSearch(paper, filters.search);
    });
    return {
      paperWeeks,
      heatmapWeeks,
      tags,
      currentWeek,
      filteredPapers,
      groupedPapers: groupPapersByWeek(filteredPapers)
    };
  }, [data, filters]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6">
        <EmptyState title="The data shelves did not load." detail={error} />
      </div>
    );
  }

  if (!data || !derived) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6 text-ink">
        <div className="rounded-lg border border-ink/10 bg-white px-5 py-4 shadow-soft">
          Loading paper quests...
        </div>
      </div>
    );
  }

  return (
    <Layout config={data.config} currentWeek={derived.currentWeek}>
      <StatsPanel
        papers={data.papers}
        logs={data.logs}
        members={data.members}
        currentWeek={derived.currentWeek}
      />
      <Filters
        filters={filters}
        onChange={setFilters}
        weeks={derived.paperWeeks}
        members={data.members}
        tags={derived.tags}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <section id="papers" className="grid content-start gap-6" aria-label="Weekly papers">
          {derived.filteredPapers.length ? (
            Object.entries(derived.groupedPapers)
              .sort(([weekA], [weekB]) => sortWeeksDesc(weekA, weekB))
              .map(([week, papers]) => (
                <WeekView
                  key={week}
                  week={week}
                  papers={papers}
                  logs={data.logs}
                  members={data.members}
                  config={data.config}
                />
              ))
          ) : (
            <EmptyState
              title="No papers match those filters."
              detail="Try a different week, tag, status, or search phrase."
            />
          )}
        </section>
        <aside className="grid content-start gap-6">
          <SuggestedPapersPanel papers={data.papers} logs={data.logs} />
          <Leaderboard
            members={data.members}
            papers={data.papers}
            logs={data.logs}
            config={data.config}
            allWeeks={derived.heatmapWeeks}
          />
        </aside>
      </div>
      <ReadingHeatmap
        members={data.members}
        logs={data.logs}
        weeks={derived.heatmapWeeks}
        config={data.config}
      />
      <BadgeBoard
        members={data.members}
        papers={data.papers}
        logs={data.logs}
        allWeeks={derived.heatmapWeeks}
      />
    </Layout>
  );
}
