import {
  Dialog,
  DialogContent,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Check, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Activity } from "../../interfaces/interfaces";
import { useSubscriptionForm } from "../../hooks/useSubscriptionForm";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onSuccess?: () => void;
}

export function SubscriptionModal({
  open,
  onOpenChange,
  activity,
  onSuccess,
}: SubscriptionModalProps) {
  const {
    subscriptionForm,
    setSubscriptionForm,
    clients,
    submitting,
    selectedClient,
    subscriptionTypeOptions,
    selectedSubscriptionPrice,
    registrationFeeDue,
    totalDue,
    handleSubmit,
  } = useSubscriptionForm(activity, () => {
    if (onSuccess) onSuccess();
    onOpenChange(false);
  });

  const formatNumber = (num: number) => num.toLocaleString("fr-FR");

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl p-0 overflow-y-auto shadow-2xl max-h-[90vh] custom-scrollbar"
        style={{ maxWidth: "1120px", width: "92vw" }}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <Badge className="bg-emerald-500 text-white text-[8px] px-2 py-0 font-bold">
            INSCRIPTION DIRECTE ✓
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full min-h-[520px]">
          {/* Left Info Panel */}
          <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-accent/5 p-6 flex flex-col justify-between border-r border-white/5">
            <div>
              <Badge className="bg-primary text-white font-semibold px-3 py-1 rounded-full uppercase tracking-[1px] text-[10px] mb-5">
                Nouvel Abonnement
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-white leading-tight">
                Inscription à l'activité
              </h2>
              <p className="text-lg font-semibold mt-2 text-primary tracking-tight">
                {activity.name}
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-white/40">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-semibold">
                    QR code généré instantanément
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-semibold">
                    Accès via badge ou scan mobile
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/5 mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 mb-3">
                Résumé de l'Encaissement
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-semibold uppercase tracking-wide text-[10px]">
                    Abonnement
                  </span>
                  <span className="font-semibold text-white">
                    {formatNumber(
                      subscriptionForm.only_registration_today
                        ? 0
                        : selectedSubscriptionPrice
                    )}{" "}
                    F
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pb-4 border-b border-white/10">
                  <span className="text-white/40 font-semibold uppercase tracking-wide text-[10px]">
                    Frais Inscription
                  </span>
                  <span className="font-semibold text-white">
                    {formatNumber(registrationFeeDue)} F
                  </span>
                </div>
                {subscriptionForm.discount_percent > 0 && (
                   <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-400 font-semibold uppercase tracking-wide text-[10px]">
                      Réduction ({subscriptionForm.discount_percent}%)
                    </span>
                    <span className="font-semibold text-emerald-400">
                      -{formatNumber(
                        (subscriptionForm.only_registration_today ? registrationFeeDue : (selectedSubscriptionPrice + (subscriptionForm.include_registration_fee && !subscriptionForm.waive_registration_fee ? registrationFeeDue : 0))) - totalDue
                      )} F
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Total Net
                  </span>
                  <span className="text-3xl font-semibold text-white tracking-tight leading-none">
                    {formatNumber(totalDue)}
                    <span className="text-base ml-1 text-primary">F</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-3 p-6 bg-transparent overflow-y-auto max-h-[85vh] custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mode Selector */}
              <div className="p-1 bg-white/5 rounded-xl flex gap-1 border border-white/5">
                <button
                  type="button"
                  onClick={() =>
                    setSubscriptionForm({
                      ...subscriptionForm,
                      clientMode: "existing",
                    })
                  }
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                    subscriptionForm.clientMode === "existing"
                      ? "bg-primary text-white shadow-xl"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  Client Existant
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSubscriptionForm({
                      ...subscriptionForm,
                      clientMode: "new",
                    })
                  }
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                    subscriptionForm.clientMode === "new"
                      ? "bg-primary text-white shadow-xl"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  Nouveau Client
                </button>
              </div>

              {subscriptionForm.clientMode === "existing" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                      Rechercher un membre
                    </label>
                    <select
                      className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white appearance-none"
                      value={subscriptionForm.client_id}
                      onChange={(e) =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          client_id: Number(e.target.value),
                        })
                      }
                      required
                    >
                      <option value={0}>Liste des membres...</option>
                      {clients.map((client) => (
                        <option
                          key={client.id}
                          value={client.id}
                          className="bg-slate-900"
                        >
                          {client.first_name} {client.last_name}{" "}
                          {client.phone ? `(${client.phone})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedClient?.subscription_status === "ACTIVE" && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3 animate-pulse">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                      <p className="text-[11px] text-amber-500 font-semibold leading-relaxed">
                        Attention: Ce membre possède déjà un abonnement actif.
                        Cette opération prolongera sa validité.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                      Prénom
                    </label>
                    <input
                      className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white"
                      value={subscriptionForm.first_name}
                      onChange={(e) =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          first_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                      Nom
                    </label>
                    <input
                      className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white"
                      value={subscriptionForm.last_name}
                      onChange={(e) =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          last_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                      Téléphone
                    </label>
                    <input
                      className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white"
                      value={subscriptionForm.phone}
                      onChange={(e) =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                      Email
                    </label>
                    <input
                      className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white"
                      value={subscriptionForm.email}
                      onChange={(e) =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Common Subscription Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                    Type d'abonnement
                  </label>
                  <select
                    className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white appearance-none"
                    value={subscriptionForm.subscription_type}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        subscription_type: e.target.value,
                      })
                    }
                  >
                    {subscriptionTypeOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-slate-900"
                      >
                        {opt.label} - {formatNumber(opt.price)} F
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                    Méthode de paiement
                  </label>
                  <select
                    className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white appearance-none"
                    value={subscriptionForm.payment_method}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="CASH" className="bg-slate-900">
                      Espèces
                    </option>
                    <option value="ORANGE_MONEY" className="bg-slate-900">
                      Orange Money
                    </option>
                    <option value="WAVE" className="bg-slate-900">
                      Wave
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-primary ml-1">
                    Code Promo / Réduction (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full h-10 text-sm bg-primary/5 border border-primary/20 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-semibold transition-all text-primary placeholder:text-primary/20"
                    value={subscriptionForm.discount_percent}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        discount_percent: Math.min(
                          100,
                          Math.max(0, parseInt(e.target.value) || 0)
                        ),
                      })
                    }
                    placeholder="Saisir % (Ex: 10)"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSubscriptionForm({
                      ...subscriptionForm,
                      waive_registration_fee:
                        !subscriptionForm.waive_registration_fee,
                    })
                  }
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    subscriptionForm.waive_registration_fee
                      ? "bg-primary/20 border-primary text-white"
                      : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center border",
                      subscriptionForm.waive_registration_fee
                        ? "bg-primary border-primary"
                        : "border-white/20"
                    )}
                  >
                    {subscriptionForm.waive_registration_fee && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-left leading-none">
                    Offrir les frais d'inscription
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSubscriptionForm({
                      ...subscriptionForm,
                      only_registration_today:
                        !subscriptionForm.only_registration_today,
                    })
                  }
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    subscriptionForm.only_registration_today
                      ? "bg-indigo-500/20 border-indigo-500 text-white"
                      : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center border",
                      subscriptionForm.only_registration_today
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-white/20"
                    )}
                  >
                    {subscriptionForm.only_registration_today && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-left leading-none">
                    Payer uniquement l'inscription aujourd'hui
                  </span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-primary text-white font-semibold text-xs uppercase tracking-[2px] shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Confirmer l'Encaissement
                      <Check className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
