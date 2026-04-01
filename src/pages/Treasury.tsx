import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Calendar,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTreasury } from "../hooks/useTreasury";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";

export default function Treasury() {
  const {
    loading,
    isModalOpen,
    setIsModalOpen,
    filterPeriod,
    setFilterPeriod,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    saving,
    formData,
    setFormData,
    filteredTransactions,
    paginatedTransactions,
    page,
    setPage,
    stats,
    openModal,
    handleSubmit,
    exportData,
    formatNumber,
  } = useTreasury();

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Module de Trésorerie
          </h1>
          <p className="text-blue-200/65 text-sm mt-1">
            Suivi des flux financiers et gestion de la caisse centrale.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={exportData}
            variant="outline"
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl border-white/10 bg-white/5 text-white/70 hover:text-white font-semibold uppercase tracking-wide text-[10px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button
            onClick={openModal}
            className="flex-1 sm:flex-none h-10 px-5 rounded-full bg-[#18c7ef] hover:bg-[#13b8de] text-[#071326] shadow-[0_0_24px_rgba(24,199,239,0.35)] font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Transaction
          </Button>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="glass-card border-white/15 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <CardHeader className="p-3 pb-1.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg mb-2 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              Solde Global
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold text-white tracking-tight leading-none">
              {formatNumber(stats.cashBalance)}
              <span className="text-sm ml-1 text-primary">F</span>
            </p>
            <Badge
              variant="outline"
              className="mt-2 bg-primary/10 border-primary/20 text-primary text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5"
            >
              Disponibles
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 bg-white/3 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-all">
          <CardHeader className="p-3 pb-1.5">
            <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-2 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <TrendingUp className="w-4 h-4" />
            </div>
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Total Recettes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold text-emerald-400 tracking-tight leading-none">
              +{formatNumber(stats.totalIncome)}
              <span className="text-sm ml-1">F</span>
            </p>
            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mt-2">
              Période sélectionnée
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 bg-white/3 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-all">
          <CardHeader className="p-3 pb-1.5">
            <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 mb-2 group-hover:bg-red-500 group-hover:text-white transition-all">
              <TrendingDown className="w-4 h-4" />
            </div>
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Total Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-semibold text-red-400 tracking-tight leading-none">
              -{formatNumber(stats.totalExpense)}
              <span className="text-sm ml-1">F</span>
            </p>
            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mt-2">
              Période sélectionnée
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 bg-white/3 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-all">
          <CardHeader className="p-3 pb-1.5">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-all group-hover:scale-105",
                stats.net >= 0
                  ? "bg-indigo-500/10 text-indigo-500"
                  : "bg-orange-500/10 text-orange-500",
              )}
            >
              <DollarSign className="w-4 h-4" />
            </div>
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Résultat Net
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight leading-none",
                stats.net >= 0 ? "text-indigo-400" : "text-orange-400",
              )}
            >
              {stats.net >= 0 ? "+" : ""}
              {formatNumber(stats.net)}
              <span className="text-sm ml-1 text-white/40">F</span>
            </p>
            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mt-2">
              Calculé pour :{" "}
              {filterPeriod === "today"
                ? "Aujourd'hui"
                : filterPeriod === "week"
                  ? "Cette Semaine"
                  : filterPeriod === "month"
                    ? "Ce Mois"
                    : "Tout l'historique"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card className="glass-card border-white/15 rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/1">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher une transaction..."
              className="h-10 pl-10 text-sm bg-[#203b79]/45 border-white/10 rounded-xl focus:ring-primary/40 focus:border-primary/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setFilterPeriod("today")}
                className={cn(
                  "px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                  filterPeriod === "today"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/30 hover:text-white",
                )}
              >
                Jour
              </button>
              <button
                onClick={() => setFilterPeriod("week")}
                className={cn(
                  "px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                  filterPeriod === "week"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/30 hover:text-white",
                )}
              >
                Semaine
              </button>
              <button
                onClick={() => setFilterPeriod("month")}
                className={cn(
                  "px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                  filterPeriod === "month"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/30 hover:text-white",
                )}
              >
                Mois
              </button>
              <button
                onClick={() => setFilterPeriod("all")}
                className={cn(
                  "px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                  filterPeriod === "all"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/30 hover:text-white",
                )}
              >
                Tout
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setFilterType("all")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  filterType === "all"
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                    : "text-white/20 hover:text-white",
                )}
                title="Filtrer type"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilterType("INCOME")}
                className={cn(
                  "px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                  filterType === "INCOME"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-emerald-500/40 hover:text-emerald-500",
                )}
              >
                Entrées
              </button>
              <button
                onClick={() => setFilterType("EXPENSE")}
                className={cn(
                  "px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all",
                  filterType === "EXPENSE"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "text-red-500/40 hover:text-red-500",
                )}
              >
                Dépenses
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[10px] font-semibold uppercase tracking-wide">
                Synchronisation Bancaire...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/1 rounded-2xl border border-dashed border-white/10">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/15">
                <DollarSign className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-semibold tracking-tight">
                  Historique Vide
                </p>
                <p className="text-white/20 text-sm font-medium mt-1">
                  Aucune transaction ne correspond à vos filtres.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedTransactions.items.map((t) => (
                <div
                  key={t.id}
                  className="group p-4 rounded-2xl bg-white/2 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-default"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
                        t.type === "INCOME"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500",
                      )}
                    >
                      {t.type === "INCOME" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white tracking-tight group-hover:text-primary transition-colors">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-white/20" />
                          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">
                            {new Date(t.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <Badge
                          className={cn(
                            "text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-lg border-none",
                            t.payment_method?.toUpperCase() === "CASH"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-indigo-500/10 text-indigo-400",
                          )}
                        >
                          {t.payment_method?.toUpperCase() === "CASH" ? (
                            <Banknote className="w-3 h-3 mr-1.5" />
                          ) : (
                            <CreditCard className="w-3 h-3 mr-1.5" />
                          )}
                          {t.payment_method}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-xl font-semibold tracking-tight leading-none",
                        t.type === "INCOME"
                          ? "text-emerald-500"
                          : "text-red-500",
                      )}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatNumber(t.amount)}
                      <span className="text-xs ml-1 text-white/20 font-bold uppercase">
                        f
                      </span>
                    </p>
                    <div className="mt-2 text-[9px] font-semibold text-white/20 uppercase tracking-wide flex items-center justify-end">
                      ID Transaction: #{t.id}
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {filteredTransactions.length > 0 && (
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="h-9 px-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
              <p className="text-xs text-white/70">
                Page {paginatedTransactions.page} / {paginatedTransactions.totalPages} ({paginatedTransactions.total} éléments)
              </p>
              <Button
                variant="ghost"
                onClick={() => setPage(page + 1)}
                disabled={page >= paginatedTransactions.totalPages}
                className="h-9 px-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl p-6 overflow-hidden shadow-2xl">
          <DialogHeader className="pb-4 border-b border-white/10">
            <DialogTitle className="text-xl font-semibold tracking-tight text-white uppercase leading-none">
              Nouvelle Écriture
            </DialogTitle>
            <DialogDescription className="text-white/50 text-sm mt-1">
              Enregistrez un mouvement de flux entrant ou sortant (Caisse).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                Type d'opération
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "INCOME" })}
                  className={cn(
                    "py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all",
                    formData.type === "INCOME"
                      ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                      : "text-white/20 hover:text-white hover:bg-white/5",
                  )}
                >
                  <ArrowUpRight className="w-4 h-4 mb-1 mx-auto" />
                  Entrée (+)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                  className={cn(
                    "py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all",
                    formData.type === "EXPENSE"
                      ? "bg-red-500 text-white shadow-xl shadow-red-500/20"
                      : "text-white/20 hover:text-white hover:bg-white/5",
                  )}
                >
                  <ArrowDownRight className="w-4 h-4 mb-1 mx-auto" />
                  Sortie (-)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                  Montant Net (F)
                </label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white/5 border-white/10 rounded-xl font-semibold px-3 focus:ring-primary focus:border-primary"
                  placeholder="0"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                  Moyen de Paie
                </label>
                <div className="relative">
                  <select
                    className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white appearance-none"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="CASH" className="bg-slate-900 leading-3">
                      Billets / Caisse (Cash)
                    </option>
                    <option value="WAVE" className="bg-slate-900 leading-3">
                      Transfert Mobile (Wave/OM)
                    </option>
                    <option value="CARD" className="bg-slate-900 leading-3">
                      Carte Bancaire
                    </option>
                    <option value="TRANSFER" className="bg-slate-900 leading-3">
                      Virement Direct
                    </option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                Motif / Libellé de Transaction
              </label>
              <Input
                type="text"
                className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3 font-medium"
                placeholder="Achat matériel, Paiement loyer, Recette bar..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <DialogFooter className="gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="px-5 h-10 rounded-xl font-semibold text-white/60 hover:text-white uppercase tracking-wide text-[10px]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className={cn(
                  "flex-1 h-10 rounded-xl font-semibold text-sm transition-all shadow-xl uppercase tracking-wide",
                  formData.type === "INCOME"
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-red-500 text-white shadow-red-500/30",
                )}
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto text-white" />
                ) : (
                  "Confirmer l'Écriture"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
