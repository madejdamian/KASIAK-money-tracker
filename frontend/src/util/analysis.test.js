import test from "node:test";
import assert from "node:assert/strict";
import {
  DIRECT_LABEL,
  biggestChanges,
  buildCategoryIndex,
  chainOf,
  childrenBreakdown,
  compare,
  expensesBySource,
  expensesInCategory,
  expensesInMonth,
  expensesWithTag,
  monthlySeries,
  rollupByDepth,
  tagTotals,
  totalOf,
} from "./analysis.js";
import { applyExpenseFilters, emptyFilters } from "./filters.js";
import { flattenCategories } from "./format.js";

// Bills(1) > Utilities(2) > Electricity(3, kWh), Water(4); Bills > Rent(5); Fun(6)
const tree = [
  {
    id: 1,
    name: "Bills",
    parentId: null,
    unit: null,
    children: [
      {
        id: 2,
        name: "Utilities",
        parentId: 1,
        unit: null,
        children: [
          { id: 3, name: "Electricity", parentId: 2, unit: "kWh", children: [] },
          { id: 4, name: "Water", parentId: 2, unit: "m3", children: [] },
        ],
      },
      { id: 5, name: "Rent", parentId: 1, unit: null, children: [] },
    ],
  },
  { id: 6, name: "Fun", parentId: null, unit: null, children: [] },
];
const index = buildCategoryIndex(flattenCategories(tree));

let counter = 0;
function expense(date, price, categoryId, extra = {}) {
  counter += 1;
  return {
    slug: `e${counter}`,
    title: `expense ${counter}`,
    date: `${date}T12:00:00`,
    price,
    categoryId,
    categoryPath: [],
    memberId: 1,
    memberName: "Anna",
    paymentSource: "SHARED_CARD",
    usageAmount: null,
    ...extra,
  };
}

test("chainOf returns ids from the top-level category down", () => {
  assert.deepEqual(chainOf(index, 3), [1, 2, 3]);
  assert.deepEqual(chainOf(index, 6), [6]);
  assert.deepEqual(chainOf(index, null), []);
});

test("totalOf sums without floating point drift", () => {
  const list = [expense("2025-03-01", 0.1, 6), expense("2025-03-02", 0.2, 6)];
  assert.equal(totalOf(list), 0.3);
});

test("expensesInMonth and expensesBySource filter the list", () => {
  const list = [
    expense("2025-03-01", 10, 6),
    expense("2025-04-01", 20, 6, { paymentSource: "PRIVATE_CARD" }),
  ];
  assert.equal(expensesInMonth(list, { year: 2025, month: 3 }).length, 1);
  assert.equal(expensesBySource(list, "ALL").length, 2);
  assert.equal(expensesBySource(list, "PRIVATE_CARD").length, 1);
});

test("childrenBreakdown includes everything below each child", () => {
  const list = [
    expense("2025-03-01", 100, 3),
    expense("2025-03-02", 50, 4),
    expense("2025-03-03", 800, 5),
    expense("2025-03-04", 30, 6),
  ];

  const top = childrenBreakdown(list, index, null);
  assert.deepEqual(
    top.map((i) => [i.name, i.total]),
    [
      ["Bills", 950],
      ["Fun", 30],
    ]
  );
  assert.equal(top[0].expandable, true);
  assert.equal(top[1].expandable, false);
  assert.ok(Math.abs(top[0].share - 950 / 980) < 1e-9);

  const bills = childrenBreakdown(list, index, 1);
  assert.deepEqual(
    bills.map((i) => [i.name, i.total]),
    [
      ["Rent", 800],
      ["Utilities", 150],
    ]
  );
});

test("childrenBreakdown shows expenses assigned directly to the opened category", () => {
  const list = [expense("2025-03-01", 70, 2), expense("2025-03-02", 30, 3)];

  const utilities = childrenBreakdown(list, index, 2);
  const direct = utilities.find((i) => i.direct);

  assert.equal(direct.name, DIRECT_LABEL);
  assert.equal(direct.total, 70);
  assert.equal(direct.expandable, false);
  assert.equal(utilities.find((i) => i.id === 3).total, 30);
});

test("childrenBreakdown groups expenses without a category", () => {
  const list = [expense("2025-03-01", 15, null)];
  const top = childrenBreakdown(list, index, null);
  assert.equal(top[0].name, "Bez kategorii");
  assert.equal(top[0].total, 15);
});

test("rollupByDepth rolls deeper categories up to the chosen level", () => {
  const list = [
    expense("2025-03-01", 100, 3),
    expense("2025-03-02", 50, 4),
    expense("2025-03-03", 800, 5),
    expense("2025-03-04", 30, 6),
  ];

  assert.deepEqual(
    rollupByDepth(list, index, 0).map((i) => [i.name, i.total]),
    [
      ["Bills", 950],
      ["Fun", 30],
    ]
  );
  assert.deepEqual(
    rollupByDepth(list, index, 1).map((i) => [i.name, i.total]),
    [
      ["Bills › Rent", 800],
      ["Bills › Utilities", 150],
      ["Fun", 30],
    ]
  );
  // deeper than the tree: categories stay as they are
  assert.deepEqual(
    rollupByDepth(list, index, 5).map((i) => i.name),
    ["Bills › Rent", "Bills › Utilities › Electricity", "Bills › Utilities › Water", "Fun"]
  );
});

