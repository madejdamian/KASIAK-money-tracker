import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  ErrorText,
  PageHeader,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchCategoryTree } from "../../http/categories";
import { fetchMembers } from "../../http/members";
import { logout } from "../../http/auth";
import { flattenCategories } from "../../util/format";
import { useInstallPrompt } from "../../util/useInstallPrompt";
import MembersSection from "./MembersSection";
import CategoriesSection from "./CategoriesSection";

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { installed, canInstall, showIosHint, install } = useInstallPrompt();

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoryTree,
  });

  function handleLogout() {
    logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <PageHeader title="Ustawienia" />

      <div className="px-4 flex flex-col gap-4 mt-2">
        <ErrorText>{membersQuery.error ?? categoriesQuery.error}</ErrorText>

        <Card>
          <h2 className="font-semibold mb-2">Aplikacja na telefonie</h2>
          {installed && (
            <p className="text-neutral-400">Aplikacja jest zainstalowana na tym urządzeniu.</p>
          )}
          {canInstall && (
            <button type="button" onClick={install} className={primaryButtonClass}>
              Zainstaluj aplikację
            </button>
          )}
          {showIosHint && (
            <p className="text-neutral-300">
              Na iPhonie: dotknij przycisku Udostępnij w Safari i wybierz „Do ekranu początkowego”.
            </p>
          )}
          {!installed && !canInstall && !showIosHint && (
            <p className="text-neutral-400">
              Otwórz aplikację w przeglądarce telefonu (przez HTTPS) i wybierz „Zainstaluj
              aplikację” lub „Dodaj do ekranu głównego” w menu przeglądarki.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Automatyzacja</h2>
          <ul className="flex flex-col">
            {[
              ["/recurring", "Wydatki cykliczne", "czynsz, kredyt, abonamenty"],
              ["/templates", "Szablony", "szybkie dodawanie częstych zakupów"],
              ["/tags", "Tagi", "np. wakacje, remont"],
            ].map(([to, label, hint]) => (
              <li key={to} className="border-b border-neutral-800 last:border-b-0">
                <Link to={to} className="block py-3">
                  {label}
                  <span className="block text-sm text-neutral-500">{hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-semibold mb-3">Domownicy</h2>
          <MembersSection members={membersQuery.data ?? []} />
        </Card>

        <Card>
          <h2 className="font-semibold mb-3">Kategorie</h2>
          <CategoriesSection categories={flattenCategories(categoriesQuery.data ?? [])} />
        </Card>

        <button type="button" onClick={handleLogout} className={secondaryButtonClass}>
          Wyloguj
        </button>
      </div>
    </>
  );
};

export default Settings;
