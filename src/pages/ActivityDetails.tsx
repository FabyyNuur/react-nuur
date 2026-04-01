import {
  ArrowLeft,
  Users,
  UserCheck,
  Ticket,
  Download,
  Info,
  Search,
  X,
} from "lucide-react";
import { useActivityDetails } from "../hooks/useActivityDetails";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { SubscriptionModal } from "../components/modals/SubscriptionModal";
import { isTicketSaleActivityActive } from "../types/ticketing";

export default function ActivityDetails() {
  const {
    loading,
    activity,
    subscriptions,
    tickets,
    metrics,
    isCashierOrAdmin,
    formatNumber,
    formatDate,
    formatDateTime,
    isSubActive,
    isTicketValid,
    goBack,
    fetchDetails,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    searchQuery,
    setSearchQuery,
  } = useActivityDetails();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[340px]">
        <div className="text-sm text-slate-300/70 animate-pulse font-semibold">
          Chargement des détails...
        </div>
      </div>
    );
  if (!activity)
    return (
      <div className="text-center py-20 text-red-300 font-semibold">
        Activité introuvable.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            aria-label="Retour"
            title="Retour"
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-300 group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-semibold text-white tracking-tight">
              {activity.name}
            </h1>
            <p className="text-slate-300/75 mt-1 text-sm">
              Stats, expirations et accès récents.
            </p>
          </div>
        </div>
        {isCashierOrAdmin &&
          (isTicketSaleActivityActive(activity) ? (
            <button
              type="button"
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="h-11 px-6 rounded-full bg-[#18c7ef] hover:bg-[#13b8de] text-[#071326] shadow-[0_0_24px_rgba(24,199,239,0.35)] font-semibold text-sm transition-all"
            >
              Nouvel abonnement
            </button>
          ) : (
            <p className="text-xs text-amber-300/90 max-w-xs text-right">
              Abonnements indisponibles : cette activité est désactivée.
            </p>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 border-white/15 bg-white/[0.03] rounded-2xl">
          <div className="flex justify-between items-center mb-2 text-slate-300/55">
            <span className="text-[10px] font-semibold uppercase tracking-[1px]">
              Membres Inscrits
            </span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-3xl font-semibold text-white tracking-tight">
            {metrics.subscribers_count}
          </p>
        </div>
        <div className="glass-card p-4 border-white/15 bg-white/[0.03] rounded-2xl">
          <div className="flex justify-between items-center mb-2 text-emerald-400/60">
            <span className="text-[10px] font-semibold uppercase tracking-[1px]">
              Abonnés Actifs
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-semibold text-emerald-400 tracking-tight">
            {metrics.active_subscribers_count}
          </p>
        </div>
        <div className="glass-card p-4 border-white/15 bg-white/[0.03] rounded-2xl">
          <div className="flex justify-between items-center mb-2 text-cyan-300/60">
            <span className="text-[10px] font-semibold uppercase tracking-[1px]">
              Tickets de Jour
            </span>
            <Ticket className="w-4 h-4 text-cyan-300" />
          </div>
          <p className="text-3xl font-semibold text-cyan-300 tracking-tight">
            {metrics.tickets_count}
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="glass-card p-4 border-white/15 bg-white/[0.03] rounded-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un membre par nom, email ou téléphone..."
            className="pl-10 pr-10 h-10 bg-[#203b79]/45 border-white/10 rounded-xl text-sm focus:ring-primary/40 placeholder:text-slate-300/35"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300/45 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <Badge className="bg-primary/15 text-primary border-primary/30 h-9 px-3 rounded-lg shrink-0">
            {subscriptions.length} abonnés trouvés
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Subscriptions List */}
        <div className="glass-card overflow-hidden border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h2 className="text-base font-semibold text-white uppercase tracking-wide">
              Liste des abonnés
            </h2>
            <button className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1.5">
              <Download className="w-3 h-3" /> Exporter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-slate-300/55 text-[10px] uppercase font-semibold tracking-wide">
                  <th className="px-4 py-3">Membre</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Dernier Accès</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.subscription_id}
                    className="hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-white">
                        {sub.first_name} {sub.last_name}
                      </p>
                      <p className="text-[10px] text-slate-300/45 uppercase font-semibold">
                        {sub.phone || sub.email || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-300/90">
                      {formatDate(sub.end_date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${isSubActive(sub) ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"}`}
                      >
                        {isSubActive(sub) ? "Actif" : "Expiré"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-300/50 uppercase tracking-tight">
                      {formatDateTime(sub.last_access_at)}
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-slate-300/55 italic text-sm"
                    >
                      {searchQuery 
                        ? `Aucun résultat pour "${searchQuery}"`
                        : "Aucun abonné pour le moment."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tickets List */}
        <div className="glass-card overflow-hidden border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h2 className="text-base font-semibold text-white uppercase tracking-wide">
              Derniers tickets journaliers
            </h2>
            <Info className="w-4 h-4 text-slate-300/45" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-slate-300/55 text-[10px] uppercase font-semibold tracking-wide">
                  <th className="px-4 py-3">N° Ticket</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Dernier Accès</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((t) => (
                  <tr
                    key={t.ticket_id}
                    className="hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-white">#{t.ticket_id}</p>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-primary">
                      {formatNumber(t.price)} F
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${t.status === "USED" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/25" : isTicketValid(t) ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"}`}
                      >
                        {t.status === "USED"
                          ? "Utilisé"
                          : isTicketValid(t)
                            ? "Valide"
                            : "Expiré"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-300/50 uppercase tracking-tight">
                      {formatDateTime(t.last_access_at)}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-slate-300/55 italic text-sm"
                    >
                      {searchQuery 
                        ? `Aucun ticket correspondant à "${searchQuery}"`
                        : "Aucun ticket généré."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SubscriptionModal
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
        activity={activity}
        onSuccess={fetchDetails}
      />
    </div>
  );
}
