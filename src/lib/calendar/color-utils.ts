import { EventCategory, PTOStatus } from "./types";

export function getEventColor(category: EventCategory, ptoStatus?: PTOStatus) {
  if (category === "pto") {
    switch (ptoStatus) {
      case "pending":
        return {
          bg: "bg-gray-100",
          border: "border-gray-300",
          text: "text-gray-600",
          dot: "bg-gray-400",
          badge: "bg-gray-100 text-gray-700 ring-gray-300",
        };
      case "approved":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        };
      case "declined":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-600",
          dot: "bg-red-400",
          badge: "bg-red-50 text-red-600 ring-red-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-600",
          dot: "bg-gray-400",
          badge: "bg-gray-50 text-gray-600 ring-gray-200",
        };
    }
  }

  switch (category) {
    case "holiday":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case "milestone":
      return {
        bg: "bg-violet-50",
        border: "border-violet-200",
        text: "text-violet-700",
        dot: "bg-violet-500",
        badge: "bg-violet-50 text-violet-700 ring-violet-200",
      };
    case "data-update":
      return {
        bg: "bg-sky-50",
        border: "border-sky-200",
        text: "text-sky-700",
        dot: "bg-sky-500",
        badge: "bg-sky-50 text-sky-700 ring-sky-200",
      };
    case "firm-event":
      return {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700 ring-rose-200",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-600",
        dot: "bg-gray-400",
        badge: "bg-gray-50 text-gray-600 ring-gray-200",
      };
  }
}

export function getCategoryLabel(category: EventCategory): string {
  switch (category) {
    case "pto": return "PTO";
    case "holiday": return "Holiday";
    case "milestone": return "Milestone";
    case "data-update": return "Data Update";
    case "firm-event": return "Firm Event";
  }
}

export function getStatusLabel(status: PTOStatus): string {
  switch (status) {
    case "pending": return "Pending";
    case "approved": return "Approved";
    case "declined": return "Declined";
  }
}
