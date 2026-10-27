import { monthLabel } from "./format.js";

// A period is { spec, from, to, label } with `from` and `to` as inclusive local dates ("YYYY-MM-DD").
// Strings compare correctly as dates, so an expense belongs to a period when its first ten
// characters are between them. All maths is done in UTC to stay clear of time zones and DST.

const pad = (n) => String(n).padStart(2, "0");

export const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

export function parseIso(text) {
  const [y, m, d] = text.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

export const lastDayOfMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export function addDays(iso, n) {
  const { y, m, d } = parseIso(iso);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return isoDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

const monthIndex = ({ y, m }) => y * 12 + m - 1;
const fromMonthIndex = (index) => ({ y: Math.floor(index / 12), m: (index % 12) + 1 });

const firstOfMonthIndex = (index) => {
  const { y, m } = fromMonthIndex(index);
  return isoDate(y, m, 1);
};

const lastOfMonthIndex = (index) => {
  const { y, m } = fromMonthIndex(index);
  return isoDate(y, m, lastDayOfMonth(y, m));
};

// `count` whole months ending with the month of `iso`
export function monthsEndingAt(iso, count = 1) {
  const end = monthIndex(parseIso(iso));
  return { from: firstOfMonthIndex(end - count + 1), to: lastOfMonthIndex(end) };
}

export function isMonthAligned({ from, to }) {
  const a = parseIso(from);
  const b = parseIso(to);
  return a.d === 1 && b.d === lastDayOfMonth(b.y, b.m);
}

// number of calendar months a month-aligned period covers
export function monthSpan({ from, to }) {
  return monthIndex(parseIso(to)) - monthIndex(parseIso(from)) + 1;
}

export function daysIn({ from, to }) {
  const a = parseIso(from);
  const b = parseIso(to);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000) + 1;
}

export function inPeriod(dateText, period) {
  const date = dateText.slice(0, 10);
  return date >= period.from && date <= period.to;
}

// same day a year earlier; 29 February becomes 28 February
function shiftYear(iso, delta) {
  const { y, m, d } = parseIso(iso);
  return isoDate(y + delta, m, Math.min(d, lastDayOfMonth(y + delta, m)));
}

export function formatDate(iso) {
  const { y, m, d } = parseIso(iso);
  return `${pad(d)}.${pad(m)}.${y}`;
}

function labelOf(spec, from, to) {
  const start = parseIso(from);
  if (spec === "month" || spec === "prev" || /^\d{4}-\d{2}$/.test(spec)) {
    return monthLabel({ year: start.y, month: start.m });
  }
  if (spec === "3m" || spec === "6m" || spec === "12m") {
    return `Ostatnie ${spec.slice(0, -1)} mies.`;
  }
  if (spec === "year") return `Rok ${start.y}`;
  if (spec === "all") return "Cały czas";
  if (isMonthAligned({ from, to }) && monthSpan({ from, to }) === 1) {
    return monthLabel({ year: start.y, month: start.m });
  }
  if (from.slice(5) === "01-01" && to.slice(5) === "12-31" && from.slice(0, 4) === to.slice(0, 4)) {
    return `Rok ${start.y}`;
  }
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export const PERIOD_PRESETS = [
  { spec: "month", label: "Ten miesiąc" },
  { spec: "prev", label: "Poprzedni miesiąc" },
  { spec: "3m", label: "Ostatnie 3 miesiące" },
  { spec: "6m", label: "Ostatnie 6 miesięcy" },
  { spec: "12m", label: "Ostatnie 12 miesięcy" },
  { spec: "year", label: "Ten rok" },
  { spec: "all", label: "Cały czas" },
];

/**
 * spec: "month" | "prev" | "3m" | "6m" | "12m" | "year" | "all" | "YYYY-MM" | "custom"
 * `today` is "YYYY-MM-DD", `earliest` the date of the oldest expense (for "all"),
 * `from`/`to` are used by "custom". An unknown or broken spec falls back to this month.
 */
export function resolvePeriod(spec, { today, earliest = null, from = null, to = null }) {
  const now = parseIso(today);
  let range;

  if (spec === "prev") {
    range = monthsEndingAt(firstOfMonthIndex(monthIndex(now) - 1), 1);
  } else if (spec === "3m" || spec === "6m" || spec === "12m") {
    range = monthsEndingAt(today, Number(spec.slice(0, -1)));
  } else if (spec === "year") {
    range = { from: isoDate(now.y, 1, 1), to: isoDate(now.y, 12, 31) };
  } else if (spec === "all") {
    const start = earliest ? monthsEndingAt(earliest, 1).from : monthsEndingAt(today, 1).from;
    range = { from: start, to: monthsEndingAt(today, 1).to };
  } else if (/^\d{4}-(0[1-9]|1[0-2])$/.test(spec)) {
    range = monthsEndingAt(`${spec}-01`, 1);
  } else if (spec === "custom" && from && to && from <= to) {
    range = { from, to };
  } else {
    spec = "month";
    range = monthsEndingAt(today, 1);
  }

  return { spec, from: range.from, to: range.to, label: labelOf(spec, range.from, range.to) };
}

/**
 * The period to compare with: "prev" is the period of the same length right before this one
 * (whole months shift by whole months), "yearago" the same dates a year earlier, "none" has none.
 * "Cały czas" has nothing before it.
 */
export function baselinePeriod(period, kind) {
  if (kind === "none" || period.spec === "all") return null;

  let range;
  if (kind === "yearago") {
    range = isMonthAligned(period)
      ? {
          from: firstOfMonthIndex(monthIndex(parseIso(period.from)) - 12),
          to: lastOfMonthIndex(monthIndex(parseIso(period.to)) - 12),
        }
      : { from: shiftYear(period.from, -1), to: shiftYear(period.to, -1) };
  } else if (isMonthAligned(period)) {
    const span = monthSpan(period);
    range = {
      from: firstOfMonthIndex(monthIndex(parseIso(period.from)) - span),
      to: lastOfMonthIndex(monthIndex(parseIso(period.to)) - span),
    };
  } else {
    const length = daysIn(period);
    const to = addDays(period.from, -1);
    range = { from: addDays(to, -(length - 1)), to };
  }

  return {
    spec: "custom",
    from: range.from,
    to: range.to,
    label: labelOf("custom", range.from, range.to),
  };
}

// How many months to divide by for an average: a period still running counts up to today only.
export function monthsForAverage(period, today) {
  const end = period.to < today ? period.to : today;
  if (end < period.from) return 1;
  if (parseIso(period.from).d === 1) {
    return monthIndex(parseIso(end)) - monthIndex(parseIso(period.from)) + 1;
  }
  return Math.max(1, daysIn({ from: period.from, to: end }) / 30.4375);
}

// the calendar months a period touches, oldest first: [{ year, month }]
export function monthsOfPeriod(period) {
  const first = monthIndex(parseIso(period.from));
  const last = monthIndex(parseIso(period.to));
  const months = [];
  for (let index = first; index <= last; index++) {
    const { y, m } = fromMonthIndex(index);
    months.push({ year: y, month: m });
  }
  return months;
}
