import React from "react";
import { Card } from "../ui/ui";
import TrendBars from "../analysis/TrendBars";
import { DeltaLine } from "../analysis/Comparison";
import { monthKeyOf } from "../../util/analysis";
import { formatUsage } from "../../util/format";

const usageDelta = (unit) => (diff) =>
  diff === 0 ? formatUsage(0, unit) : `${diff > 0 ? "+" : "−"}${formatUsage(Math.abs(diff), unit)}`;

// One medium: the consumption of the selected month, how it compares and the last 12 months.
// `series` has 13 months ending at `month`: the first is the same month a year ago, the rest is the trend.
// `children` is an optional area under the figure (e.g. the field to enter the consumption).
// `trendLength` limits how many of the last months the trend list shows.
const UtilityCard = ({ utility, series, month, trendLength = 12, children }) => {
  const format = (value) => formatUsage(value, utility.unit);
  const yearAgo = series[0].value;
  const trend = series.slice(1);
  const current = trend[trend.length - 1].value;
  const previous = trend[trend.length - 2].value;
  const hasData = series.some((point) => point.count > 0);

  return (
    <Card>
      <h2 className="font-display text-xl font-bold">{utility.name}</h2>
      <p className="font-display text-4xl font-light mt-1 tabular-nums">{format(current)}</p>
      <p className="text-sm text-neutral-400">w wybranym miesiącu</p>

      {children && <div className="mt-4">{children}</div>}

      {hasData && (
        <>
          <div className="mt-4 border-t border-neutral-800 pt-2">
            <DeltaLine
              label="Poprzedni miesiąc"
              current={current}
              previous={previous}
              format={format}
              formatDiff={usageDelta(utility.unit)}
            />
            <DeltaLine
              label="Rok temu"
              current={current}
              previous={yearAgo}
              format={format}
              formatDiff={usageDelta(utility.unit)}
            />
          </div>
          <div className="mt-3">
            <TrendBars series={trend.slice(-trendLength)} highlightKey={monthKeyOf(month)} formatValue={format} />
          </div>
        </>
      )}
    </Card>
  );
};

export default UtilityCard;
