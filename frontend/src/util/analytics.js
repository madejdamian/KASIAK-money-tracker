import { childrenBreakdown, expensesInCategory } from "./analysis.js";
import { applyExpenseFilters, emptyFilters } from "./filters.js";
import { shortMonthLabel } from "./format.js";
import { inPeriod, monthsForAverage } from "./period.js";

// Pure functions behind the analysis screen. Money is summed in cents to avoid floating point drift.

const toCents = (value) => Math.round(Number(value) * 100);
const pad = (n) => String(n).padStart(2, "0");
export const monthKeyOfMonth = ({ year, month }) => `${year}-${pad(month)}`;

export function compareValues(current, previous) {
  const diff = Math.round((current - previous) * 100) / 100;
  let status = "same";
  if (previous === 0 && current > 0) status = "new";
  else if (current === 0 && previous > 0) status = "gone";
  else if (diff > 0) status = "up";
  else if (diff < 0) status = "down";
  return { diff, pct: previous === 0 ? null : diff / previous, status };
}

// Whole percents that add up to exactly 100 (largest remainder), for non-negative values.
export function roundShares(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);

  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => [value - floors[index], index])
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, index] of order) {
    if (left <= 0) break;
    floors[index] += 1;
    left -= 1;
  }
  return floors;
}

export function expensesOfPeriod(expenses, period) {
  return expenses.filter((expense) => inPeriod(expense.date, period));
}

// member, card, tag and category (with everything below it); empty values do not filter
export function scopeExpenses(expenses, index, filters) {
  return applyExpenseFilters(expenses, index, { ...emptyFilters, ...filters });
}

export function earliestDate(expenses) {
  return expenses.reduce((min, expense) => {
    const date = expense.date.slice(0, 10);
    return min === null || date < min ? date : min;
  }, null);
}

export function summarize(expenses, period, today) {
  const cents = expenses.reduce((sum, expense) => sum + toCents(expense.price), 0);
  const months = monthsForAverage(period, today);
  return {
    total: cents / 100,
    count: expenses.length,
    months,
    avgPerMonth: Math.round(cents / months) / 100,
    largest: expenses.reduce((max, expense) => Math.max(max, Number(expense.price)), 0),
  };
}

const NO_COMPARISON = { diff: null, pct: null, status: "none" };

// Merges two lists of the same kind of rows (current period and baseline) by id. A row that only
// exists in the baseline stays in the list with a zero total, so "gone" categories are visible.
function mergeRows(nowRows, beforeRows, hasBaseline) {
  const keyOf = (row) => row.id ?? "none";
  const before = new Map(beforeRows.map((row) => [keyOf(row), row]));
  const seen = new Set(nowRows.map(keyOf));

  const rows = nowRows.map((row) => ({ ...row, prevTotal: before.get(keyOf(row))?.total ?? 0 }));
  for (const row of beforeRows) {
    if (!seen.has(keyOf(row))) {
      rows.push({ ...row, total: 0, count: 0, share: 0, prevTotal: row.total });
    }
  }

  const percents = roundShares(rows.map((row) => row.total));
  const grand = rows.reduce((sum, row) => sum + toCents(row.total), 0) / 100;

  return rows
    .map((row, position) => ({
      ...row,
      percent: percents[position],
      share: grand === 0 ? 0 : row.total / grand,
      ...(hasBaseline ? compareValues(row.total, row.prevTotal) : NO_COMPARISON),
    }))
    .sort(
      (a, b) =>
        b.total - a.total || b.prevTotal - a.prevTotal || String(a.name).localeCompare(b.name, "pl")
    );
}

// One level of the category tree: the children of `parentId` (null = top level) with totals that
// include everything below them, their share, and the change against the baseline expenses.
export function categoryRows(current, baseline, index, parentId) {
  return mergeRows(
    childrenBreakdown(current, index, parentId),
    baseline ? childrenBreakdown(baseline, index, parentId) : [],
    baseline != null
  );
}

