# Cognitive Neuroscience Paper Tracker

A lightweight GitHub Pages site for tracking weekly paper reading in a cognitive neuroscience lab. It is a static Vite + React + TypeScript app backed by JSON files, GitHub Issue Forms, and GitHub Actions.

No database, server backend, external auth, Firebase, Supabase, or real-time collaboration is required.

## Local Setup

Install Node 24 or newer, then run:

```bash
npm install
npm run dev
npm run validate:data
npm run build
```

The dev server is provided by Vite. Static data is loaded from `public/data/`, so local and GitHub Pages builds use the same JSON files.

## Configure The Repository

Edit `public/data/site_config.json` before publishing:

```json
{
  "repoOwner": "your-github-org",
  "repoName": "lab-paper-tracker"
}
```

These values power the **Log reading**, **Suggest paper**, and repository links.

## Add Lab Members

Edit `public/data/members.json`:

```json
{
  "id": "daniel",
  "displayName": "Daniel",
  "role": "Lab Manager",
  "active": true
}
```

Use stable lowercase IDs. Lab members enter this ID in the reading log Issue Form.

## Add Papers

Papers can be added in two ways.

For manual edits, edit `public/data/papers.json`. Each paper needs an `id`, `title`, `authors`, `year`, `week`, and `tags`.

Weeks use ISO-style labels such as `2026-W21`. Paper IDs should be stable because reading logs reference them.

For GitHub Issue suggestions, lab members can submit the **Suggest paper** form. When a `paper-suggestion` issue is closed, `.github/workflows/process-paper-suggestions.yml` processes it immediately. The processor automatically accepts every closed suggestion, uses the submitted paper ID, appends the paper to `public/data/papers.json`, and commits the JSON update.

The suggestion form asks for a `paper_id` directly. Use lowercase letters, numbers, and hyphens, such as:

```text
shepard-1987-generalization
```

Once a paper has reading logs, keep its ID stable so existing `reading_logs.json` entries continue to point to the right paper.

The suggestion form also asks whether the paper is `required` or `optional`, plus an optional discussion lead. If the discussion lead is blank, the site shows `TBD`.

## Log Readings Through GitHub Issues

On the site, each paper card shows its `paperId` and available member IDs. A lab member clicks **Log reading**, fills out the GitHub Issue Form, and submits it.

When a maintainer closes a `reading-log` issue, `.github/workflows/process-reading-log.yml` runs `scripts/process-reading-issue.mjs`. The script:

- parses the Issue Form markdown
- validates the member, paper, status, rating, and issue number
- prevents duplicate processing by checking `sourceIssue`
- appends a new entry to `public/data/reading_logs.json`
- commits the updated JSON file back to the repository

Reading logs deploy immediately after their processing commit. Paper suggestions are committed immediately when their issue closes, then published by the hourly Pages deploy schedule or by manually running the deploy workflow.

## Deploy With GitHub Pages

In GitHub, set:

```text
Repository Settings → Pages → Source: GitHub Actions
```

The deploy workflow builds on pushes to `main` or `master`, runs once per hour, and can also be run manually from the Actions tab.

## Customize Scoring And Badges

Point values live in `public/data/site_config.json`:

```json
{
  "points": {
    "planned": 0,
    "skimmed": 1,
    "read": 3,
    "deep_read": 5,
    "presented": 6,
    "notes_bonus": 1,
    "discussion_question_bonus": 1
  }
}
```

Badge logic lives in `src/lib/badges.ts`. The default badges cover first logs, skims, deep reads, discussion questions, methods, theory, hippocampus and memory, modeling, notes, streaks, and presentations.

## Data Validation

Run this before committing manual JSON edits:

```bash
npm run validate:data
```

The validator checks unique IDs, required fields, week/date formats, status values, ratings, and cross-file references.

## Privacy

GitHub Pages sites in public repositories expose the paper list, member names, reading notes, discussion questions, and reactions publicly. Use first names, initials, or pseudonyms if the lab prefers a lower-profile public record.

For sensitive notes, keep the repository private or avoid storing those notes in `reading_logs.json`.
