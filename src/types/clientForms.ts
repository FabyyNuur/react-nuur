export type ClientRegistrationForm = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  subscription_mode: "pack" | "custom";
  selected_activity_ids: number[];
  duration_months: string;
  payment_method: string;
  discount_percent: number;
  only_registration_today: boolean;
  include_registration_fee: boolean;
  waive_registration_fee: boolean;
};

export const EMPTY_CLIENT_FORM: ClientRegistrationForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  address: "",
  subscription_mode: "pack",
  selected_activity_ids: [],
  duration_months: "1",
  payment_method: "CASH",
  discount_percent: 0,
  only_registration_today: false,
  include_registration_fee: true,
  waive_registration_fee: false,
};
