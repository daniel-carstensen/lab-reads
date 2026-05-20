# Cognitive Neuroscience Paper Tracker

A lightweight GitHub Pages site for tracking weekly paper reading in a cognitive neuroscience lab. It is a static Vite + React + TypeScript app backed by JSON files, GitHub Issue Forms, and GitHub Actions.

No database, server backend, external auth, Firebase, Supabase, or real-time collaboration is required.

## Local Setup

Install Node 20 or newer, then run:

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

Edit `public/data/papers.json`. Each paper needs an `id`, `title`, `authors`, `year`, `week`, and `tags`.

Weeks use ISO-style labels such as `2026-W21`. Paper IDs should be stable because reading logs reference them.

## Log Readings Through GitHub Issues

On the site, each paper card shows its `paperId` and available member IDs. A lab member clicks **Log reading**, fills out the GitHub Issue Form, and submits it.

When a maintainer closes a `reading-log` issue, `.github/workflows/process-reading-log.yml` runs `scripts/process-reading-issue.mjs`. The script:

- parses the Issue Form markdown
- validates the member, paper, status, rating, and issue number
- prevents duplicate processing by checking `sourceIssue`
- appends a new entry to `public/data/reading_logs.json`
- commits the updated JSON file back to the repository

The normal Pages deploy workflow then rebuilds the site.

## Deploy With GitHub Pages

In GitHub, set:

```text
Repository Settings → Pages → Source: GitHub Actions
```

The deploy workflow builds on pushes to `main` and can also be run manually from the Actions tab.

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
