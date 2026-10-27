import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { monthLabel, shiftMonth } from "../../util/format";

const arrowClass =
  "w-12 h-12 rounded-xl bg-neutral-800 text-neutral-200 transition-colors hover:bg-brand hover:text-on-brand";

// On the desktop the switcher hugs its content instead of stretching across the page.
const MonthSwitcher = ({ value, onChange }) => (
  <div className="flex items-center justify-between px-4 py-2 lg:justify-start lg:gap-4">
    <button
      type="button"
      aria-label="Poprzedni miesiąc"
      onClick={() => onChange(shiftMonth(value, -1))}
      className={arrowClass}
    >
      <FontAwesomeIcon icon={faChevronLeft} />
    </button>
    <span className="font-display text-xl font-bold capitalize lg:w-56 lg:text-center">
      {monthLabel(value)}
    </span>
    <button
      type="button"
      aria-label="Następny miesiąc"
      onClick={() => onChange(shiftMonth(value, 1))}
      className={arrowClass}
    >
      <FontAwesomeIcon icon={faChevronRight} />
    </button>
  </div>
);

export default MonthSwitcher;
