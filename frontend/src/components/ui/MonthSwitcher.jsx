import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { monthLabel, shiftMonth } from "../../util/format";

const MonthSwitcher = ({ value, onChange }) => (
  <div className="flex items-center justify-between px-4 py-2">
    <button
      type="button"
      aria-label="Poprzedni miesiąc"
      onClick={() => onChange(shiftMonth(value, -1))}
      className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700"
    >
      <FontAwesomeIcon icon={faChevronLeft} />
    </button>
    <span className="text-lg font-semibold capitalize">{monthLabel(value)}</span>
    <button
      type="button"
      aria-label="Następny miesiąc"
      onClick={() => onChange(shiftMonth(value, 1))}
      className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700"
    >
      <FontAwesomeIcon icon={faChevronRight} />
    </button>
  </div>
);

export default MonthSwitcher;
