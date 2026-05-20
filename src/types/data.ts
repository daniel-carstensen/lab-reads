export type ReadingStatus =
  | "planned"
  | "skimmed"
  | "read"
  | "deep_read"
  | "presented";

export type Member = {
  id: string;
  displayName: string;
  avatarEmoji?: string;
  role?: string;
  active: boolean;
};

export type Paper = {
  id: string;
  title: string;
  authors: string;
  year: number;
  week: string;
  theme?: string;
  venue?: string;
  doi?: string;
  url?: string;
  tags: string[];
  abstract?: string;
  discussionLead?: string;
  required?: boolean;
};

export type ReadingLog = {
  id: string;
  paperId: string;
  memberId: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  discussionQuestion?: string;
  reaction?: string;
  date: string;
  sourceIssue?: number;
};

export type SiteConfig = {
  labName: string;
  siteSubtitle?: string;
  timezone: string;
  points: Record<string, number>;
  currentWeekMode: "auto" | "latest";
  repoOwner: string;
  repoName: string;
};

export type AppData = {
  members: Member[];
  papers: Paper[];
  logs: ReadingLog[];
  config: SiteConfig;
};
