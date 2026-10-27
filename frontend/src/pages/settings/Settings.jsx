import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  ErrorText,
  PageHeader,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchCategoryTree } from "../../http/categories";
import { fetchMembers } from "../../http/members";
import { logout } from "../../http/auth";
import { flattenCategories } from "../../util/format";
import MembersSection from "./MembersSection";
import CategoriesSection from "./CategoriesSection";

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
