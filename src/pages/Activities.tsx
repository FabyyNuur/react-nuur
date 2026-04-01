import { Plus, Edit2, Trash2, Info, Users, Search, Ban } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { isAxiosError } from "axios";
import type { Activity } from "../interfaces/interfaces";
import { isTicketSaleActivityActive } from "../types/ticketing";
import { useNavigate } from "react-router-dom";
import { useActivities } from "../hooks/useActivities";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";
import { SubscriptionModal } from "../components/modals/SubscriptionModal";

type DeactivateImpactRow = {
  subscription_id: number;
  client_id: number;
  first_name: string;
  last_name: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  estimated_refund_fcfa: number;
  note?: string | null;
};

type DeactivateImpactData = {
  affected_subscriptions: DeactivateImpactRow[];
  total_estimated_refund_fcfa: number;
  affected_count: number;
  disclaimer: string;
};

export default function Activities() {
  const {
    loading,
    activities,
    isAdmin,
    isCashierOrAdmin,
    isActivityModalOpen,
    setIsActivityModalOpen,
    editingActivityId,
    activityForm,
    setActivityForm,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    colorPresets,
    formatNumber,
    activityColor,
    selectedActivity,
    openActivityModal,
    handleEdit,
    handleActivitySubmit,
    handleDelete,
    openSubscriptionModal,
    fetchActivities,
    toggleActivityStatus,
  } = useActivities();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeactivateActivity, setPendingDeactivateActivity] =
    useState<Activity | null>(null);
  const [deactivateImpact, setDeactivateImpact] =
    useState<DeactivateImpactData | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState<string | null>(null);

  const isActivityCardActive = (a: Activity) => isTicketSaleActivityActive(a);

  const handleToggleStatusClick = (activity: Activity) => {
    if (!isActivityCardActive(activity)) {
      void toggleActivityStatus(activity);
      return;
    }
    setPendingDeactivateActivity(activity);
  };

  const confirmDeactivateActivity = async () => {
    const a = pendingDeactivateActivity;
    if (!a) return;
    setPendingDeactivateActivity(null);
    setDeactivateImpact(null);
    setImpactError(null);
    await toggleActivityStatus(a);
  };

  const closeDeactivateDialog = () => {
    setPendingDeactivateActivity(null);
    setDeactivateImpact(null);
    setImpactError(null);
  };

  useEffect(() => {
    if (!pendingDeactivateActivity) {
      setDeactivateImpact(null);
      setImpactError(null);
      return;
    }
    const id = pendingDeactivateActivity.id;
    setImpactLoading(true);
    setImpactError(null);
    setDeactivateImpact(null);
    void (async () => {
      try {
        const res = await api.get(`/activities/${id}/deactivate-impact`);
        setDeactivateImpact(res.data.data as DeactivateImpactData);
      } catch (e: unknown) {
        let msg = "Impossible de charger l'estimation des remboursements.";
        if (isAxiosError(e)) {
          const data = e.response?.data;
          if (data && typeof data === "object") {
            if ("message" in data && typeof data.message === "string")
              msg = data.message;
            else if ("error" in data && typeof data.error === "string")
              msg = data.error;
          } else if (
            e.code === "ERR_NETWORK" ||
            e.message === "Network Error"
          ) {
            msg =
              "Serveur injoignable. Vérifiez que l'API tourne (ex. port 4000) et l'URL dans api.ts.";
          }
        }
        setImpactError(msg);
      } finally {
        setImpactLoading(false);
      }
    })();
  }, [pendingDeactivateActivity]);

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activities;
    return activities.filter((activity) =>
      activity.name.toLowerCase().includes(query),
    );
  }, [activities, searchQuery]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Gestion des activités
          </h1>
          <p className="text-blue-200/65 text-sm mt-1">
            Gérer toutes les activités sportives et leurs tarifs.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openActivityModal}
            className="h-11 px-6 rounded-full bg-[#18c7ef] hover:bg-[#13b8de] text-[#071326] shadow-[0_0_24px_rgba(24,199,239,0.35)] font-semibold text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une activité
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/35 h-4 w-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une activité..."
          className="h-10 rounded-xl bg-[#203b79]/45 border-white/10 pl-10 text-sm text-white placeholder:text-blue-100/30 focus-visible:ring-primary/40"
          aria-label="Rechercher une activité"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredActivities.map((activity) => (
          <Card
            key={activity.id}
            className="group border border-white/10 bg-[#162f68]/36 backdrop-blur-xl hover:bg-[#1e3e85]/36 transition-all duration-300 overflow-hidden relative rounded-2xl"
          >
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-15 transition-opacity group-hover:opacity-30"
              style={{ backgroundColor: activityColor(activity) }}
            />

            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/20 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${activityColor(activity)}15`,
                    border: `1px solid ${activityColor(activity)}30`,
                  }}
                >
                  <Users
                    className="h-5 w-5"
                    style={{ color: activityColor(activity) }}
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-tight uppercase">
                    {activity.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {activity.subscription_only ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border-amber-500/20"
                      >
                        {isActivityCardActive(activity) ? "Active" : "Inactive"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      >
                        {isActivityCardActive(activity) ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => navigate(`/activities/${activity.id}`)}
                className="w-9 h-9 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10"
                title="Statistiques & Détails"
              >
                <Info className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 pt-2 relative z-10">
              <div className="grid grid-cols-2 gap-2.5 pb-3">
                <div className="bg-[#1a3472]/55 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-white/45 mb-1">Inscription</p>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    {formatNumber(activity.registration_fee)} FCFA
                  </p>
                </div>
                <div className="bg-[#1a3472]/55 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-white/45 mb-1">Ticket</p>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    {formatNumber(activity.daily_ticket_price)} FCFA
                  </p>
                </div>
                <div className="bg-[#1a3472]/55 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-white/45 mb-1">Mensuel</p>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    {formatNumber(activity.monthly_price)} FCFA
                  </p>
                </div>
                <div className="bg-[#1a3472]/55 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-white/45 mb-1">Trimestre</p>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    {formatNumber(activity.quarterly_price)} FCFA
                  </p>
                </div>
                <div className="bg-[#1a3472]/55 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-white/45 mb-1">Semestre</p>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    {formatNumber(activity.semester_price)} FCFA
                  </p>
                </div>
                <div className="bg-[#1a3472]/55 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-white/45 mb-1">Annuel</p>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    {formatNumber(activity.yearly_price)} FCFA
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/10" />
            </CardContent>

            <CardFooter className="pt-2 flex flex-col gap-3 relative z-10">
              {isCashierOrAdmin && (
                <Button
                  onClick={() => openSubscriptionModal(activity)}
                  className="w-full h-10 rounded-full bg-blue-700/45 hover:bg-blue-600/55 text-blue-100 font-semibold text-sm border border-blue-300/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Abonnement
                </Button>
              )}
              {isAdmin && (
                <div className="flex items-center gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => handleToggleStatusClick(activity)}
                    className={cn(
                      "h-10 rounded-xl text-xs font-semibold",
                      isActivityCardActive(activity)
                        ? "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
                    )}
                  >
                    {isActivityCardActive(activity) ? "Désactiver" : "Activer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(activity)}
                    className="flex-1 h-10 rounded-xl border-orange-400/30 bg-orange-500/10 text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 text-xs font-semibold"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(activity.id)}
                    className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all border border-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog
        open={pendingDeactivateActivity !== null}
        onOpenChange={(open) => {
          if (!open) closeDeactivateDialog();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f1f45]/95 backdrop-blur-2xl border-red-500/20 text-white rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(239,68,68,0.12)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-400/30">
            <Ban className="h-7 w-7 text-red-300" />
          </div>
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-semibold text-white">
              Désactiver cette activité ?
            </DialogTitle>
            <DialogDescription className="text-slate-300/80 text-sm leading-relaxed">
              <span className="font-semibold text-white">
                {pendingDeactivateActivity?.name}
              </span>{" "}
              ne pourra plus recevoir d’abonnements ni de vente de tickets
              journaliers tant que vous ne l’aurez pas réactivée.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-100/95">
            Si des membres ont un abonnement encore en cours sur cette activité,
            prévoyez un{" "}
            <strong className="text-amber-50">
              remboursement ou geste commercial
            </strong>{" "}
            conformément à votre politique interne.
          </div>

          {impactLoading && (
            <p className="text-center text-sm text-slate-400 py-4">
              Calcul des impacts sur les abonnements…
            </p>
          )}
          {impactError && (
            <p className="text-center text-sm text-red-300 py-2">
              {impactError}
            </p>
          )}
          {deactivateImpact && !impactLoading && (
            <div className="mt-4 space-y-3 text-left">
              <p className="text-sm text-white/90 font-semibold">
                {deactivateImpact.affected_count === 0
                  ? "Aucun abonnement actif avec période non expirée sur cette activité."
                  : `${deactivateImpact.affected_count} abonnement(s) concerné(s) — total estimé : ${formatNumber(deactivateImpact.total_estimated_refund_fcfa)} FCFA`}
              </p>
              {deactivateImpact.affected_subscriptions.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 bg-[#0a1530] text-slate-400">
                      <tr>
                        <th className="p-2 font-semibold">Membre</th>
                        <th className="p-2 font-semibold">Fin période</th>
                        <th className="p-2 font-semibold text-right">Payé</th>
                        <th className="p-2 font-semibold text-right">Estim.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deactivateImpact.affected_subscriptions.map((row) => (
                        <tr
                          key={row.subscription_id}
                          className="border-t border-white/5 text-slate-200"
                        >
                          <td className="p-2">
                            {row.first_name} {row.last_name}
                            {row.note === "montant_ligne_zero" && (
                              <span className="block text-[10px] text-slate-500">
                                Montant 0 sur cette ligne
                              </span>
                            )}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            {new Date(row.end_date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-2 text-right">
                            {formatNumber(row.amount_paid)} F
                          </td>
                          <td className="p-2 text-right text-amber-200/90">
                            {formatNumber(row.estimated_refund_fcfa)} F
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-[10px] leading-snug text-slate-500">
                {deactivateImpact.disclaimer}
              </p>
            </div>
          )}

          <DialogFooter className="mt-6 flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDeactivateDialog}
              className="h-10 rounded-xl px-6 text-white/70 hover:text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => void confirmDeactivateActivity()}
              className="h-10 rounded-xl px-6 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold border-0"
            >
              Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent
          className="bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
          style={{ maxWidth: "680px", width: "80vw" }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editingActivityId ? "Modifier l'activité" : "Nouvelle activité"}
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm mt-2">
              Configurez les tarifs et l'identité visuelle de ce service.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleActivitySubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                Nom de l'activité
              </label>
              <Input
                className="h-10 text-sm bg-white/5 border-white/10 focus:ring-primary focus:border-primary rounded-xl px-3"
                value={activityForm.name}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, name: e.target.value })
                }
                placeholder="Fitness & Cardio"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                  Frais inscription (F)
                </label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                  value={activityForm.registration_fee}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      registration_fee: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                  Ticket journalier (F)
                </label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3 disabled:opacity-30"
                  value={activityForm.daily_ticket_price}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      daily_ticket_price: Number(e.target.value),
                    })
                  }
                  disabled={activityForm.subscription_only}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                  Mensuel (F)
                </label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                  value={activityForm.monthly_price}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      monthly_price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                  Trimestriel (F)
                </label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                  value={activityForm.quarterly_price}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      quarterly_price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                  Semestriel (F)
                </label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                  value={activityForm.semester_price}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      semester_price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                  Annuel (F)
                </label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                  value={activityForm.yearly_price}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      yearly_price: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40">
                  Thème de l'activité
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={activityForm.color}
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          color: e.target.value,
                        })
                      }
                      className="w-11 h-11 rounded-xl bg-white/10 p-1 cursor-pointer border-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Choisir la couleur ${color}`}
                        title={`Couleur ${color}`}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                          activityForm.color === color
                            ? "border-primary"
                            : "border-transparent",
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setActivityForm({ ...activityForm, color })
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <Checkbox
                  id="sub-only"
                  checked={activityForm.subscription_only}
                  onCheckedChange={(checked) =>
                    setActivityForm({
                      ...activityForm,
                      subscription_only: checked === true,
                    })
                  }
                />
                <label
                  htmlFor="sub-only"
                  className="text-xs font-semibold text-white/60 group-hover:text-white cursor-pointer select-none"
                >
                  Réservé aux abonnés uniquement (Désactiver les tickets
                  journaliers)
                </label>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <Checkbox
                  id="is-active"
                  checked={activityForm.is_active}
                  onCheckedChange={(checked) =>
                    setActivityForm({
                      ...activityForm,
                      is_active: checked === true,
                    })
                  }
                />
                <label
                  htmlFor="is-active"
                  className="text-xs font-semibold text-white/60 group-hover:text-white cursor-pointer select-none"
                >
                  Activité active
                </label>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsActivityModalOpen(false)}
                className="px-5 rounded-xl h-10 text-white/60 hover:text-white text-sm"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl h-10 bg-gradient-to-br from-primary to-accent font-semibold text-sm uppercase tracking-wide shadow-lg shadow-primary/20"
              >
                {editingActivityId ? "Mettre à jour" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SubscriptionModal
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
        activity={selectedActivity}
        onSuccess={fetchActivities}
      />
    </div>
  );
}
