import type { AppData, Member, Paper, ReadingLog, SiteConfig } from "../types/data";

async function fetchJson<T>(path: string): Promise<T> {
  const base = import.meta.env.BASE_URL;
  const response = await fetch(`${base}data/${path}?v=${Date.now()}`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function loadAppData(): Promise<AppData> {
  const [members, papers, logs, config] = await Promise.all([
    fetchJson<Member[]>("members.json"),
    fetchJson<Paper[]>("papers.json"),
    fetchJson<ReadingLog[]>("reading_logs.json"),
    fetchJson<SiteConfig>("site_config.json")
  ]);

  return { members, papers, logs, config };
}
