import { useSearchParams } from "react-router-dom";

export const TABS = ["overview", "categories", "time", "items", "tags"];
export const COMPARISONS = ["prev", "yearago", "none"];

// Everything the analysis screen shows is kept in the address, so a refresh or the back button
// does not lose the period, the filters or the opened category.
export function useAnalysisParams() {
  const [params, setParams] = useSearchParams();

  const pick = (key, allowed, fallback) =>
    allowed.includes(params.get(key)) ? params.get(key) : fallback;

  const state = {
    p: params.get("p") ?? "month", // period: "month", "prev", "3m", "YYYY-MM", "custom" ...
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    cmp: pick("cmp", COMPARISONS, "prev"),
    member: params.get("member") ?? "",
    card: params.get("card") ?? "",
    tag: params.get("tag") ?? "",
    cat: params.get("cat") ?? "",
    tab: pick("tab", TABS, "overview"),
  };

  // empty values and defaults are left out of the address
  function set(patch) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  return [state, set];
}
