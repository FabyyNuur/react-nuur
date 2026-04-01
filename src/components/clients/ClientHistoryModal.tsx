import { Calendar } from "lucide-react";
import type { ClientHistoryEntry } from "../../types/clientHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  entries: ClientHistoryEntry[];
  formatDate: (date?: string) => string;
  isSubscriptionValid: (endDate?: string) => boolean;
};

export function ClientHistoryModal({
  open,
  onOpenChange,
  loading,
  entries,
  formatDate,
  isSubscriptionValid,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Historique des abonnements
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Liste des renouvellements et des periodes d'abonnement.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 space-y-3">
          {loading ? (
            <p className="text-sm text-slate-300">Chargement...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-slate-300">
              Aucun historique disponible.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    {entry.activity_name || "Activite"}
                  </p>
                  <Badge
                    className={cn(
                      "text-[10px]",
                      isSubscriptionValid(entry.end_date)
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/25"
                        : "bg-red-500/20 text-red-300 border-red-400/25",
                    )}
                  >
                    {isSubscriptionValid(entry.end_date) ? "Actif" : "Expire"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Du {formatDate(entry.start_date)} au{" "}
                  {formatDate(entry.end_date)}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
