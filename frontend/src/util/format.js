const moneyFormat = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  // pl-PL skips the thousands separator for 4-digit numbers by default
  useGrouping: "always",
});

const monthFormat = new Intl.DateTimeFormat("pl-PL", {
  month: "long",
  year: "numeric",
});

const dayFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
});

export function formatMoney(value) {
  return moneyFormat.format(Number(value ?? 0));
}

export function formatDay(isoDate) {
  return dayFormat.format(new Date(isoDate));
}

export function formatUsage(value, unit) {
  const number = Number(value).toLocaleString("pl-PL", {
    maximumFractionDigits: 3,
  });
  return unit ? `${number} ${unit}` : number;
}

export function currentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthLabel({ year, month }) {
  return monthFormat.format(new Date(year, month - 1, 1));
}

export function shiftMonth({ year, month }, delta) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

// "2025-03" <-> { year: 2025, month: 3 } (used in the address bar)
export function parseMonth(text) {
  const match = /^(\d{4})-(\d{1,2})$/.exec(text ?? "");
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year: Number(match[1]), month };
}

export function monthKey({ year, month }) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// value for <input type="datetime-local"> in the local time zone
export function toInputDateTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

// the backend returns local date-times without a zone, e.g. "2025-03-13T14:09:12"
export function fromApiDateTime(text) {
  return text ? text.slice(0, 16) : toInputDateTime();
}

// Turns the category tree into a flat list in tree order, each item with its depth and
// full path, e.g. { label: "Opłaty › Media › Prąd", depth: 2, unit: "kWh" }.
export function flattenCategories(tree, parentPath = [], depth = 0) {
  return tree.flatMap((node) => {
    const path = [...parentPath, node.name];
    return [
      {
        id: node.id,
        name: node.name,
        unit: node.unit,
        parentId: node.parentId,
        depth,
        path,
        label: path.join(" › "),
      },
      ...flattenCategories(node.children ?? [], path, depth + 1),
    ];
  });
}

// ids of the category and everything below it
export function descendantIds(flat, id) {
  const ids = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of flat) {
      if (item.parentId != null && ids.has(item.parentId) && !ids.has(item.id)) {
        ids.add(item.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function rememberChoice(key, value) {
  try {
    localStorage.setItem(`last:${key}`, String(value));
  } catch {
    // storage may be unavailable
  }
}

export function recallChoice(key) {
  try {
    return localStorage.getItem(`last:${key}`) ?? "";
  } catch {
    return "";
  }
}

// "+12%" / "−3%" for a ratio like 0.123; "–" when there is nothing to compare with
export function formatPercent(ratio) {
  if (ratio == null) return "–";
  const rounded = Math.round(ratio * 100);
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${Math.abs(rounded)}%`;
}

export function formatDelta(value) {
  if (value === 0) return formatMoney(0);
  return `${value > 0 ? "+" : "−"}${formatMoney(Math.abs(value))}`;
}

// short label of a month for chart rows, e.g. "mar 25"
export function shortMonthLabel({ year, month }) {
  return new Intl.DateTimeFormat("pl-PL", { month: "short", year: "2-digit" }).format(
    new Date(year, month - 1, 1)
  );
}