function groupBy(expenses, dimension) {
  const groups = new Map();
  const add = (id, name, expense) => {
    const group = groups.get(id) ?? { id, name, cents: 0, count: 0 };
    group.cents += toCents(expense.price);
    group.count += 1;
    groups.set(id, group);
  };

  for (const expense of expenses) {
    if (dimension === "member") {
      add(expense.memberId ?? "none", expense.memberName ?? "Nieznany", expense);
    } else if (dimension === "source") {
      add(
        expense.paymentSource ?? "none",
        expense.paymentSource === "PRIVATE_CARD" ? "Karta prywatna" : "Karta wspólna",
        expense
      );
    } else {
      const tags = expense.tags ?? [];
      if (tags.length === 0) add("none", "Bez tagu", expense);
      for (const tag of tags) add(tag, `#${tag}`, expense);
    }
  }

  return [...groups.values()].map((group) => ({
    id: group.id,
    name: group.name,
    total: group.cents / 100,
    count: group.count,
  }));
}

// The same table as categoryRows, grouped by member, card or tag instead. An expense with
// several tags is counted under each of them, so those totals can add up to more than the whole.
export function groupRows(current, baseline, dimension) {
  return mergeRows(
    groupBy(current, dimension),
    baseline ? groupBy(baseline, dimension) : [],
    baseline != null
  );
}

// The biggest changes between rows: increases and decreases, plus what is new or gone.
export function biggestMoves(rows, limit = 6) {
  return rows
    .filter((row) => row.status === "up" || row.status === "down" || row.status === "new" || row.status === "gone")
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, limit);
}

// Spending per month, split into the children of `parentId`: [{ key, year, month, total, parts }]
export function monthlyStack(expenses, index, parentId, months) {
  return months.map((month) => {
    const key = monthKeyOfMonth(month);
    const inMonth = expenses.filter((expense) => expense.date.slice(0, 7) === key);
    const parts = childrenBreakdown(inMonth, index, parentId).map(({ id, name, total }) => ({
      id,
      name,
      total,
    }));
    const cents = parts.reduce((sum, part) => sum + toCents(part.total), 0);
    return { ...month, key, total: cents / 100, parts };
  });
}

// Sum of `valueOf(item)` per month, aligned with `months` (e.g. deposits per month)
export function monthlyTotals(items, valueOf, months) {
  const cents = new Map(months.map((month) => [monthKeyOfMonth(month), 0]));
  for (const item of items) {
    const key = item.date.slice(0, 7);
    if (cents.has(key)) cents.set(key, cents.get(key) + toCents(valueOf(item)));
  }
  return months.map((month) => cents.get(monthKeyOfMonth(month)) / 100);
}

export function topExpenses(expenses, limit = 10) {
  return [...expenses]
    .sort((a, b) => Number(b.price) - Number(a.price) || b.date.localeCompare(a.date))
    .slice(0, limit);
}

// Everything the detail view of one category needs.
export function categoryDetail(periodExpenses, index, categoryId, period, today) {
  const inside = expensesInCategory(periodExpenses, index, categoryId).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return { expenses: inside, summary: summarize(inside, period, today) };
}

// ids of the categories directly under `parentId` (null = top level), in tree order,
// so every category keeps the same colour wherever it is drawn
export function siblingIds(index, parentId) {
  if (parentId == null) {
    return [...index.values()].filter((category) => category.parentId == null).map((c) => c.id);
  }
  return index.get(parentId)?.children ?? [];
}

// Parts of a composition bar: the biggest rows one by one, everything else together as "Pozostałe".
export function compositionParts(rows, colorOf, restColor, limit = 6) {
  const shown = rows.filter((row) => row.total > 0);
  const parts = shown.slice(0, limit).map((row) => ({
    key: String(row.id ?? "none"),
    label: row.name,
    value: row.total,
    color: colorOf(row),
  }));
  const rest = shown.slice(limit);
  if (rest.length > 0) {
    const cents = rest.reduce((sum, row) => sum + toCents(row.total), 0);
    parts.push({ key: "rest", label: "Pozostałe", value: cents / 100, color: restColor });
  }
  return parts;
}

// Drops the months before the first expense, but never leaves fewer than `min` months.
export function trimLeadingEmpty(months, earliestIso, min = 6) {
  if (!earliestIso) return months.slice(-min);
  const key = earliestIso.slice(0, 7);
  const kept = months.filter((month) => monthKeyOfMonth(month) >= key);
  return kept.length >= min ? kept : months.slice(-min);
}

// "lut" on the axis, with the year only where it changes: "sty 26"
export function axisLabel(month, position) {
  const label = shortMonthLabel(month);
  return position === 0 || month.month === 1 ? label : label.split(" ")[0];
}
