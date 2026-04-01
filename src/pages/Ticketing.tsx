import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import {
  Plus,
  Layers,
  Printer,
  Share2,
  Activity,
  X,
  CheckCircle2,
  Ticket as TicketIcon,
  CreditCard,
  Banknote,
  RefreshCw,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";
import { TicketFilterBar } from "../components/ticketing/TicketFilterBar";
import {
  DEFAULT_TICKET_GENERATE_FORM,
  isTicketSaleActivityActive,
  type TicketActivity,
  type TicketFilter,
  type TicketItem,
  type GeneratedTicket,
  type TicketWithViewStatus,
} from "../types/ticketing";
import {
  formatTicketDateTimeFr,
  getTicketViewStatus,
} from "../lib/ticketing";

export default function Ticketing() {
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lockedActivityId, setLockedActivityId] = useState<string | null>(null);
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>("all");
  const [ticketPage, setTicketPage] = useState(1);

  const [formData, setFormData] = useState({ ...DEFAULT_TICKET_GENERATE_FORM });

  const [generatedResults, setGeneratedResults] = useState<GeneratedTicket[] | null>(null);

  const handleCreateModalChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) setLockedActivityId(null);
  };

  const recentSales = useMemo(() => tickets.slice(0, 6), [tickets]);
  const ticketStatus = useMemo(() => {
    const now = new Date();

    const counts = { all: tickets.length, active: 0, expired: 0, used: 0 };
    const decorated: TicketWithViewStatus[] = tickets.map((t) => {
      const viewStatus = getTicketViewStatus(t, now);
      counts[viewStatus] += 1;
      return { ...t, viewStatus };
    });
    const filtered =
      ticketFilter === "all"
        ? decorated
        : decorated.filter((t) => t.viewStatus === ticketFilter);
    return { counts, filtered };
  }, [tickets, ticketFilter]);

  const paginatedTicketStatus = useMemo(() => {
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(ticketStatus.filtered.length / pageSize));
    const safePage = Math.min(Math.max(ticketPage, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      items: ticketStatus.filtered.slice(start, start + pageSize),
      page: safePage,
      totalPages,
      total: ticketStatus.filtered.length,
    };
  }, [ticketStatus.filtered, ticketPage]);

  useEffect(() => {
    setTicketPage(1);
  }, [ticketFilter, tickets.length]);

  const fetchData = async () => {
    try {
      const [activitiesRes, ticketsRes] = await Promise.all([
        api.get("/activities"),
        api.get("/tickets"),
      ]);
      setActivities(
        (activitiesRes.data.data || []).filter(
          (a: TicketActivity) =>
            !a.subscription_only && isTicketSaleActivityActive(a),
        ),
      );
      setTickets(ticketsRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = activities.find(
      (x) => String(x.id) === formData.activity_id,
    );
    if (
      !selected ||
      !isTicketSaleActivityActive(selected)
    ) {
      alert(
        "Cette activité n’est pas disponible pour la vente de tickets (activité inactive ou introuvable).",
      );
      return;
    }
    setIsGenerating(true);
    try {
      const response = await api.post("/tickets/generate", formData);
      setGeneratedResults(response.data.data);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erreur de génération";
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié dans le presse-papier");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white leading-none">
            Billetterie & Vente de Tickets
          </h1>
          <p className="text-blue-200/65 text-sm mt-2">
            Générez et vendez des tickets d'accès journaliers ou par séance.
          </p>
        </div>

        <Button 
          onClick={() => {
            setLockedActivityId(null);
            setIsCreateModalOpen(true);
          }}
          className="h-11 px-6 rounded-full bg-[#18c7ef] hover:bg-[#13b8de] text-[#071326] shadow-[0_0_24px_rgba(24,199,239,0.35)] font-semibold text-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Ticket
        </Button>
      </div>

      <Card className="glass-card border-white/15 rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b border-white/10 bg-white/1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-300">
              <TicketIcon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white tracking-tight">
                Activités avec Tickets
              </CardTitle>
              <p className="text-xs text-slate-300/60 mt-0.5">
                Sélectionnez une activité pour générer des tickets.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 opacity-50">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-slate-300">Chargement des activités...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
              <Layers className="w-8 h-8" />
              <p className="text-sm text-slate-300/80">Aucune activité ticket trouvée.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="min-w-[280px] md:min-w-[320px] bg-[#1a3472]/45 border border-white/10 rounded-xl p-4 flex flex-col hover:bg-[#214389]/45 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/25 text-cyan-300 flex items-center justify-center">
                      <TicketIcon className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-semibold text-white leading-none">
                        {Number(a.daily_ticket_price || 0).toLocaleString("fr-FR")} F
                      </p>
                      <p className="text-[10px] text-slate-300/50 uppercase mt-1">L'unité</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-white mb-4 uppercase tracking-tight">
                    {a.name}
                  </p>
                  <Button
                    onClick={() => {
                      setLockedActivityId(String(a.id));
                      setFormData({ ...formData, activity_id: String(a.id), quantity: 1 });
                      setIsCreateModalOpen(true);
                    }}
                    className="h-10 rounded-full bg-blue-700/45 hover:bg-blue-600/55 text-blue-100 font-semibold border border-blue-300/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Générer un ticket
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-xl border border-white/10 bg-white/2 p-3">
            <p className="text-xs font-semibold text-white/80 mb-2">Dernières ventes</p>
            {recentSales.length === 0 ? (
              <p className="text-xs text-slate-300/60">Aucune vente récente.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {recentSales.slice(0, 3).map((t) => (
                  <div key={t.id} className="rounded-lg border border-white/10 bg-[#203b79]/35 p-2.5">
                    <p className="text-[10px] text-cyan-300 font-mono">#{String(t.qr_code).slice(0, 8)}</p>
                    <p className="text-xs text-white mt-1">{t.activity_name}</p>
                    <p className="text-xs text-emerald-300 font-semibold mt-1">
                      {Number(t.price || 0).toLocaleString("fr-FR")} F
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-2xl overflow-hidden flex flex-col">
        <CardHeader className="p-4 border-b border-white/10 bg-white/1 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-white tracking-tight">
                Journal des ventes
              </CardTitle>
              <p className="text-xs text-slate-300/60">Liste complète des tickets générés.</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="h-8 px-3 rounded-lg border-white/10 bg-white/5 text-white/60 font-medium text-[11px]"
          >
            Session : {new Date().toLocaleDateString("fr-FR")}
          </Badge>
          <TicketFilterBar
            value={ticketFilter}
            counts={ticketStatus.counts}
            onChange={setTicketFilter}
          />
        </CardHeader>

        <CardContent className="p-0 overflow-y-auto custom-scrollbar max-h-[520px]">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 opacity-60">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-slate-300">Chargement des archives...</p>
            </div>
          ) : paginatedTicketStatus.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
              <Layers className="w-8 h-8" />
              <p className="text-sm text-slate-300/80">Aucun ticket pour ce filtre.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5 bg-white/2 sticky top-0 z-20">
                  <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                    Identifiant QR
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                    Activité
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                    Expiration
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-white/40 text-center">
                    Statut
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-white/40 text-right">
                    Montant
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-white/40 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTicketStatus.items.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-white/5 hover:bg-white/3 transition-colors group cursor-default"
                  >
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                          <QRCodeSVG value={t.qr_code} size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-white/70 font-mono tracking-tight">
                              #{t.qr_code.substring(0, 12)}...
                            </p>
                            <button 
                              onClick={() => handleCopy(t.qr_code)}
                              className="p-1 rounded-md bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Copier le code complet"
                              aria-label="Copier le code complet"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[10px] text-white/30 mt-1">
                            {formatTicketDateTimeFr(t.created_at)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-white">
                        {t.activity_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <span className="text-xs text-slate-300/85">
                        {formatTicketDateTimeFr(t.valid_until)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-center">
                      <Badge
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border-none",
                          t.viewStatus === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : t.viewStatus === "expired"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-indigo-500/10 text-indigo-300",
                        )}
                      >
                        {t.viewStatus === "active"
                          ? "ACTIF"
                          : t.viewStatus === "expired"
                            ? "EXPIRÉ"
                            : "UTILISÉ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right">
                      <span className="text-base font-semibold text-white">
                        {t.price.toLocaleString()}
                        <span className="text-xs ml-1 opacity-40">F</span>
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTicket(t)}
                        className="w-8 h-8 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {ticketStatus.filtered.length > 0 && (
          <CardFooter className="pt-0 pb-4">
            <div className="w-full flex items-center justify-between border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                onClick={() => setTicketPage(ticketPage - 1)}
                disabled={ticketPage <= 1}
                className="h-9 px-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
              <p className="text-xs text-white/70">
                Page {paginatedTicketStatus.page} / {paginatedTicketStatus.totalPages} ({paginatedTicketStatus.total} tickets)
              </p>
              <Button
                variant="ghost"
                onClick={() => setTicketPage(ticketPage + 1)}
                disabled={ticketPage >= paginatedTicketStatus.totalPages}
                className="h-9 px-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <Dialog
        open={!!generatedResults}
        onOpenChange={(open) => !open && setGeneratedResults(null)}
      >
        <DialogContent className="max-w-4xl bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl p-0 shadow-2xl overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-6 pb-4 border-b border-white/10 bg-emerald-500/5 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-xl animate-bounce-short">
                <CheckCircle2 className="w-7 h-7 text-black" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-semibold tracking-tight text-white leading-none">
                  Emission Terminée
                </DialogTitle>
                <DialogDescription className="text-emerald-400/70 text-xs mt-1 font-medium uppercase tracking-wide">
                  {generatedResults?.length} Tickets Générés avec Succès
                </DialogDescription>
              </div>
            </div>
            <Button
              onClick={() => setGeneratedResults(null)}
              size="icon"
              variant="ghost"
              className="w-9 h-9 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar bg-white/1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedResults?.map((ticket, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl flex flex-col items-center text-black space-y-4 relative group overflow-hidden shadow-xl transition-all hover:scale-[1.02] duration-300 border border-gray-100"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                  <div className="w-full px-5 pt-5 flex justify-between items-center">
                    <Badge className="bg-black text-white font-semibold text-[9px] uppercase tracking-wide px-2.5 py-1 rounded-full border-none">
                      ID #{ticket.id || "N/A"}
                    </Badge>
                    <ActivityIcon className="w-5 h-5 text-gray-200" />
                  </div>

                  <div className="px-6 py-4 bg-white rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] border border-gray-100 transform transition-transform group-hover:scale-105 duration-500">
                    <QRCodeSVG value={ticket.qr_code} size={120} level="H" />
                  </div>

                  <div className="text-center w-full px-6 pb-3">
                    <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-[2px] mb-1">
                      Accès Journalier
                    </p>
                    <h4 className="text-lg font-semibold text-black leading-none tracking-tight mb-1 uppercase">
                      {ticket.activity_name}
                    </h4>
                    <p className="text-3xl font-semibold text-primary tracking-tight">
                      {ticket.price.toLocaleString()}
                      <span className="text-base ml-1">F</span>
                    </p>
                  </div>

                  <div className="w-full h-8 flex items-center justify-center">
                    <div className="flex-1 h-[1px] bg-gray-100" />
                    <div className="px-3 text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">
                      Nuur GYM
                    </div>
                    <div className="flex-1 h-[1px] bg-gray-100" />
                  </div>

                  <CardFooter className="w-full p-3 flex gap-2 bg-gray-50 border-t border-gray-100">
                    <Button className="flex-1 h-10 bg-white text-black border border-gray-200 hover:bg-gray-100 rounded-xl shadow-sm transition-all group/btn">
                      <Printer className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        Imprimer
                      </span>
                    </Button>
                    <Button className="flex-1 h-10 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl shadow-sm transition-all group/btn border border-emerald-100">
                      <Share2 className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        Partager
                      </span>
                    </Button>
                  </CardFooter>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="p-5 bg-slate-900/50 border-t border-white/10 flex gap-3">
            <Button
              onClick={() => setGeneratedResults(null)}
              className="w-full h-11 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-semibold uppercase tracking-wide text-[10px] border border-white/10 transition-all"
            >
              Fermer et Retourner au guichet
            </Button>
            <Button className="w-full h-11 rounded-xl bg-emerald-500 text-black font-semibold uppercase tracking-wide text-[10px] shadow-xl shadow-emerald-500/20 hover:scale-[1.01] transition-all">
              <Printer className="w-4 h-4 mr-2" /> Imprimer tout le lot (
              {generatedResults?.length})
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
      <Dialog 
        open={!!selectedTicket} 
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-md bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl p-0 shadow-2xl overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-semibold uppercase tracking-tight">
              Détails du Ticket
            </DialogTitle>
            <Button
              onClick={() => setSelectedTicket(null)}
              size="icon"
              variant="ghost"
              className="w-9 h-9 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>

          {selectedTicket && (
            <div className="p-5 pt-0 space-y-5">
              <div className="bg-white rounded-3xl p-5 flex flex-col items-center space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-100">
                  <QRCodeSVG value={selectedTicket.qr_code} size={150} level="H" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gray-400 mb-1">
                    ID Ticket
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    <p className="text-xs font-mono font-bold text-black break-all">
                      {selectedTicket.qr_code}
                    </p>
                    <button 
                      onClick={() => handleCopy(selectedTicket.qr_code)}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                      title="Copier le code du ticket"
                      aria-label="Copier le code du ticket"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-white/35 mb-1">Activité</p>
                  <p className="text-sm font-medium text-white truncate">{selectedTicket.activity_name}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-white/35 mb-1">Montant</p>
                  <p className="text-sm font-semibold text-primary">{selectedTicket.price.toLocaleString()} F</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-white/35 mb-1">Date</p>
                  <p className="text-sm font-medium text-white">{new Date(selectedTicket.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-white/35 mb-1">Heure</p>
                  <p className="text-sm font-medium text-white">{new Date(selectedTicket.created_at).toLocaleTimeString('fr-FR')}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-white/35 mb-1">Paiement</p>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px]">{selectedTicket.payment_method}</Badge>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-white/35 mb-1">Statut</p>
                  <Badge className={cn(
                    "text-[9px] font-semibold uppercase tracking-wide",
                    selectedTicket.status === 'VALID' ? "bg-emerald-500/10 text-emerald-500" : "bg-white/10 text-white/40"
                  )}>
                    {selectedTicket.status}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[10px] uppercase tracking-wide">
                  <Printer className="w-4 h-4 mr-2" /> Imprimer
                </Button>
                <Button className="flex-1 h-10 rounded-xl bg-primary text-black font-semibold text-[10px] uppercase tracking-wide shadow-lg shadow-primary/20">
                  <Share2 className="w-4 h-4 mr-2" /> Partager
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isCreateModalOpen} 
        onOpenChange={handleCreateModalChange}
      >
        <DialogContent className="max-w-lg bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl p-0 shadow-2xl overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-6 pb-4 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white tracking-tight uppercase leading-none">
                  Vente Ponctuelle
                </DialogTitle>
                <DialogDescription className="text-blue-200/50 text-[10px] font-semibold uppercase tracking-[1px] mt-1">
                  Émission de nouveaux tickets
                </DialogDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(false)}
              size="icon"
              variant="ghost"
              className="w-9 h-9 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>

          <CardContent className="p-6">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                  Type d'Activité
                </label>
                <div className="relative group">
                  <select
                    className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white appearance-none"
                    value={formData.activity_id}
                    onChange={(e) =>
                      setFormData({ ...formData, activity_id: e.target.value })
                    }
                    disabled={!!lockedActivityId}
                    required
                  >
                    <option value="" className="bg-slate-900">
                      Sél. une activité
                    </option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id} className="bg-slate-900">
                        {a.name} — {a.daily_ticket_price} F
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                    Quantité
                  </label>
                  <Input
                    type="number"
                    className="h-10 text-sm bg-white/5 border-white/10 rounded-xl font-semibold px-3 focus:ring-primary focus:border-primary"
                    min="1"
                    max="100"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                    Paiement
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
                      <option value="CASH" className="bg-slate-900">
                        Cash / Espèces
                      </option>
                      <option value="WAVE" className="bg-slate-900">
                        Mobile Money
                      </option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      {formData.payment_method === "CASH" ? (
                        <Banknote className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-semibold uppercase tracking-[1px] text-white/35 ml-1">
                    Validité
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white appearance-none"
                      value={formData.validity_option}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validity_option: e.target.value,
                        })
                      }
                    >
                      <option value="end_of_day" className="bg-slate-900">
                        Fin de journée (23:59)
                      </option>
                      <option value="24h" className="bg-slate-900">
                        24 heures
                      </option>
                      <option value="3d" className="bg-slate-900">
                        3 jours
                      </option>
                      <option value="7d" className="bg-slate-900">
                        7 jours
                      </option>
                      <option value="30d" className="bg-slate-900">
                        30 jours
                      </option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/20 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-primary uppercase tracking-[2px] leading-none mb-1">
                    Total à Encaisser
                  </p>
                  <p className="text-2xl font-semibold text-white tracking-tight leading-none">
                    {formData.activity_id
                      ? (
                          Number(
                            activities.find(
                              (a) => a.id.toString() === formData.activity_id,
                            )?.daily_ticket_price ?? 0,
                          ) * formData.quantity
                        ).toLocaleString()
                      : "0"}
                    <span className="text-base ml-1 text-primary">F</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold text-white/30 uppercase tracking-wide leading-none mb-1">
                    Tickets valables
                  </p>
                  <p className="text-xs font-medium text-white/60 leading-none">
                    Aujourd'hui uniquement
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isGenerating || !formData.activity_id}
                className="w-full h-11 rounded-xl bg-gradient-to-br from-primary to-accent font-semibold text-sm uppercase tracking-wide shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-30"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TicketIcon className="w-4 h-4 mr-2 text-black" />
                )}
                {isGenerating
                  ? "Génération en cours..."
                  : "Émettre & Valider Vente"}
              </Button>
            </form>
          </CardContent>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
