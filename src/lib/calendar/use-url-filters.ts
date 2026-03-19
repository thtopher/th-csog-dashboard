"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { EventCategory, FilterState, ViewMode } from "./types";

const VALID_CATEGORIES: EventCategory[] = ["pto", "holiday", "milestone", "data-update", "firm-event"];
const VALID_VIEWS: ViewMode[] = ["month", "week", "swimlane"];

export function useUrlFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: FilterState = useMemo(() => {
    const emp = searchParams.get("employees");
    const cat = searchParams.get("categories");
    return {
      employees: emp ? emp.split(",").filter(Boolean) : [],
      categories: cat
        ? (cat.split(",").filter((c) => VALID_CATEGORIES.includes(c as EventCategory)) as EventCategory[])
        : [],
    };
  }, [searchParams]);

  const view: ViewMode = useMemo(() => {
    const v = searchParams.get("view");
    return v && VALID_VIEWS.includes(v as ViewMode) ? (v as ViewMode) : "month";
  }, [searchParams]);

  const setFilters = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newFilters.employees.length > 0) {
        params.set("employees", newFilters.employees.join(","));
      } else {
        params.delete("employees");
      }

      if (newFilters.categories.length > 0) {
        params.set("categories", newFilters.categories.join(","));
      } else {
        params.delete("categories");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setView = useCallback(
    (newView: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newView === "month") {
        params.delete("view");
      } else {
        params.set("view", newView);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return { filters, setFilters, view, setView };
}
