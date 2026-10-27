import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import Sheet from "../ui/Sheet";
import { Segmented, inputClass, primaryButtonClass, secondaryButtonClass } from "../ui/ui";
import { shiftMonth } from "../../util/format";
import { formatDate, isMonthAligned, monthSpan, PERIOD_PRESETS, parseIso } from "../../util/period";

const comparisonOptions = [
  { value: "prev", label: "Poprzedni okres" },
  { value: "yearago", label: "Rok temu" },
  { value: "none", label: "Bez porównania" },
];

const cardOptions = [
  { value: "", label: "Wszystkie" },
  { value: "SHARED_CARD", label: "Wspólna" },
  { value: "PRIVATE_CARD", label: "Prywatna" },
];

const chip = (selected) =>
  `min-h-11 rounded-xl px-4 text-sm font-bold transition-colors ${
    selected ? "bg-brand text-on-brand" : "bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
  }`;

const monthKeyOf = (iso) => iso.slice(0, 7);

// Period, comparison and filters. A single month can also be stepped with the arrows.
const PeriodBar = ({ state, set, period, baseline, members, tags, today }) => {
  const [open, setOpen] = useState(null);
  const [from, setFrom] = useState(state.from || period.from);
  const [to, setTo] = useState(state.to || period.to);

  const singleMonth = isMonthAligned(period) && monthSpan(period) === 1;
  const currentKey = monthKeyOf(today);

  function stepMonth(delta) {
    const start = parseIso(period.from);
    const next = shiftMonth({ year: start.y, month: start.m }, delta);
    const key = `${next.year}-${String(next.month).padStart(2, "0")}`;
    set({ p: key === currentKey ? "month" : key, cat: "" });
  }

  function pickPeriod(patch) {
    set({ ...patch, cat: "" });
    setOpen(null);
  }

  const activeFilters = [
    state.member && { key: "member", label: members.find((m) => String(m.id) === state.member)?.name ?? "Domownik" },
    state.card && { key: "card", label: state.card === "SHARED_CARD" ? "Karta wspólna" : "Karta prywatna" },
    state.tag && { key: "tag", label: `#${state.tag}` },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-2">
        {singleMonth && (
          <button
            type="button"
            aria-label="Poprzedni miesiąc"
            onClick={() => stepMonth(-1)}
            className="w-12 shrink-0 rounded-2xl bg-neutral-800 hover:bg-neutral-700"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen("period")}
          className="min-h-14 min-w-0 flex-1 rounded-2xl bg-neutral-800 px-4 py-2 text-left hover:bg-neutral-700 lg:max-w-md"
        >
          <span className="block truncate font-bold first-letter:uppercase">{period.label}</span>
          <span className="block truncate text-xs text-neutral-400">
            {!singleMonth && `${formatDate(period.from)} – ${formatDate(period.to)} · `}
            {baseline ? `vs ${baseline.label}` : "bez porównania"}
          </span>
        </button>
        {singleMonth && (
          <button
            type="button"
            aria-label="Następny miesiąc"
            disabled={monthKeyOf(period.from) >= currentKey}
            onClick={() => stepMonth(1)}
            className="w-12 shrink-0 rounded-2xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen("filters")}
          className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 font-bold ${
            activeFilters.length > 0 ? "bg-brand text-on-brand" : "bg-neutral-800 hover:bg-neutral-700"
          }`}
        >
          <FontAwesomeIcon icon={faSliders} />
          <span className="hidden sm:inline">Filtry</span>
          {activeFilters.length > 0 && <span>{activeFilters.length}</span>}
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => set({ [filter.key]: "" })}
              className="flex h-9 items-center gap-2 rounded-full bg-neutral-800 pl-4 pr-3 text-sm font-medium hover:bg-neutral-700"
            >
              {filter.label}
              <span className="text-danger" aria-label="Usuń filtr">×</span>
            </button>
          ))}
        </div>
      )}

      {open === "period" && (
        <Sheet title="Okres" onClose={() => setOpen(null)}>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-2">
              {PERIOD_PRESETS.map((preset) => (
                <button
                  key={preset.spec}
                  type="button"
                  onClick={() => pickPeriod({ p: preset.spec, from: "", to: "" })}
                  className={chip(state.p === preset.spec)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="month-pick" className="mb-2 block text-sm font-medium text-neutral-400">
                Konkretny miesiąc
              </label>
              <input
                id="month-pick"
                type="month"
                max={currentKey}
                value={singleMonth ? monthKeyOf(period.from) : ""}
                onChange={(event) => event.target.value && pickPeriod({ p: event.target.value, from: "", to: "" })}
                className={inputClass}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-400">Własny zakres</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" aria-label="Od" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
                <input type="date" aria-label="Do" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
              </div>
              <button
                type="button"
                disabled={!from || !to || from > to}
                onClick={() => pickPeriod({ p: "custom", from, to })}
                className={`${secondaryButtonClass} mt-2 w-full`}
              >
                Zastosuj zakres
              </button>
              {from && to && from > to && (
                <p role="alert" className="mt-2 text-sm text-danger">Data początkowa jest późniejsza niż końcowa.</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-400">Porównuj z</p>
              <Segmented name="cmp" value={state.cmp} onChange={(value) => set({ cmp: value })} options={comparisonOptions} />
            </div>

            <button type="button" onClick={() => setOpen(null)} className={primaryButtonClass}>
              Gotowe
            </button>
          </div>
        </Sheet>
      )}

      {open === "filters" && (
        <Sheet title="Filtry" onClose={() => setOpen(null)}>
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-400">Kto zapłacił</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => set({ member: "" })} className={chip(state.member === "")}>
                  Wszyscy
                </button>
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => set({ member: String(member.id) })}
                    className={chip(state.member === String(member.id))}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-400">Karta</p>
              <Segmented name="card" value={state.card} onChange={(value) => set({ card: value })} options={cardOptions} />
            </div>

            {tags.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-400">Tag</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => set({ tag: "" })} className={chip(state.tag === "")}>
                    Wszystkie
                  </button>
                  {tags.map((tag) => (
                    <button key={tag} type="button" onClick={() => set({ tag })} className={chip(state.tag === tag)}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={activeFilters.length === 0}
                onClick={() => set({ member: "", card: "", tag: "" })}
                className={secondaryButtonClass}
              >
                Wyczyść
              </button>
              <button type="button" onClick={() => setOpen(null)} className={primaryButtonClass}>
                Gotowe
              </button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
};

export default PeriodBar;
