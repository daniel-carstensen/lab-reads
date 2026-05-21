import type { Member, Paper, ReadingLog, SiteConfig } from "../types/data";
import { getWeekFromDate } from "./dates";

export type LeaderboardRow = {
  member: Member;
  totalPoints: number;
  papersRead: number;
  deepReads: number;
  presentations: number;
  notes: number;
  discussionQuestions: number;
  currentWeeklyStreak: number;
  longestWeeklyStreak: number;
};

const fallbackPoints = {
  planned: 0,
  skimmed: 1,
  read: 3,
  deep_read: 5,
  presented: 6,
  notes_bonus: 1,
  discussion_question_bonus: 1
};

export function scoreLog(log: ReadingLog, config: SiteConfig) {
  const points = { ...fallbackPoints, ...config.points };
  return (
    (points[log.status] ?? 0) +
    (log.notes?.trim() ? points.notes_bonus : 0) +
    (log.discussionQuestion?.trim() ? points.discussion_question_bonus : 0)
  );
}

export function getActiveWeeks(logs: ReadingLog[]) {
  return Array.from(new Set(logs.map((log) => getWeekFromDate(log.date)))).sort();
}

export function getWeeklyStreaks(logs: ReadingLog[], allWeeks: string[]) {
  const weeksWithLogs = new Set(logs.map((log) => getWeekFromDate(log.date)));
  const orderedWeeks = [...allWeeks].sort();
  let current = 0;
  let longest = 0;
  let running = 0;

  for (const week of orderedWeeks) {
    if (weeksWithLogs.has(week)) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let lastLoggedWeekIndex = -1;
  for (let index = orderedWeeks.length - 1; index >= 0; index -= 1) {
    if (weeksWithLogs.has(orderedWeeks[index])) {
      lastLoggedWeekIndex = index;
      break;
    }
  }
  for (let index = lastLoggedWeekIndex; index >= 0; index -= 1) {
    if (!weeksWithLogs.has(orderedWeeks[index])) break;
    current += 1;
  }

  return { current, longest };
}

export function buildLeaderboard(
  members: Member[],
  papers: Paper[],
  logs: ReadingLog[],
  config: SiteConfig
): LeaderboardRow[] {
  const paperWeeks = papers.map((paper) => paper.week);
  const logWeeks = getActiveWeeks(logs);
  const allWeeks = Array.from(new Set([...paperWeeks, ...logWeeks])).sort();

  return members
    .filter((member) => member.active)
    .map((member) => {
      const memberLogs = logs.filter((log) => log.memberId === member.id);
      const streaks = getWeeklyStreaks(memberLogs, allWeeks);
      return {
        member,
        totalPoints: memberLogs.reduce((sum, log) => sum + scoreLog(log, config), 0),
        papersRead: memberLogs.filter((log) =>
          ["skimmed", "read", "deep_read", "presented"].includes(log.status)
        ).length,
        deepReads: memberLogs.filter((log) => log.status === "deep_read").length,
        presentations: memberLogs.filter((log) => log.status === "presented").length,
        notes: memberLogs.filter((log) => Boolean(log.notes?.trim())).length,
        discussionQuestions: memberLogs.filter((log) =>
          Boolean(log.discussionQuestion?.trim())
        ).length,
        currentWeeklyStreak: streaks.current,
        longestWeeklyStreak: streaks.longest
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.deepReads !== a.deepReads) return b.deepReads - a.deepReads;
      if (b.discussionQuestions !== a.discussionQuestions) {
        return b.discussionQuestions - a.discussionQuestions;
      }
      return a.member.displayName.localeCompare(b.member.displayName);
    });
}
