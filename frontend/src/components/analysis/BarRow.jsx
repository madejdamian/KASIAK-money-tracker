import React from "react";

// One row of a horizontal bar list. `ratio` (0..1) sets the bar length.
const BarRow = ({ label, value, ratio, hint, onClick, tone = "default" }) => {
  const content = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 break-words text-left">{label}</span>
        <span className="tabular-nums whitespace-nowrap">{value}</span>
      </div>
      <div className="h-2 mt-2 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            tone === "muted" ? "bg-neutral-600" : "bg-secondColor"
          }`}
          style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
        />
      </div>
      {hint && <p className="text-xs text-neutral-500 mt-1 text-left">{hint}</p>}
    </>
  );

  if (!onClick) {
    return <div className="py-2">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full py-2 text-left active:bg-neutral-800 rounded-lg"
    >
      {content}
    </button>
  );
};

export default BarRow;
