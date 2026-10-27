import { useQuery } from "@tanstack/react-query";
import { fetchCategoryTree } from "../http/categories";
import { fetchMembers } from "../http/members";

// Categories and household members, needed by every form that picks them.
export function useReferenceData() {
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategoryTree });
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });

  return {
    categoryTree: categoriesQuery.data,
    members: membersQuery.data,
    ready: !!categoriesQuery.data && !!membersQuery.data,
    error: categoriesQuery.error ?? membersQuery.error,
  };
}
