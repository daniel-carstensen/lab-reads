import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const statuses = new Set(["planned", "skimmed", "read", "deep_read", "presented"]);
const root = process.cwd();
const dataDir = path.join(root, "public", "data");

async function readJson(fileName) {
  const raw = await readFile(path.join(dataDir, fileName), "utf8");
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

function normalizeReaction(value) {
  const cleaned = cleanValue(value);
  if (!cleaned) return undefined;
  return cleaned.split(/\s+/)[0];
}

function required(value, label) {
  const cleaned = cleanValue(value);
  if (!cleaned) throw new Error(`${label} is required.`);
  return cleaned;
}

function todayIso() {
  return (process.env.LOG_DATE || new Date().toISOString()).slice(0, 10);
}

const issueNumber = Number(process.env.ISSUE_NUMBER);
if (!Number.isInteger(issueNumber) || issueNumber < 1) {
  throw new Error("ISSUE_NUMBER must be a positive integer.");
}

const issueBody = process.env.ISSUE_BODY ?? "";
const parsed = parseIssueForm(issueBody);

const memberId = required(parsed.member_id, "Member ID").toLowerCase();
const paperId = required(parsed.paper_id, "Paper ID").toLowerCase();
const status = required(parsed.reading_status, "Reading status").toLowerCase();
const ratingValue = cleanValue(parsed.rating);
const rating = ratingValue ? Number(ratingValue) : undefined;
const notes = cleanValue(parsed.notes) || undefined;
const discussionQuestion = cleanValue(parsed.discussion_question) || undefined;
const reaction = normalizeReaction(parsed.reaction);

if (!statuses.has(status)) {
  throw new Error(`Invalid reading status: ${status}`);
}
if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
  throw new Error("Rating must be an integer from 1 to 5.");
}

const [members, papers, logs] = await Promise.all([
  readJson("members.json"),
  readJson("papers.json"),
  readJson("reading_logs.json")
]);

if (!members.some((member) => member.id === memberId)) {
  throw new Error(`Unknown memberId: ${memberId}`);
}
if (!papers.some((paper) => paper.id === paperId)) {
  throw new Error(`Unknown paperId: ${paperId}`);
}
if (logs.some((log) => log.sourceIssue === issueNumber)) {
  console.log(`Issue #${issueNumber} has already been processed. No changes made.`);
  process.exit(0);
}

const date = todayIso();
const newLog = {
  id: `log-${date}-${memberId}-${paperId}-${issueNumber}`,
  paperId,
  memberId,
  status,
  ...(rating !== undefined ? { rating } : {}),
  ...(notes ? { notes } : {}),
  ...(discussionQuestion ? { discussionQuestion } : {}),
  ...(reaction ? { reaction } : {}),
  date,
  sourceIssue: issueNumber
};

const nextLogs = [...logs, newLog];
await writeFile(
  path.join(dataDir, "reading_logs.json"),
  `${JSON.stringify(nextLogs, null, 2)}\n`,
  "utf8"
);

console.log(`Added reading log ${newLog.id}.`);
