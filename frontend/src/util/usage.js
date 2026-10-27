import { chainOf, monthKeyOf, monthlySeries } from "./analysis.js";
import { shiftMonth } from "./format.js";

// The media whose consumption is tracked. Electricity is a monthly expense, so its consumption
// is read from the expenses (the usage typed with the expense); the rest is entered by hand.
export const UTILITIES = [
  { key: "ELECTRICITY", name: "Prąd", unit: "kWh", source: "expenses" },
  { key: "COLD_WATER", name: "Woda zimna", unit: "m³", source: "readings" },
  { key: "HOT_WATER", name: "Woda ciepła", unit: "m³", source: "readings" },
  { key: "HEATING", name: "Ogrzewanie", unit: "GJ", source: "readings" },
];

// Values for `count` months ending at `endMonth` (inclusive), oldest first, like monthlySeries.
// `count` of a point tells whether anything was entered for that month.
export function utilitySeries(utility, { readings, expenses, index }, endMonth, count) {
  if (utility.source === "expenses") {
    // categories whose consumption is measured in this unit, e.g. every category counted in kWh
    const ids = [...index.values()].filter((c) => c.unit === utility.unit).map((c) => c.id);
    const scoped = expenses.filter((e) => {
      const chain = chainOf(index, e.categoryId);
      return ids.some((id) => chain.includes(id));
    });
    return monthlySeries(scoped, endMonth, count, { field: "usage" });
  }

  const byMonth = new Map(
    readings
      .filter((r) => r.utility === utility.key)
      .map((r) => [monthKeyOf({ year: r.year, month: r.month }), Number(r.amount)])
  );

  const series = [];
  for (let i = count - 1; i >= 0; i--) {
    const month = shiftMonth(endMonth, -i);
    const key = monthKeyOf(month);
    series.push({
      ...month,
      key,
      count: byMonth.has(key) ? 1 : 0,
      value: byMonth.get(key) ?? 0,
    });
  }
  return series;
}
