import { Filter, Search } from "lucide-react";
import type { Member, ReadingStatus } from "../types/data";

export type FiltersState = {
  week: string;
  memberId: string;
  tag: string;
  status: string;
  required: string;
  search: string;
};

const statuses: ReadingStatus[] = ["planned", "skimmed", "read", "deep_read", "presented"];
const controlClass =
  "filter-control rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-lagoon";

export function Filters({
  filters,
  onChange,
  weeks,
  members,
  tags
}: {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  weeks: string[];
  members: Member[];
  tags: string[];
}) {
  const update = (key: keyof FiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <section
      className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
      aria-labelledby="filters-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-lagoon" aria-hidden="true" />
        <h2 id="filters-heading" className="text-lg font-semibold">
          Filters
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <label className="grid gap-1 text-sm font-medium text-ink/80">
          Week
          <select
            className={controlClass}
            value={filters.week}
            onChange={(event) => update("week", event.target.value)}
          >
            <option value="">All weeks</option>
            {weeks.map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink/80">
          Member
          <select
            className={controlClass}
            value={filters.memberId}
            onChange={(event) => update("memberId", event.target.value)}
          >
            <option value="">Everyone</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink/80">
          Tag
          <select
            className={controlClass}
            value={filters.tag}
            onChange={(event) => update("tag", event.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink/80">
          Status
          <select
            className={controlClass}
            value={filters.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="">Any status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink/80">
          Type
          <select
            className={controlClass}
            value={filters.required}
            onChange={(event) => update("required", event.target.value)}
          >
            <option value="">Required and optional</option>
            <option value="required">Required</option>
            <option value="optional">Optional</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink/80">
          Search
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink/45" />
            <input
              className="w-full rounded-md border border-ink/15 bg-white py-2 pl-9 pr-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-lagoon"
              value={filters.search}
              onChange={(event) => update("search", event.target.value)}
              placeholder="title, author, tag"
              type="search"
            />
          </span>
        </label>
      </div>
    </section>
  );
}
