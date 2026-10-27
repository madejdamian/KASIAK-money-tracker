import React from "react";
import { Card } from "../ui/ui";
import CategoryList from "./CategoryList";
import StackedBar from "./StackedBar";
import { EmptyState } from "./Changes";
import { compositionParts, groupRows } from "../../util/analytics";
import { REST_COLOR, colorFor } from "../../util/palette";
import { formatMoney } from "../../util/format";

// How much each tag (a project like "wakacje" or "remont") cost in the period. Tapping a tag
// filters the whole analysis to it and opens its breakdown by category.
const TagsTab = ({ set, current, baselineExpenses, tagCount }) => {
  if (current.length === 0) return <EmptyState />;

  if (tagCount === 0) {
    return (
      <EmptyState title="Nie ma jeszcze tagów">
        Dodaj tagi w ustawieniach i wybieraj je przy wydatkach, a tu zobaczysz, ile kosztował każdy projekt.
      </EmptyState>
    );
  }

  const rows = groupRows(current, baselineExpenses, "tag");
  const ids = rows.map((row) => row.id);
  const colorOf = (row) => (row.id === "none" ? REST_COLOR : colorFor(ids, row.id));
  const tagged = rows.filter((row) => row.id !== "none");
  const taggedTotal = tagged.reduce((sum, row) => sum + Math.round(row.total * 100), 0) / 100;

  return (
    <Card>
      <p className="mb-4 text-sm text-neutral-400">
        Wydatek z kilkoma tagami liczy się pod każdym z nich, więc suma tagów może być większa niż suma wszystkich wydatków.
        Dotknij tagu, żeby zobaczyć, z czego się składa.
      </p>
      <StackedBar parts={compositionParts(rows, colorOf, REST_COLOR)} label="Wydatki według tagów" />
      <p className="mt-2 text-sm text-neutral-400">Z tagiem: {formatMoney(taggedTotal)} (łącznie z powtórzeniami)</p>
      <div className="mt-2">
        <CategoryList
          rows={rows}
          colorOf={colorOf}
          onSelect={(row) => {
            if (row.id !== "none") set({ tag: String(row.id), tab: "categories", cat: "" });
          }}
        />
      </div>
    </Card>
  );
};

export default TagsTab;
