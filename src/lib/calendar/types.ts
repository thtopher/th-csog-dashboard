export type PTOStatus = "pending" | "approved" | "declined";

export type EventCategory =
  | "pto"
  | "holiday"
  | "milestone"
  | "data-update"
  | "firm-event";

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // ISO date string
  endDate: string;
  category: EventCategory;
  employee?: string;
  ptoStatus?: PTOStatus;
  isHalfDay?: boolean;
  halfDayPeriod?: "morning" | "afternoon";
  source: "bamboohr" | "manual";
  bamboohrUrl?: string;
}

export type ViewMode = "month" | "week" | "swimlane";

export interface FilterState {
  employees: string[];
  categories: EventCategory[];
}
