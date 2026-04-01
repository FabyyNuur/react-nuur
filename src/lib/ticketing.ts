import type { TicketItem, TicketViewStatus } from "../types/ticketing";

export function formatTicketDateTimeFr(value?: string): string {
  return value
    ? new Date(value).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "N/A";
}

export function getTicketViewStatus(
  ticket: TicketItem,
  now: Date,
): TicketViewStatus {
  if (ticket.status === "USED") return "used";
  const validUntil = ticket.valid_until ? new Date(ticket.valid_until) : null;
  if (!validUntil || Number.isNaN(validUntil.getTime()) || validUntil < now) {
    return "expired";
  }
  return "active";
}
