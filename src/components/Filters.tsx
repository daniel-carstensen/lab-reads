import { ChevronDown, Filter, Search } from "lucide-react";
import { useId, useState } from "react";
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

type SelectOption = {
  label: string;
  value: string;
};

type FilterSelectId = "week" | "member" | "tag" | "status" | "type";

function FilterSelect({
  selectId,
  label,
  value,
  options,
  open,
  onOpenChange,
  onChange
}: {
  selectId: FilterSelectId;
  label: string;
  value: string;
  options: SelectOption[];
  open: boolean;
  onOpenChange: (selectId: FilterSelectId | null) => void;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className="relative grid gap-1 text-sm font-medium text-ink/80"
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
          onOpenChange(null);
        }
      }}
    >
      <span id={`${id}-label`}>{label}</span>
      <button
        aria-controls={`${id}-menu`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-button`}
        className={`${controlClass} flex min-h-10 w-full items-center justify-between gap-2 text-left`}
        id={`${id}-button`}
        type="button"
        onClick={() => onOpenChange(open ? null : selectId)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onOpenChange(null);
        }}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink/50 transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-ink/15 bg-white p-1 font-sans text-sm text-ink shadow-soft"
          id={`${id}-menu`}
          role="listbox"
          aria-labelledby={`${id}-label`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={`w-full rounded px-2.5 py-2 text-left font-sans transition hover:bg-lagoon/10 focus:bg-lagoon/10 focus:outline-none ${
                option.value === value ? "bg-lagoon/10 font-semibold text-lagoon" : "text-ink"
              }`}
              role="option"
              aria-selected={option.value === value}
              type="button"
              onClick={() => {
                onChange(option.value);
                onOpenChange(null);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
  const [openSelect, setOpenSelect] = useState<FilterSelectId | null>(null);
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
        <FilterSelect
          selectId="week"
          label="Week"
          value={filters.week}
          options={[{ label: "All weeks", value: "" }, ...weeks.map((week) => ({ label: week, value: week }))]}
          open={openSelect === "week"}
          onOpenChange={setOpenSelect}
          onChange={(value) => update("week", value)}
        />
        <FilterSelect
          selectId="member"
          label="Member"
          value={filters.memberId}
          options={[
            { label: "Everyone", value: "" },
            ...members.map((member) => ({ label: member.displayName, value: member.id }))
          ]}
          open={openSelect === "member"}
          onOpenChange={setOpenSelect}
          onChange={(value) => update("memberId", value)}
        />
        <FilterSelect
          selectId="tag"
          label="Tag"
          value={filters.tag}
          options={[{ label: "All tags", value: "" }, ...tags.map((tag) => ({ label: tag, value: tag }))]}
          open={openSelect === "tag"}
          onOpenChange={setOpenSelect}
          onChange={(value) => update("tag", value)}
        />
        <FilterSelect
          selectId="status"
          label="Status"
          value={filters.status}
          options={[
            { label: "Any status", value: "" },
            ...statuses.map((status) => ({ label: status.replace("_", " "), value: status }))
          ]}
          open={openSelect === "status"}
          onOpenChange={setOpenSelect}
          onChange={(value) => update("status", value)}
        />
        <FilterSelect
          selectId="type"
          label="Type"
          value={filters.required}
          options={[
            { label: "Required and optional", value: "" },
            { label: "Required", value: "required" },
            { label: "Optional", value: "optional" }
          ]}
          open={openSelect === "type"}
          onOpenChange={setOpenSelect}
          onChange={(value) => update("required", value)}
        />
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
