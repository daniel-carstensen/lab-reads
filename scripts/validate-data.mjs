import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dataDir = path.join(root, "public", "data");
const statuses = new Set(["planned", "skimmed", "read", "deep_read", "presented"]);
const errors = [];

async function readJson(fileName) {
  const raw = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(raw);
}

function fail(message) {
  errors.push(message);
}

function assertUnique(items, getId, label) {
  const seen = new Set();
  for (const item of items) {
    const id = getId(item);
    if (!id) {
      fail(`${label} is missing an id.`);
      continue;
    }
    if (seen.has(id)) fail(`${label} has duplicate id: ${id}`);
    seen.add(id);
  }
}

function isValidWeek(value) {
  if (!/^\d{4}-W\d{2}$/.test(value)) return false;
  const week = Number(value.slice(6));
  return week >= 1 && week <= 53;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateMembers(members) {
  if (!Array.isArray(members)) {
    fail("members.json must contain an array.");
    return;
  }
  assertUnique(members, (member) => member.id, "Member");
  for (const member of members) {
    if (typeof member.id !== "string" || !member.id.trim()) fail("Member id must be a non-empty string.");
    if (typeof member.displayName !== "string" || !member.displayName.trim()) {
      fail(`Member ${member.id ?? "(unknown)"} must have displayName.`);
    }
    if (typeof member.active !== "boolean") {
      fail(`Member ${member.id ?? "(unknown)"} must have boolean active.`);
    }
  }
}

function validatePapers(papers) {
  if (!Array.isArray(papers)) {
    fail("papers.json must contain an array.");
    return;
  }
  assertUnique(papers, (paper) => paper.id, "Paper");
  for (const paper of papers) {
    if (typeof paper.id !== "string" || !paper.id.trim()) fail("Paper id must be a non-empty string.");
    if (typeof paper.id === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(paper.id)) {
      fail(`Paper ${paper.id} has invalid id format. Use lowercase letters, numbers, and hyphens.`);
    }
    for (const field of ["title", "authors", "week"]) {
      if (typeof paper[field] !== "string" || !paper[field].trim()) {
        fail(`Paper ${paper.id ?? "(unknown)"} must have ${field}.`);
      }
    }
    if (!Number.isInteger(paper.year)) fail(`Paper ${paper.id ?? "(unknown)"} must have integer year.`);
    if (!isValidWeek(paper.week)) fail(`Paper ${paper.id ?? "(unknown)"} has invalid week ${paper.week}.`);
    if (!Array.isArray(paper.tags) || !paper.tags.every((tag) => typeof tag === "string" && tag.trim())) {
      fail(`Paper ${paper.id ?? "(unknown)"} must have tags as an array of strings.`);
    }
    if (paper.sourceIssue !== undefined && (!Number.isInteger(paper.sourceIssue) || paper.sourceIssue < 1)) {
      fail(`Paper ${paper.id ?? "(unknown)"} sourceIssue must be a positive integer.`);
    }
  }
}

function validateLogs(logs, members, papers) {
  if (!Array.isArray(logs)) {
    fail("reading_logs.json must contain an array.");
    return;
  }
  const memberIds = new Set(members.map((member) => member.id));
  const paperIds = new Set(papers.map((paper) => paper.id));
  assertUnique(logs, (log) => log.id, "Reading log");

  for (const log of logs) {
    if (typeof log.id !== "string" || !log.id.trim()) fail("Reading log id must be a non-empty string.");
    if (!paperIds.has(log.paperId)) fail(`Reading log ${log.id} references unknown paperId ${log.paperId}.`);
    if (!memberIds.has(log.memberId)) fail(`Reading log ${log.id} references unknown memberId ${log.memberId}.`);
    if (!statuses.has(log.status)) fail(`Reading log ${log.id} has invalid status ${log.status}.`);
    if (log.rating !== undefined && (!Number.isInteger(log.rating) || log.rating < 1 || log.rating > 5)) {
      fail(`Reading log ${log.id} rating must be an integer from 1 to 5.`);
    }
    if (!isValidDate(log.date)) fail(`Reading log ${log.id} has invalid date ${log.date}.`);
    if (log.sourceIssue !== undefined && (!Number.isInteger(log.sourceIssue) || log.sourceIssue < 1)) {
      fail(`Reading log ${log.id} sourceIssue must be a positive integer.`);
    }
  }
}

function validateConfig(config) {
  if (!config || typeof config !== "object") {
    fail("site_config.json must contain an object.");
    return;
  }
  for (const field of ["labName", "timezone", "repoOwner", "repoName"]) {
    if (typeof config[field] !== "string" || !config[field].trim()) {
      fail(`site_config.json must have ${field}.`);
    }
  }
  if (!["auto", "latest"].includes(config.currentWeekMode)) {
    fail("site_config.json currentWeekMode must be auto or latest.");
  }
  if (!config.points || typeof config.points !== "object") {
    fail("site_config.json must have points.");
  }
}

try {
  const [members, papers, logs, config] = await Promise.all([
    readJson("members.json"),
    readJson("papers.json"),
    readJson("reading_logs.json"),
    readJson("site_config.json")
  ]);

  validateMembers(members);
  validatePapers(papers);
  validateLogs(logs, members, papers);
  validateConfig(config);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Data validation passed.");
