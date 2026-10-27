import React from "react";
import BarRow from "./BarRow";
import { shortMonthLabel } from "../../util/format";

// A bar per month, e.g. spending or electricity usage over the last year.
const TrendBars = ({ series, formatValue, highlightKey }) => {
  const largest = Math.max(0, ...series.map((point) => point.value));

  return (
    <div>
      {series.map((point) => (
        <BarRow
          key={point.key}
          label={
            <span className={point.key === highlightKey ? "font-semibold" : "text-neutral-300"}>
              {shortMonthLabel(point)}
            </span>
          }
          value={formatValue(point.value)}
          ratio={largest === 0 ? 0 : point.value / largest}
          tone={point.key === highlightKey ? "default" : "muted"}
        />
      ))}
    </div>
  );
};

export default TrendBars;