test("monthlySeries returns consecutive months across a year boundary", () => {
  const list = [
    expense("2024-12-10", 100, 6),
    expense("2025-01-10", 40, 6),
    expense("2025-01-20", 60, 6),
  ];

  const series = monthlySeries(list, { year: 2025, month: 2 }, 3);

  assert.deepEqual(
    series.map((s) => [s.key, s.value, s.count]),
    [
      ["2024-12", 100, 1],
      ["2025-01", 100, 2],
      ["2025-02", 0, 0],
    ]
  );
});

test("monthlySeries sums usage and skips expenses without it", () => {
  const list = [
    expense("2025-03-01", 100, 3, { usageAmount: 120.5 }),
    expense("2025-03-02", 80, 3, { usageAmount: 99.25 }),
    expense("2025-03-03", 10, 3),
  ];

  const [march] = monthlySeries(list, { year: 2025, month: 3 }, 1, { field: "usage" });

  assert.equal(march.value, 219.75);
  assert.equal(march.count, 2);
});

test("expensesInCategory keeps the category and its descendants", () => {
  const list = [expense("2025-03-01", 1, 3), expense("2025-03-01", 2, 5), expense("2025-03-01", 4, 6)];
  assert.equal(totalOf(expensesInCategory(list, index, 2)), 1);
  assert.equal(totalOf(expensesInCategory(list, index, 1)), 3);
  assert.equal(totalOf(expensesInCategory(list, index, null)), 7);
});

test("compare returns difference and ratio", () => {
  assert.deepEqual(compare(150, 100), { current: 150, previous: 100, diff: 50, pct: 0.5 });
  assert.equal(compare(10, 0).pct, null);
  assert.equal(compare(50, 100).diff, -50);
});

test("biggestChanges orders categories by absolute change", () => {
  const march = [expense("2025-03-01", 500, 5), expense("2025-03-02", 90, 6)];
  const february = [
    expense("2025-02-01", 450, 5),
    expense("2025-02-02", 200, 6),
    expense("2025-02-03", 25, 4),
  ];

  const changes = biggestChanges(march, february, index, 0);

  assert.deepEqual(
    changes.map((c) => [c.name, c.diff]),
    [
      ["Fun", -110],
      ["Bills", 25],
    ]
  );
  assert.equal(changes[1].current, 500);
  assert.equal(changes[1].previous, 475);
});

test("applyExpenseFilters combines all criteria", () => {
  const list = [
    expense("2025-03-01", 100, 3, { title: "Electricity bill", categoryPath: ["Bills", "Utilities", "Electricity"] }),
    expense("2025-03-02", 800, 5, { title: "March rent", memberId: 2, memberName: "Jan", tags: ["remont"] }),
    expense("2025-03-03", 30, 6, { paymentSource: "PRIVATE_CARD", description: "cinema" }),
  ];

  const filter = (changes) => applyExpenseFilters(list, index, { ...emptyFilters, ...changes });

  assert.equal(filter({}).length, 3);
  assert.equal(filter({ text: "RENT" }).length, 1);
  assert.equal(filter({ text: "cinema" }).length, 1);
  assert.equal(filter({ text: "utilities" }).length, 1);
  assert.equal(filter({ categoryId: "1" }).length, 2);
  assert.equal(filter({ memberId: "2" }).length, 1);
  assert.equal(filter({ source: "PRIVATE_CARD" }).length, 1);
  assert.equal(filter({ min: "50", max: "500" }).length, 1);
  assert.equal(filter({ tag: "remont" }).length, 1);
  assert.equal(filter({ tag: "brak" }).length, 0);
  assert.equal(filter({ text: "remont" }).length, 1);
  assert.equal(filter({ categoryId: "1", min: "500" }).length, 1);
});

test("tagTotals counts an expense under each of its tags", () => {
  const list = [
    expense("2025-03-01", 100, 6, { tags: ["wakacje", "dzieci"] }),
    expense("2025-03-02", 50, 6, { tags: ["wakacje"] }),
    expense("2025-03-03", 10, 6),
  ];

  const totals = tagTotals(list);

  assert.deepEqual(
    totals.map((t) => [t.name, t.total, t.count]),
    [
      ["wakacje", 150, 2],
      ["dzieci", 100, 1],
    ]
  );
  assert.equal(expensesWithTag(list, "dzieci").length, 1);
  assert.equal(expensesWithTag(list, "brak").length, 0);
});
