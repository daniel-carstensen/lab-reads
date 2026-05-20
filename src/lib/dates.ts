export function getIsoWeek(date = new Date()) {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${current.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function sortWeeksDesc(a: string, b: string) {
  return b.localeCompare(a);
}

export function getWeekFromDate(dateString: string) {
  return getIsoWeek(new Date(`${dateString}T12:00:00Z`));
}

export function getCurrentWeek(weeks: string[], mode: "auto" | "latest") {
  if (mode === "latest") {
    return [...weeks].sort(sortWeeksDesc)[0] ?? getIsoWeek();
  }
  return getIsoWeek();
}
