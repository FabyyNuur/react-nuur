export type TicketFilter = "all" | "active" | "expired" | "used";

export type TicketActivity = {
  id: number;
  name: string;
  daily_ticket_price: number;
  subscription_only?: boolean;
  /** Présente côté API ; billetterie = activités actives uniquement */
  is_active?: boolean | number | string;
};

/** Activité éligible à la vente de tickets journaliers */
export function isTicketSaleActivityActive(
  a: Pick<TicketActivity, "is_active">,
): boolean {
  const v = a.is_active;
  if (v === undefined || v === null) return true;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t === "1" || t === "true";
  }
  return false;
}

export type TicketItem = {
  id: number;
  qr_code: string;
  activity_name: string;
  status: string;
  price: number;
  created_at: string;
  valid_until?: string;
  payment_method?: string;
};

export type GeneratedTicket = {
  id?: number;
  activity_id?: number;
  qr_code: string;
  price: number;
  valid_until: string;
  activity_name: string;
  validity_option?: string;
};

export type TicketViewStatus = "active" | "expired" | "used";

export type TicketWithViewStatus = TicketItem & { viewStatus: TicketViewStatus };

export type TicketGenerateForm = {
  activity_id: string;
  quantity: number;
  payment_method: string;
  validity_option: string;
};

export const DEFAULT_TICKET_GENERATE_FORM: TicketGenerateForm = {
  activity_id: "",
  quantity: 1,
  payment_method: "CASH",
  validity_option: "end_of_day",
};
