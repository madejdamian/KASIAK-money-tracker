import { useSearchParams } from "react-router-dom";
import { currentMonth, monthKey, parseMonth } from "./format";

// The selected month lives in the address (?month=2025-03), so it survives a refresh.
export function useMonthParam() {
  const [params, setParams] = useSearchParams();
  const month = parseMonth(params.get("month")) ?? currentMonth();

  function setMonth(next) {
    setParams({ month: monthKey(next) }, { replace: true });
  }

  return [month, setMonth];
}
