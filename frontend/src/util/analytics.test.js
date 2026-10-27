import test from "node:test";
import assert from "node:assert/strict";
import { buildCategoryIndex } from "./analysis.js";
import {
  biggestMoves,
  categoryRows,
  compareValues,
  compositionParts,
  groupRows,
  monthlyStack,
  monthlyTotals,
  roundShares,
  siblingIds,
  summarize,
  topExpenses,
  trimLeadingEmpty,
} from "./analytics.js";
import { resolvePeriod } from "./period.js";

const index = buildCategoryIndex([
  { id: 1, name: "Opłaty", unit: null, parentId: null, depth: 0 },
  { id: 2, name: "Czynsz", unit: null, parentId: 1, depth: 1 },
  { id: 3, name: "Media", unit: null, parentId: 1, depth: 1 },
  { id: 4, name: "Prąd", unit: "kWh", parentId: 3, depth: 2 },
  { id: 5, name: "Jedzenie", unit: null, parentId: null, depth: 0 },
]);

const e = (categoryId, price, date = "2026-10-05T10:00:00", extra = {}) => ({
  categoryId,
  price,
  date,
  ...extra,
});

test("shares are whole percents that always add up to 100", () => {
  assert.deepEqual(roundShares([1, 1, 1]), [34, 33, 33]);
  assert.equal(roundShares([1, 2, 3, 7, 11, 13]).reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(roundShares([0, 0]), [0, 0]);
  assert.deepEqual(roundShares([5]), [100]);
});

test("a change is new, gone, up, down or the same - never a division by zero", () => {
  assert.equal(compareValues(10, 0).status, "new");
  assert.equal(compareValues(10, 0).pct, null);
  assert.equal(compareValues(0, 10).status, "gone");
  assert.equal(compareValues(12, 10).status, "up");
  assert.equal(compareValues(8, 10).status, "down");
  assert.equal(compareValues(10, 10).status, "same");
  assert.equal(compareValues(12, 10).pct, 0.2);
});

test("category rows give totals with subcategories, shares and the change against the baseline", () => {
  const current = [e(2, 1000), e(4, 200), e(5, 300), e(5, 100)];
  const baseline = [e(2, 1000), e(4, 100), e(5, 500)];

  const rows = categoryRows(current, baseline, index, null);

  assert.deepEqual(rows.map((r) => [r.name, r.total, r.percent, r.status]), [
    ["Opłaty", 1200, 75, "up"],
    ["Jedzenie", 400, 25, "down"],
  ]);
  assert.equal(rows[0].prevTotal, 1100);
  assert.equal(rows[0].expandable, true);
  assert.equal(rows[1].expandable, false);
});

test("a category that exists only in the baseline stays visible as gone, one that exists only now as new", () => {
  const rows = categoryRows([e(5, 50)], [e(2, 700)], index, null);

  assert.deepEqual(rows.map((r) => [r.name, r.total, r.status, r.diff]), [
    ["Jedzenie", 50, "new", 50],
    ["Opłaty", 0, "gone", -700],
  ]);
});

test("without a baseline there is no comparison", () => {
  const rows = categoryRows([e(5, 50)], null, index, null);
  assert.equal(rows[0].status, "none");
  assert.equal(rows[0].diff, null);
});

test("expenses filed directly under a parent category appear as their own row", () => {
  const rows = categoryRows([e(1, 40), e(2, 60)], null, index, 1);

  assert.deepEqual(rows.map((r) => [r.name, r.total, r.direct]), [
    ["Czynsz", 60, false],
    ["Bezpośrednio w tej kategorii", 40, true],
  ]);
});

test("expenses without a known category are listed as 'Bez kategorii'", () => {
  const rows = categoryRows([e(null, 30), e(5, 70)], null, index, null);
  assert.deepEqual(rows.map((r) => [r.name, r.total]), [["Jedzenie", 70], ["Bez kategorii", 30]]);
});

test("money is summed in cents", () => {
  const rows = categoryRows([e(5, 0.1), e(5, 0.2)], null, index, null);
  assert.equal(rows[0].total, 0.3);
});

test("grouping by tag counts a multi-tag expense under each tag and keeps untagged ones", () => {
  const expenses = [
    e(5, 100, undefined, { tags: ["wakacje", "dzieci"] }),
    e(5, 50, undefined, { tags: ["wakacje"] }),
    e(5, 25, undefined, { tags: [] }),
  ];
  const rows = groupRows(expenses, null, "tag");

  assert.deepEqual(rows.map((r) => [r.name, r.total, r.count]), [
    ["#wakacje", 150, 2],
    ["#dzieci", 100, 1],
    ["Bez tagu", 25, 1],
  ]);
});

test("grouping by member and by card", () => {
  const expenses = [
    e(5, 20, undefined, { memberId: 1, memberName: "damian", paymentSource: "SHARED_CARD" }),
    e(5, 30, undefined, { memberId: 2, memberName: "justyna", paymentSource: "PRIVATE_CARD" }),
    e(5, 20, undefined, { memberId: 2, memberName: "justyna", paymentSource: "SHARED_CARD" }),
  ];

  assert.deepEqual(groupRows(expenses, null, "member").map((r) => [r.name, r.total]), [
    ["justyna", 50],
    ["damian", 20],
  ]);
  assert.deepEqual(groupRows(expenses, null, "source").map((r) => [r.name, r.total]), [
    ["Karta wspólna", 40],
    ["Karta prywatna", 30],
  ]);
});

test("the biggest moves are ordered by size and include new and gone rows", () => {
  const rows = categoryRows([e(5, 500), e(2, 110)], [e(5, 100), e(3, 300), e(2, 100)], index, null);
  const moves = biggestMoves(rows, 3);

  assert.deepEqual(moves.map((r) => [r.name, r.status]), [
    ["Jedzenie", "up"],
    ["Opłaty", "down"],
  ]);
});

test("monthly stacks split every month into the children of a category", () => {
  const months = [{ year: 2026, month: 9 }, { year: 2026, month: 10 }];
  const stack = monthlyStack(
    [e(2, 100, "2026-09-02T10:00:00"), e(5, 40, "2026-10-02T10:00:00"), e(2, 10, "2026-10-03T10:00:00")],
    index,
    null,
    months
  );

  assert.deepEqual(stack.map((m) => [m.key, m.total]), [["2026-09", 100], ["2026-10", 50]]);
  assert.deepEqual(stack[1].parts.map((p) => [p.name, p.total]), [["Jedzenie", 40], ["Opłaty", 10]]);
});

test("monthly totals line up with the months and ignore other months", () => {
  const months = [{ year: 2026, month: 9 }, { year: 2026, month: 10 }];
  const deposits = [
    { date: "2026-09-01T09:00:00", amount: "3000" },
    { date: "2026-10-01T09:00:00", amount: "3500" },
    { date: "2026-10-14T09:00:00", amount: "500" },
    { date: "2025-10-01T09:00:00", amount: "999" },
  ];
  assert.deepEqual(monthlyTotals(deposits, (d) => d.amount, months), [3000, 4000]);
});

test("a summary averages over the months passed so far", () => {
  const period = resolvePeriod("year", { today: "2026-10-27" });
  const summary = summarize([e(5, 1000), e(5, 500, "2026-02-01T10:00:00")], period, "2026-10-27");

  assert.equal(summary.total, 1500);
  assert.equal(summary.count, 2);
  assert.equal(summary.avgPerMonth, 150);
  assert.equal(summary.largest, 1000);
});

test("the biggest expenses come first", () => {
  const top = topExpenses([e(5, 10), e(5, 90), e(5, 50)], 2);
  assert.deepEqual(top.map((x) => x.price), [90, 50]);
});

test("siblings come in tree order and a composition bar groups the small rows", () => {
  assert.deepEqual(siblingIds(index, null), [1, 5]);
  assert.deepEqual(siblingIds(index, 1), [2, 3]);

  const rows = [10, 9, 8, 1, 1].map((total, i) => ({ id: i + 1, name: `k${i}`, total }));
  const parts = compositionParts(rows, () => "#fff", "#555", 3);
  assert.deepEqual(parts.map((x) => [x.label, x.value]), [["k0", 10], ["k1", 9], ["k2", 8], ["Pozostałe", 2]]);
});

test("the months before the first expense are dropped, but a chart keeps at least a few months", () => {
  const months = [1, 2, 3, 4, 5, 6, 7, 8].map((month) => ({ year: 2026, month }));
  assert.deepEqual(trimLeadingEmpty(months, "2026-03-15", 3).map((m) => m.month), [3, 4, 5, 6, 7, 8]);
  assert.deepEqual(trimLeadingEmpty(months, "2026-08-01", 3).map((m) => m.month), [6, 7, 8]);
  assert.equal(trimLeadingEmpty(months, null, 3).length, 3);
});
