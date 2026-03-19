"use client";

import { EventCategory, FilterState } from "@/lib/calendar/types";
import { getCategoryLabel, getEventColor } from "@/lib/calendar/color-utils";
import { EMPLOYEES } from "@/lib/calendar/employees";
import { cn } from "@/lib/utils/cn";
import { X, Filter } from "lucide-react";

const CATEGORIES: EventCategory[] = [
  "pto",
  "holiday",
  "milestone",
  "data-update",
  "firm-event",
];

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        "border",
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
      )}
    >
      {color && (
        <span className={cn("w-2 h-2 rounded-full", color)} />
      )}
      {label}
    </button>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const toggleEmployee = (name: string) => {
    const employees = filters.employees.includes(name)
      ? filters.employees.filter((e) => e !== name)
      : [...filters.employees, name];
    onChange({ ...filters, employees });
  };

  const toggleCategory = (cat: EventCategory) => {
    const categories = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories });
  };

  const clearAll = () => {
    onChange({ employees: [], categories: [] });
  };

  const hasFilters =
    filters.employees.length > 0 ||
    filters.categories.length > 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 z-50 transition-transform duration-300 ease-out shadow-xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-5 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-[11px] text-gray-400 hover:text-gray-600 font-medium"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Event Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const colors = getEventColor(cat, cat === "pto" ? "approved" : undefined);
                return (
                  <FilterChip
                    key={cat}
                    label={getCategoryLabel(cat)}
                    active={filters.categories.includes(cat)}
                    color={colors.dot}
                    onClick={() => toggleCategory(cat)}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Employee
            </h4>
            <div className="flex flex-col gap-1">
              {EMPLOYEES.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleEmployee(name)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium transition-all text-left",
                    filters.employees.includes(name)
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
