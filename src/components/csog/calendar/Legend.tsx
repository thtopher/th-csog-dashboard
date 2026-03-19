"use client";

import { getEventColor } from "@/lib/calendar/color-utils";
import { EventCategory, PTOStatus } from "@/lib/calendar/types";
import { cn } from "@/lib/utils/cn";

const ITEMS: { category: EventCategory; ptoStatus?: PTOStatus; label: string }[] = [
  { category: "pto", ptoStatus: "approved", label: "PTO (Approved)" },
  { category: "pto", ptoStatus: "pending", label: "PTO (Pending)" },
  { category: "pto", ptoStatus: "declined", label: "PTO (Declined)" },
  { category: "holiday", label: "Holiday" },
  { category: "milestone", label: "Milestone" },
  { category: "data-update", label: "Data Update" },
  { category: "firm-event", label: "Firm Event" },
];

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {ITEMS.map((item) => {
        const colors = getEventColor(item.category, item.ptoStatus);
        return (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                colors.dot,
                item.ptoStatus === "declined" && "opacity-50"
              )}
            />
            <span className="text-[11px] text-gray-500 font-medium">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
