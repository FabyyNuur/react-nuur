export type AppUser = {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "CAISSIER" | "CONTROLEUR" | string;
  is_active?: boolean | number | string;
};

export type UserForm = {
  name: string;
  email: string;
  role: "ADMIN" | "CAISSIER" | "CONTROLEUR";
  password: string;
  is_active: boolean;
};

export const INITIAL_USER_FORM: UserForm = {
  name: "",
  email: "",
  role: "CONTROLEUR",
  password: "",
  is_active: true,
};
