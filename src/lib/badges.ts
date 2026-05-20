import type { Member, Paper, ReadingLog } from "../types/data";
import { getWeeklyStreaks } from "./scoring";

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

type BadgeContext = {
  member: Member;
  papers: Paper[];
  logs: ReadingLog[];
  allWeeks: string[];
};

const tagGroups = {
  methods: ["methods", "statistics", "modeling", "analysis"],
  theory: ["theory", "cognitive science", "conceptual"],
  hippocampus: ["hippocampus", "memory", "episodic memory"],
  modeling: ["computational modeling", "reinforcement learning", "ai", "neural networks"]
};

function countLogsWithTags(logs: ReadingLog[], papers: Paper[], tags: string[]) {
  const wanted = new Set(tags.map((tag) => tag.toLowerCase()));
  const paperById = new Map(papers.map((paper) => [paper.id, paper]));
  return logs.filter((log) => {
    const paper = paperById.get(log.paperId);
    return paper?.tags.some((tag) => wanted.has(tag.toLowerCase()));
  }).length;
}

const definitions: Array<Badge & { earned: (context: BadgeContext) => boolean }> = [
  {
    id: "first-paper",
    name: "First Paper Logged",
    emoji: "📘",
    description: "Logged at least one paper.",
    earned: ({ logs }) => logs.length > 0
  },
  {
    id: "skim-samurai",
    name: "Skim Samurai",
    emoji: "⚔️",
    description: "Skimmed five papers.",
    earned: ({ logs }) => logs.filter((log) => log.status === "skimmed").length >= 5
  },
  {
    id: "deep-read-demon",
    name: "Deep Read Demon",
    emoji: "🔥",
    description: "Completed three deep reads.",
    earned: ({ logs }) => logs.filter((log) => log.status === "deep_read").length >= 3
  },
  {
    id: "discussion-spark",
    name: "Discussion Spark",
    emoji: "💬",
    description: "Added five discussion questions.",
    earned: ({ logs }) => logs.filter((log) => log.discussionQuestion?.trim()).length >= 5
  },
  {
    id: "methods-goblin",
    name: "Methods Goblin",
    emoji: "🧪",
    description: "Logged three methods-flavored papers.",
    earned: ({ logs, papers }) => countLogsWithTags(logs, papers, tagGroups.methods) >= 3
  },
  {
    id: "theory-wizard",
    name: "Theory Wizard",
    emoji: "🧙",
    description: "Logged three theory papers.",
    earned: ({ logs, papers }) => countLogsWithTags(logs, papers, tagGroups.theory) >= 3
  },
  {
    id: "hippocampus-hero",
    name: "Hippocampus Hero",
    emoji: "🧠",
    description: "Logged three memory or hippocampus papers.",
    earned: ({ logs, papers }) => countLogsWithTags(logs, papers, tagGroups.hippocampus) >= 3
  },
  {
    id: "modeling-mage",
    name: "Modeling Mage",
    emoji: "✨",
    description: "Logged three computational papers.",
    earned: ({ logs, papers }) => countLogsWithTags(logs, papers, tagGroups.modeling) >= 3
  },
  {
    id: "reviewer-mode",
    name: "Reviewer Mode",
    emoji: "📝",
    description: "Wrote ten notes.",
    earned: ({ logs }) => logs.filter((log) => log.notes?.trim()).length >= 10
  },
  {
    id: "streak-keeper",
    name: "Streak Keeper",
    emoji: "📅",
    description: "Kept a three-week reading streak.",
    earned: ({ logs, allWeeks }) => getWeeklyStreaks(logs, allWeeks).longest >= 3
  },
  {
    id: "paper-presenter",
    name: "Paper Presenter",
    emoji: "🎤",
    description: "Presented at least one paper.",
    earned: ({ logs }) => logs.some((log) => log.status === "presented")
  }
];

export function getEarnedBadges(
  member: Member,
  papers: Paper[],
  logs: ReadingLog[],
  allWeeks: string[]
): Badge[] {
  const memberLogs = logs.filter((log) => log.memberId === member.id);
  return definitions
    .filter((badge) => badge.earned({ member, papers, logs: memberLogs, allWeeks }))
    .map(({ earned, ...badge }) => badge);
}

export function getAllBadges(): Badge[] {
  return definitions.map(({ earned, ...badge }) => badge);
}
