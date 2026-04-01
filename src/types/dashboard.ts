export type DashboardLog = {
  scanned_at?: string;
};

export type DashboardApiResponse = {
  stats?: {
    periodIncome?: number;
    periodExpense?: number;
    ticketsSold?: number;
    newMembers?: number;
  };
  chart?: {
    labels?: string[];
    revenues?: number[];
    values?: number[];
    expenses?: number[];
  };
  recentLogs?: DashboardLog[];
};

export const DASHBOARD_PERIOD_OPTIONS = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
  { id: "all", label: "Tout" },
] as const;

export type DashboardPeriodId = (typeof DASHBOARD_PERIOD_OPTIONS)[number]["id"];
