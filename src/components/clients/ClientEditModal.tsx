import type { Activity } from "../../interfaces/interfaces";
import type { ClientRegistrationForm } from "../../types/clientForms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { ClientStepper } from "./ClientStepper";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editStep: 1 | 2;
  setEditStep: (step: 1 | 2) => void;
  editForm: ClientRegistrationForm;
  setEditForm: React.Dispatch<React.SetStateAction<ClientRegistrationForm>>;
  activities: Activity[];
  originalActivityIds: number[];
  onSubmit: (e: React.FormEvent) => void;
  formatNumberLocal: (n: number) => string;
  editTotalDue: number;
  saving: boolean;
  saveError: string;
  saveSuccess: boolean;
  onCancel: () => void;
};

export function ClientEditModal({
  open,
  onOpenChange,
  editStep,
  setEditStep,
  editForm,
  setEditForm,
  activities,
  originalActivityIds,
  onSubmit,
  formatNumberLocal,
  editTotalDue,
  saving,
  saveError,
  saveSuccess,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Modifier le membre
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Mets a jour les informations du membre et son abonnement.
          </DialogDescription>
          <ClientStepper step={editStep} />
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {editStep === 1 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-3.5">
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                Informations membre
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Prenom</label>
                  <input
                    className="input-field h-10 text-sm px-3"
                    aria-label="Prenom membre"
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, first_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label>Nom</label>
                  <input
                    className="input-field h-10 text-sm px-3"
                    aria-label="Nom membre"
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label>Telephone</label>
                  <input
                    className="input-field h-10 text-sm px-3"
                    aria-label="Telephone membre"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label>Email</label>
                  <input
                    className="input-field h-10 text-sm px-3"
                    aria-label="Email membre"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {editStep === 2 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-3.5">
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                Activites et abonnement
              </p>
              <div className="space-y-3">
                <label>Type d'abonnement</label>
                <div className="flex p-1.5 bg-white/5 rounded-2xl gap-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        subscription_mode: "pack",
                        selected_activity_ids: [],
                      })
                    }
                    className={cn(
                      "flex-1 py-2 rounded-xl text-[10px] font-semibold transition-all",
                      editForm.subscription_mode === "pack"
                        ? "bg-primary text-white"
                        : "text-slate-300 hover:text-white",
                    )}
                  >
                    Full Pass
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        subscription_mode: "custom",
                      })
                    }
                    className={cn(
                      "flex-1 py-2 rounded-xl text-[10px] font-semibold transition-all",
                      editForm.subscription_mode === "custom"
                        ? "bg-primary text-white"
                        : "text-slate-300 hover:text-white",
                    )}
                  >
                    Par activité(s)
                  </button>
                </div>
              </div>

              {editForm.subscription_mode === "custom" && (
                <div className="space-y-3">
                  <label>Ajouter des activités</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {activities
                      .filter((a) => !a.name.toLowerCase().includes("pack"))
                      .map((a) => {
                        const alreadySubscribed =
                          originalActivityIds.includes(a.id);
                        const checked =
                          editForm.selected_activity_ids.includes(a.id);
                        return (
                          <label
                            key={a.id}
                            className={cn(
                              "p-2.5 rounded-lg border flex items-center gap-2.5 transition-all",
                              alreadySubscribed
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 cursor-not-allowed"
                                : checked
                                  ? "bg-primary/20 border-primary text-white cursor-pointer"
                                  : "bg-white/5 border-white/10 text-slate-300 cursor-pointer",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-primary"
                              checked={checked}
                              disabled={alreadySubscribed}
                              onChange={(e) => {
                                const ids = e.target.checked
                                  ? [...editForm.selected_activity_ids, a.id]
                                  : editForm.selected_activity_ids.filter(
                                      (id) => id !== a.id,
                                    );
                                setEditForm({
                                  ...editForm,
                                  selected_activity_ids: ids,
                                });
                              }}
                            />
                            <span className="text-[11px] font-semibold">
                              {a.name}
                            </span>
                            {alreadySubscribed && (
                              <span className="ml-auto text-[10px]">
                                deja actif
                              </span>
                            )}
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Duree</label>
                  <select
                    aria-label="Duree abonnement"
                    className="input-field h-10 text-sm px-3"
                    value={editForm.duration_months}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                <div className="space-y-2">
                  <label>Paiement</label>
                  <select
                    aria-label="Mode paiement"
                    className="input-field h-10 text-sm px-3"
                    value={editForm.payment_method}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="CASH">Especes</option>
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
                    {editForm.discount_percent > 0 ? (
                      <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        -{editForm.discount_percent}%
                      </span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="input-field h-10 text-sm px-3 pr-8"
                      aria-label="Promo reduction edition"
                      value={editForm.discount_percent}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
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
                      checked={editForm.only_registration_today}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
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
                      checked={editForm.include_registration_fee}
                      disabled={
                        editForm.only_registration_today ||
                        editForm.waive_registration_fee
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          include_registration_fee: e.target.checked,
                        })
                      }
                    />
                    <span>Inclure les frais d'inscription au paiement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={editForm.waive_registration_fee}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          waive_registration_fee: e.target.checked,
                        })
                      }
                    />
                    <span>Offrir les frais d'inscription</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-300">
            Total a encaisser:{" "}
            <span className="font-bold text-white">
              {formatNumberLocal(editTotalDue)} CFA
            </span>
          </p>
          {saveError ? (
            <p className="text-xs text-red-300">{saveError}</p>
          ) : null}
          {saveSuccess ? (
            <p className="text-xs text-emerald-300">
              Modification enregistree.
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            {editStep === 1 ? (
              <Button
                type="button"
                className="btn-primary"
                onClick={() => setEditStep(2)}
              >
                Suivant
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditStep(1)}
                >
                  Precedent
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
