import React from "react";

// One bar split into coloured parts, in proportion to their values.
// parts: [{ key, label, value, color }]
const StackedBar = ({ parts, label }) => {
  const visible = parts.filter((part) => part.value > 0);
  const total = visible.reduce((sum, part) => sum + part.value, 0);

  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-4 w-full gap-px overflow-hidden rounded-full bg-neutral-800"
    >
      {total > 0 &&
        visible.map((part) => (
          <div
            key={part.key}
            title={part.label}
            className="h-full min-w-[3px]"
            style={{ width: `${(part.value / total) * 100}%`, backgroundColor: part.color }}
          />
        ))}
    </div>
  );
};

export default StackedBar;
