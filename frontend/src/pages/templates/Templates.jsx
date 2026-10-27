import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ErrorText, PageHeader, primaryButtonClass } from "../../components/ui/ui";
import { fetchTemplates } from "../../http/templates";
import { formatMoney } from "../../util/format";

const Templates = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  return (
    <>
      <PageHeader title="Szablony">
        <Link to="/templates/new" className={`${primaryButtonClass} flex items-center`}>
          + Dodaj
        </Link>
      </PageHeader>

      <div className="px-4 mt-2 lg:max-w-4xl">
        <p className="text-sm text-neutral-400 mb-3">
          Szablony pojawiają się na liście wydatków jako przyciski szybkiego dodawania.
        </p>
        {isPending && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {data && data.length === 0 && (
          <p className="text-neutral-500">
            Brak szablonów. Dodaj pierwszy tutaj albo zapisz wydatek jako szablon.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {(data ?? []).map((template) => (
            <li key={template.id}>
              <Link
                to={`/templates/${template.id}`}
                className="block bg-surface rounded-2xl p-4 active:bg-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold break-words min-w-0">{template.name}</span>
                  <span className="tabular-nums whitespace-nowrap">
                    {template.price == null ? "kwota przy użyciu" : formatMoney(template.price)}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  {template.categoryPath.join(" › ")} · {template.memberName}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Templates;
