import type { LucideIcon } from "lucide-react";

export type ModuleProps = { title: string, description: string, icon: LucideIcon};

export interface Activity {
  id: number;
  name: string;
  registration_fee: number;
  daily_ticket_price: number;
  monthly_price: number;
  quarterly_price: number;
  semester_price: number;
  yearly_price: number;
  subscription_only: boolean;
  is_active?: boolean | number;
  color?: string | null;
}

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  activity_name?: string;
  activity_ids?: string; // from backend (comma-separated string)
  activity_details?: string; // Format: "Name1|Date1,Name2|Date2"
  client_code?: string;
  qr_code?: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  client_id: number;
  activity_id: number;
  start_date: string;
  end_date: string;
  status: string;
  amount_paid: number;
  payment_method: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  qr_code: string;
  activity_id: number;
  activity_name?: string;
  price: number;
  status: string;
  valid_until: string;
  created_at: string;
}