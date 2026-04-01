import {
  UserPlus,
  CheckCircle2,
  Activity as ActivityIcon,
} from "lucide-react";
import type { Activity } from "../../interfaces/interfaces";
import type { ClientRegistrationForm } from "../../types/clientForms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { ClientStepper } from "./ClientStepper";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addStep: 1 | 2;
  setAddStep: (step: 1 | 2) => void;
  formData: ClientRegistrationForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientRegistrationForm>>;
  activities: Activity[];
  onSubmit: (e: React.FormEvent) => void;
  formatNumberLocal: (n: number) => string;
  formTotalDue: number;
  formExpirationDate: string;
};

export function ClientAddModal({
  open,
  onOpenChange,
  addStep,
  setAddStep,
  formData,
  setFormData,
  activities,
  onSubmit,
  formatNumberLocal,
  formTotalDue,
  formExpirationDate,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#080b12]/95 backdrop-blur-3xl border-white/10 text-white rounded-[2rem] p-0 overflow-hidden"
        style={{ maxWidth: "1000px", width: "90vw" }}
      >
        <div className="p-8 space-y-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-cyan flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest">
                Nouveau Membre
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight uppercase">
              Inscription Membre
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-sm">
              Remplissez les informations pour créer un nouveau compte membre.
            </DialogDescription>
            <ClientStepper step={addStep} className="gap-3 pt-3" />
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-6">
            {addStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-white">
                    Identité du Membre
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label>Prénom</label>
                    <input
                      className="input-field h-10 text-sm px-3"
                      aria-label="Prenom membre"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label>Nom</label>
                    <input
                      className="input-field h-10 text-sm px-3"
                      aria-label="Nom membre"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label>Téléphone</label>
                  <input
                    className="input-field h-10 text-sm px-3"
                    aria-label="Telephone membre"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label>Email (Optionnel)</label>
                  <input
                    className="input-field h-10 text-sm px-3"
                    aria-label="Email membre"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {addStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                  <ActivityIcon className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-white">
                    Plan d'Abonnement
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex p-1.5 bg-white/5 rounded-2xl gap-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          subscription_mode: "pack",
                        })
                      }
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wide transition-all",
                        formData.subscription_mode === "pack"
                          ? "bg-primary text-white shadow-lg"
                          : "text-slate-500 hover:text-white",
                      )}
                    >
                      Full Pass
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          subscription_mode: "custom",
                        })
                      }
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wide transition-all",
                        formData.subscription_mode === "custom"
                          ? "bg-primary text-white shadow-lg"
                          : "text-slate-500 hover:text-white",
                      )}
                    >
                      Sur Mesure
                    </button>
                  </div>

                  {formData.subscription_mode === "custom" && (
                    <div className="grid grid-cols-2 gap-2 max-h-[145px] overflow-y-auto custom-scrollbar p-1">
                      {activities
                        .filter((a) => !a.name.toLowerCase().includes("pack"))
                        .map((a) => (
                          <label
                            key={a.id}
                            className={cn(
                              "p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all",
                              formData.selected_activity_ids.includes(a.id)
                                ? "bg-primary/20 border-primary text-white"
                                : "bg-white/5 border-white/5 text-slate-500",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-primary"
                              checked={formData.selected_activity_ids.includes(
                                a.id,
                              )}
                              onChange={(e) => {
                                const ids = e.target.checked
                                  ? [...formData.selected_activity_ids, a.id]
                                  : formData.selected_activity_ids.filter(
                                      (id) => id !== a.id,
                                    );
                                setFormData({
                                  ...formData,
                                  selected_activity_ids: ids,
                                });
                              }}
                            />
                            <span className="text-[10px] font-semibold uppercase tracking-wide">
                              {a.name}
                            </span>
                          </label>
                        ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label>Durée</label>
                      <select
                        className="input-field h-10 text-sm px-3 appearance-none bg-[#0a0f18]"
                        aria-label="Duree abonnement"
                        value={formData.duration_months}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration_months: e.target.value,
                          })
                        }
                      >
                        <option value="1">1 Mois</option>
                        <option value="3">3 Mois</option>
                        <option value="6">6 Mois</option>
                        <option value="12">12 Mois</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label>Paiement</label>
                      <select
                        className="input-field h-10 text-sm px-3 appearance-none bg-[#0a0f18]"
                        aria-label="Mode paiement"
                        value={formData.payment_method}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_method: e.target.value,
                          })
                        }
                      >
                        <option value="CASH">Espèces</option>
                        <option value="WAVE">Wave / OM</option>
                        <option value="CARD">Carte</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Promo / Réduction (%)
                        </label>
                        {formData.discount_percent > 0 ? (
                          <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                            -{formData.discount_percent}%
                          </span>
                        ) : null}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="input-field h-10 text-sm px-3 pr-8"
                          aria-label="Promo reduction"
                          value={formData.discount_percent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount_percent: Number(e.target.value || 0),
                            })
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={formData.only_registration_today}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              only_registration_today: e.target.checked,
                            })
                          }
                        />
                        <span>Payer seulement les frais d'inscription</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={formData.include_registration_fee}
                          disabled={
                            formData.only_registration_today ||
                            formData.waive_registration_fee
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              include_registration_fee: e.target.checked,
                            })
                          }
                        />
                        <span>
                          Inclure les frais d'inscription au paiement
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={formData.waive_registration_fee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              waive_registration_fee: e.target.checked,
                            })
                          }
                        />
                        <span>Offrir les frais d'inscription</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-primary/5 border border-primary/20 rounded-[1.4rem] p-5 flex flex-col md:flex-row justify-between items-center gap-5">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[4px] text-primary">
                  Total à Encaisser
                </p>
                <p className="text-4xl font-bold text-white tracking-tight">
                  {formatNumberLocal(formTotalDue)}{" "}
                  <span className="text-lg text-primary -ml-1">F</span>
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-[2px] mb-1">
                    Expiration prévue
                  </p>
                  <p className="text-base font-semibold text-white uppercase italic">
                    {formExpirationDate}
                  </p>
                </div>
                {addStep === 1 ? (
                  <Button
                    type="button"
                    onClick={() => setAddStep(2)}
                    className="h-11 px-8 rounded-xl bg-gradient-cyan text-white font-semibold text-sm uppercase tracking-wide shadow-[0_10px_30px_rgba(0,210,255,0.35)] hover:scale-105 transition-transform"
                  >
                    Suivant
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddStep(1)}
                      className="h-11 px-6 rounded-xl"
                    >
                      Précédent
                    </Button>
                    <Button
                      type="submit"
                      className="h-11 px-8 rounded-xl bg-gradient-cyan text-white font-semibold text-sm uppercase tracking-wide shadow-[0_10px_30px_rgba(0,210,255,0.35)] hover:scale-105 transition-transform"
                    >
                      Valider Inscription
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
