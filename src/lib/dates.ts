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

export function sortWeeksAsc(a: string, b: string) {
  return a.localeCompare(b);
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

export function parseWeek(week: string) {
  const match = week.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    week: Number(match[2])
  };
}

export function addWeeks(week: string, offset: number) {
  const parsed = parseWeek(week);
  if (!parsed) return week;

  const janFourth = new Date(Date.UTC(parsed.year, 0, 4));
  const janFourthDay = janFourth.getUTCDay() || 7;
  const firstIsoMonday = new Date(janFourth);
  firstIsoMonday.setUTCDate(janFourth.getUTCDate() - janFourthDay + 1);
  firstIsoMonday.setUTCDate(firstIsoMonday.getUTCDate() + (parsed.week - 1 + offset) * 7);

  return getIsoWeek(firstIsoMonday);
}

export function getFutureWeekRange(startWeek: string, futureCount = 4) {
  return Array.from({ length: futureCount + 1 }, (_, index) => addWeeks(startWeek, index));
}
