import { shiftMonth } from "./format.js";

// Pure functions behind the analysis screen. Money is summed in cents to avoid
// floating point drift; usage is summed in thousandths (3 decimals, like the backend).

const UNCATEGORIZED = "Bez kategorii";
export const DIRECT_LABEL = "Bezpośrednio w tej kategorii";

const toCents = (value) => Math.round(Number(value) * 100);
const toThousandths = (value) => Math.round(Number(value) * 1000);

export const monthKeyOf = ({ year, month }) =>
  `${year}-${String(month).padStart(2, "0")}`;

// categories: flat list from flattenCategories (id, name, unit, parentId, depth)
export function buildCategoryIndex(categories) {
  const index = new Map();
  for (const category of categories) {
    index.set(category.id, {
      id: category.id,
      name: category.name,
      unit: category.unit ?? null,
      parentId: category.parentId ?? null,
      depth: category.depth,
      children: [],
    });
  }
  for (const category of index.values()) {
    if (category.parentId != null && index.has(category.parentId)) {
      index.get(category.parentId).children.push(category.id);
    }
  }
  return index;
}

// ids from the top-level category down to the given one
export function chainOf(index, categoryId) {
  const chain = [];
  let current = categoryId == null ? undefined : index.get(categoryId);
  while (current) {
    chain.unshift(current.id);
    current = current.parentId == null ? undefined : index.get(current.parentId);
  }
  return chain;
}

export function labelOf(index, categoryId) {
  return chainOf(index, categoryId)
    .map((id) => index.get(id).name)
    .join(" › ");
}

export function expensesInMonth(expenses, month) {
  const key = monthKeyOf(month);
  return expenses.filter((expense) => expense.date.slice(0, 7) === key);
}

export function expensesBySource(expenses, source) {
  return source === "ALL"
    ? expenses
    : expenses.filter((expense) => expense.paymentSource === source);
}

export function totalOf(expenses) {
  return expenses.reduce((sum, e) => sum + toCents(e.price), 0) / 100;
}

function addToGroup(groups, key, expense) {
  const group = groups.get(key) ?? { cents: 0, count: 0 };
  group.cents += toCents(expense.price);
  group.count += 1;
  groups.set(key, group);
}

function groupsToItems(groups, nameOf) {
  const grandTotal = [...groups.values()].reduce((sum, g) => sum + g.cents, 0);
  return [...groups.entries()]
    .map(([id, group]) => ({
      id,
      name: nameOf(id),
      total: group.cents / 100,
      count: group.count,
      share: grandTotal === 0 ? 0 : group.cents / grandTotal,
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "pl"));
}

// Flat view at a chosen level of detail (depth 0 = top-level categories): every expense is
// counted in its ancestor at that depth, or in its own category when that sits higher up.
export function rollupByDepth(expenses, index, depth) {
  const groups = new Map();
  for (const expense of expenses) {
    const chain = chainOf(index, expense.categoryId);
    const key = chain.length === 0 ? null : chain[Math.min(depth, chain.length - 1)];
    addToGroup(groups, key, expense);
  }
  return groupsToItems(groups, (id) =>
    id == null ? UNCATEGORIZED : labelOf(index, id)
  );
}

// One step of the drill-down: the direct children of `parentId` (null = top level) with
// totals including everything below them. Expenses assigned to `parentId` itself are
// returned as an item marked `direct`.
export function childrenBreakdown(expenses, index, parentId) {
  const groups = new Map();
  for (const expense of expenses) {
    const chain = chainOf(index, expense.categoryId);
    let key;
    if (parentId == null) {
      key = chain.length === 0 ? null : chain[0];
    } else {
      const position = chain.indexOf(parentId);
      if (position === -1) continue;
      key = position === chain.length - 1 ? parentId : chain[position + 1];
    }
    addToGroup(groups, key, expense);
  }

  const items = groupsToItems(groups, (id) => {
    if (id == null) return UNCATEGORIZED;
    if (id === parentId) return DIRECT_LABEL;
    return index.get(id).name;
  });

  return items.map((item) => ({
    ...item,
    direct: parentId != null && item.id === parentId,
    expandable:
      item.id != null &&
      item.id !== parentId &&
      index.get(item.id).children.length > 0,
  }));
}

export function expensesInCategory(expenses, index, categoryId) {
  if (categoryId == null) return expenses;
  return expenses.filter((e) => chainOf(index, e.categoryId).includes(categoryId));
}

// Values for `count` months ending at `endMonth` (inclusive), oldest first.
// field "price" sums amounts, field "usage" sums the consumption (e.g. kWh).
export function monthlySeries(expenses, endMonth, count, { field = "price" } = {}) {
  const series = [];
  for (let i = count - 1; i >= 0; i--) {
    const month = shiftMonth(endMonth, -i);
    const key = monthKeyOf(month);
    let sum = 0;
    let n = 0;
    for (const expense of expenses) {
      if (expense.date.slice(0, 7) !== key) continue;
      if (field === "usage") {
        if (expense.usageAmount == null) continue;
        sum += toThousandths(expense.usageAmount);
      } else {
        sum += toCents(expense.price);
      }
      n += 1;
    }
    series.push({
      ...month,
      key,
      count: n,
      value: field === "usage" ? sum / 1000 : sum / 100,
    });
  }
  return series;
}

export function compare(current, previous) {
  const diff = Math.round((current - previous) * 100) / 100;
  return {
    current,
    previous,
    diff,
    pct: previous === 0 ? null : diff / previous,
  };
}

// Categories (rolled up to `depth`) whose spending changed the most between two periods.
export function biggestChanges(currentExpenses, previousExpenses, index, depth, limit = 5) {
  const current = new Map(
    rollupByDepth(currentExpenses, index, depth).map((item) => [item.id, item])
  );
  const previous = new Map(
    rollupByDepth(previousExpenses, index, depth).map((item) => [item.id, item])
  );

  const ids = new Set([...current.keys(), ...previous.keys()]);
  return [...ids]
    .map((id) => {
      const now = current.get(id)?.total ?? 0;
      const before = previous.get(id)?.total ?? 0;
      return {
        id,
        name: (current.get(id) ?? previous.get(id)).name,
        current: now,
        previous: before,
        diff: Math.round((now - before) * 100) / 100,
      };
    })
    .filter((item) => item.diff !== 0)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, limit);
}
