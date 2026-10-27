import test from "node:test";
import assert from "node:assert/strict";
import {
  baselinePeriod,
  inPeriod,
  monthsForAverage,
  monthsOfPeriod,
  resolvePeriod,
} from "./period.js";

const TODAY = "2026-10-27";
const at = (spec, extra = {}) => resolvePeriod(spec, { today: TODAY, ...extra });
const range = (p) => [p.from, p.to];

test("presets resolve to whole months", () => {
  assert.deepEqual(range(at("month")), ["2026-10-01", "2026-10-31"]);
  assert.deepEqual(range(at("prev")), ["2026-09-01", "2026-09-30"]);
  assert.deepEqual(range(at("3m")), ["2026-08-01", "2026-10-31"]);
  assert.deepEqual(range(at("12m")), ["2025-11-01", "2026-10-31"]);
  assert.deepEqual(range(at("year")), ["2026-01-01", "2026-12-31"]);
  assert.deepEqual(range(at("2026-02")), ["2026-02-01", "2026-02-28"]);
});

test("the previous month and the last months cross the turn of the year", () => {
  const january = { today: "2026-01-15" };
  assert.deepEqual(range(resolvePeriod("prev", january)), ["2025-12-01", "2025-12-31"]);
  assert.deepEqual(range(resolvePeriod("3m", { today: "2026-02-10" })), ["2025-12-01", "2026-02-28"]);
});

test("all time starts at the month of the oldest expense", () => {
  assert.deepEqual(range(at("all", { earliest: "2025-07-19" })), ["2025-07-01", "2026-10-31"]);
  assert.deepEqual(range(at("all")), ["2026-10-01", "2026-10-31"]);
});

test("a broken spec falls back to this month", () => {
  assert.equal(at("nonsense").spec, "month");
  assert.equal(at("2026-13").spec, "month");
  assert.equal(at("custom", { from: "2026-05-10", to: "2026-05-01" }).spec, "month");
  assert.deepEqual(range(at("custom", { from: "2026-05-10", to: "2026-05-20" })), ["2026-05-10", "2026-05-20"]);
});

test("an expense belongs to a period by its date, ends included", () => {
  const period = at("month");
  assert.ok(inPeriod("2026-10-01T00:00:00", period));
  assert.ok(inPeriod("2026-10-31T23:59:00", period));
  assert.ok(!inPeriod("2026-11-01T00:00:00", period));
  assert.ok(!inPeriod("2026-09-30T23:59:59", period));
});

test("baseline of whole months shifts by the same number of months", () => {
  assert.deepEqual(range(baselinePeriod(at("month"), "prev")), ["2026-09-01", "2026-09-30"]);
  assert.deepEqual(range(baselinePeriod(at("3m"), "prev")), ["2026-05-01", "2026-07-31"]);
  assert.deepEqual(range(baselinePeriod(at("year"), "prev")), ["2025-01-01", "2025-12-31"]);
  assert.deepEqual(range(baselinePeriod(at("month"), "yearago")), ["2025-10-01", "2025-10-31"]);
});

test("baseline works across the leap day", () => {
  const february = resolvePeriod("2024-02", { today: "2024-03-05" });
  assert.deepEqual(range(february), ["2024-02-01", "2024-02-29"]);
  assert.deepEqual(range(baselinePeriod(february, "prev")), ["2024-01-01", "2024-01-31"]);
  assert.deepEqual(range(baselinePeriod(february, "yearago")), ["2023-02-01", "2023-02-28"]);
  const march = resolvePeriod("2024-03", { today: "2024-03-05" });
  assert.deepEqual(range(baselinePeriod(march, "prev")), ["2024-02-01", "2024-02-29"]);
});

test("baseline of a custom range is the same number of days right before it", () => {
  const custom = at("custom", { from: "2026-03-10", to: "2026-03-19" });
  assert.deepEqual(range(baselinePeriod(custom, "prev")), ["2026-02-28", "2026-03-09"]);
  assert.deepEqual(range(baselinePeriod(custom, "yearago")), ["2025-03-10", "2025-03-19"]);
  const leapDay = at("custom", { from: "2024-02-29", to: "2024-03-02" });
  assert.deepEqual(range(baselinePeriod(leapDay, "yearago")), ["2023-02-28", "2023-03-02"]);
});

test("all time and 'none' have no baseline", () => {
  assert.equal(baselinePeriod(at("all"), "prev"), null);
  assert.equal(baselinePeriod(at("month"), "none"), null);
});

test("an average divides by the months that have passed, not the whole year", () => {
  assert.equal(monthsForAverage(at("year"), TODAY), 10);
  assert.equal(monthsForAverage(at("month"), TODAY), 1);
  assert.equal(monthsForAverage(at("3m"), TODAY), 3);
  assert.equal(monthsForAverage(at("2025-03"), TODAY), 1);
});

test("months of a period are listed oldest first", () => {
  assert.deepEqual(monthsOfPeriod(at("3m")), [
    { year: 2026, month: 8 },
    { year: 2026, month: 9 },
    { year: 2026, month: 10 },
  ]);
});
