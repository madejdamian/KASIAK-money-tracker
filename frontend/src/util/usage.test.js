import test from "node:test";
import assert from "node:assert/strict";
import { buildCategoryIndex } from "./analysis.js";
import { UTILITIES, utilitySeries } from "./usage.js";

const index = buildCategoryIndex([
  { id: 1, name: "Opłaty", unit: null, parentId: null, depth: 0 },
  { id: 2, name: "Prąd", unit: "kWh", parentId: 1, depth: 1 },
]);

const byKey = (key) => UTILITIES.find((u) => u.key === key);

test("hand-entered utility: a month without a reading counts as nothing entered", () => {
  const readings = [
    { utility: "COLD_WATER", year: 2026, month: 9, amount: "6.5" },
    { utility: "HOT_WATER", year: 2026, month: 10, amount: "3" },
  ];
  const series = utilitySeries(byKey("COLD_WATER"), { readings, expenses: [], index }, { year: 2026, month: 10 }, 3);

  assert.deepEqual(series.map((p) => [p.key, p.value, p.count]), [
    ["2026-08", 0, 0],
    ["2026-09", 6.5, 1],
    ["2026-10", 0, 0],
  ]);
});

test("electricity is summed from the usage typed with expenses in kWh categories", () => {
  const expenses = [
    { categoryId: 2, date: "2026-10-05T10:00:00", price: 200, usageAmount: 400 },
    { categoryId: 2, date: "2026-10-20T10:00:00", price: 10, usageAmount: 12.5 },
    { categoryId: 1, date: "2026-10-06T10:00:00", price: 99, usageAmount: 77 },
  ];
  const series = utilitySeries(byKey("ELECTRICITY"), { readings: [], expenses, index }, { year: 2026, month: 10 }, 1);

  assert.equal(series[0].value, 412.5);
});
