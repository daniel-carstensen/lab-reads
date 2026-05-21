import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dataDir = path.join(root, "public", "data");

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function cleanValue(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || /^_No response_$/i.test(trimmed)) return "";
  return trimmed;
}

function normalizeLabel(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseIssueForm(body) {
  const result = {};
  const lines = String(body ?? "").split(/\r?\n/);
  let currentKey = null;
  let currentValue = [];

  function flush() {
    if (currentKey) result[currentKey] = cleanValue(currentValue.join("\n"));
  }

  for (const line of lines) {
    const heading = line.match(/^###\s+(.+)\s*$/);
    if (heading) {
      flush();
      currentKey = normalizeLabel(heading[1]);
      currentValue = [];
    } else if (currentKey) {
      currentValue.push(line);
    }
  }
  flush();
  return result;
}

function required(value, label, issueNumber) {
  const cleaned = cleanValue(value);
  if (!cleaned) throw new Error(`Issue #${issueNumber}: ${label} is required.`);
  return cleaned;
}

function parsePaperId(value, issueNumber) {
  const paperId = required(value, "Paper ID", issueNumber).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(paperId)) {
    throw new Error(
      `Issue #${issueNumber}: Paper ID must use lowercase letters, numbers, and single hyphens.`
    );
  }
  return paperId;
}

function parseTags(value, issueNumber) {
  const tags = required(value, "Tags", issueNumber)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (!tags.length) throw new Error(`Issue #${issueNumber}: Tags must include at least one tag.`);
  return tags;
}

function parseYear(value, issueNumber) {
  const year = Number(required(value, "Year", issueNumber));
  if (!Number.isInteger(year) || year < 1000 || year > 3000) {
    throw new Error(`Issue #${issueNumber}: Year must be a four-digit year.`);
  }
  return year;
}

function parseWeek(value, issueNumber) {
  const week = required(value, "Suggested week", issueNumber);
  if (!/^\d{4}-W\d{2}$/.test(week)) {
    throw new Error(`Issue #${issueNumber}: Suggested week must use YYYY-Www, such as 2026-W21.`);
  }
  const weekNumber = Number(week.slice(6));
  if (weekNumber < 1 || weekNumber > 53) {
    throw new Error(`Issue #${issueNumber}: Suggested week must be between W01 and W53.`);
  }
  return week;
}

function normalizeUrl(value) {
  const url = cleanValue(value);
  if (!url) return undefined;
  if (/^10\.\S+\/\S+/.test(url)) return `https://doi.org/${url}`;
  return url;
}

function parseRequiredStatus(value) {
  return cleanValue(value).toLowerCase() === "required";
}

function buildPaper(issue, existingIds) {
  const fields = parseIssueForm(issue.body);
  const paperId = parsePaperId(fields.paper_id, issue.number);
  const title = required(fields.paper_title ?? fields.title, "Paper title", issue.number);
  const authors = required(fields.authors, "Authors", issue.number);
  const year = parseYear(fields.year, issue.number);
  const week = parseWeek(fields.suggested_week, issue.number);
  const tags = parseTags(fields.tags, issue.number);
  const url = normalizeUrl(fields.url_or_doi);
  const reason = cleanValue(fields.why_should_the_lab_read_this);
  const isRequired = parseRequiredStatus(fields.required_or_optional ?? fields.required_status);
  const discussionLead = cleanValue(fields.discussion_lead);
  if (existingIds.has(paperId)) {
    throw new Error(`Issue #${issue.number}: Paper ID already exists: ${paperId}`);
  }
  existingIds.add(paperId);

  return {
    id: paperId,
    title,
    authors,
    year,
    week,
    ...(url ? { url } : {}),
    tags,
    ...(reason ? { abstract: reason } : {}),
    required: isRequired,
    ...(discussionLead ? { discussionLead } : {}),
    sourceIssue: issue.number
  };
}

const inputPath = process.argv[2] ?? process.env.PAPER_SUGGESTIONS_JSON;
if (!inputPath) {
  throw new Error("Pass a path to a JSON file of closed paper suggestion issues.");
}

const issues = await readJson(inputPath);
if (!Array.isArray(issues)) {
  throw new Error("Paper suggestions input must be an array.");
}

function isPaperSuggestion(issue) {
  const labels = Array.isArray(issue.labels) ? issue.labels : [];
  return (
    labels.some((label) => label?.name === "paper-suggestion") ||
    String(issue.title ?? "").toLowerCase().startsWith("[paper suggestion]")
  );
}

const papersPath = path.join(dataDir, "papers.json");
const papers = await readJson(papersPath);
const existingIssueNumbers = new Set(
  papers.flatMap((paper) => (Number.isInteger(paper.sourceIssue) ? [paper.sourceIssue] : []))
);
const existingIds = new Set(papers.map((paper) => paper.id));
const additions = [];
const suggestionIssues = issues.filter(isPaperSuggestion);

console.log(`Fetched ${issues.length} closed issue${issues.length === 1 ? "" : "s"}.`);
console.log(
  `Matched ${suggestionIssues.length} paper suggestion${suggestionIssues.length === 1 ? "" : "s"}.`
);

for (const issue of suggestionIssues.sort((a, b) => a.number - b.number)) {
  if (!Number.isInteger(issue.number)) {
    throw new Error("Every suggestion issue must include a numeric number.");
  }
  if (existingIssueNumbers.has(issue.number)) {
    console.log(`Issue #${issue.number} has already been processed. Skipping.`);
    continue;
  }
  additions.push(buildPaper(issue, existingIds));
}

if (!additions.length) {
  console.log("No new paper suggestions to add.");
  process.exit(0);
}

const nextPapers = [...papers, ...additions].sort((a, b) => {
  if (a.week !== b.week) return a.week.localeCompare(b.week);
  return a.title.localeCompare(b.title);
});

await writeFile(papersPath, `${JSON.stringify(nextPapers, null, 2)}\n`, "utf8");
console.log(`Added ${additions.length} paper suggestion${additions.length === 1 ? "" : "s"}.`);
