import {
  Phone,
  QrCode,
  Pencil,
  History as HistoryIcon,
} from "lucide-react";
import type { Client } from "../../interfaces/interfaces";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import type { ClientActivityItem } from "../../lib/clientActivities";

type Props = {
  client: Client;
  selected: boolean;
  clientActivities: ClientActivityItem[];
  isActive: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onQr: (e: React.MouseEvent) => void;
  onHistory: (e: React.MouseEvent) => void;
  formatDate: (date?: string) => string;
  isSubscriptionValid: (endDate?: string) => boolean;
};

export function ClientCard({
  client,
  selected,
  clientActivities,
  isActive,
  onSelect,
  onEdit,
  onQr,
  onHistory,
  formatDate,
  isSubscriptionValid,
}: Props) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "border border-white/10 bg-[#1e3b82]/24 hover:bg-[#244896]/28 rounded-xl transition-all cursor-pointer p-3",
        selected ? "ring-1 ring-primary/60" : "",
      )}
    >
      <CardHeader className="p-3 pb-2 space-y-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                isActive
                  ? "bg-gradient-cyan text-white"
                  : "bg-white/10 text-slate-300",
              )}
            >
              {client.first_name[0]}
              {client.last_name[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-xl leading-6 tracking-tight truncate">
                {client.first_name} {client.last_name}
              </p>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 opacity-70" />
                {client.phone || "Sans contact"}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "px-2.5 py-1 rounded-full text-[9px] font-semibold",
              isActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/25"
                : "bg-red-500/20 text-red-300 border-red-400/25",
            )}
          >
            {isActive ? "Actif" : "Expiré"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2">
        <p className="text-[11px] font-medium text-slate-300/85 uppercase tracking-wide mb-2">
          Abonnements
        </p>
        <div className="space-y-2">
          {clientActivities.map((act, idx) => {
            const valid = isSubscriptionValid(act.date);
            return (
              <div
                key={idx}
                className="rounded-lg border border-white/8 bg-[#1a3778]/22 px-2.5 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white uppercase text-xs truncate">
                    {act.name}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap",
                      valid
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-red-500/20 text-red-300",
                    )}
                  >
                    Expire le : {formatDate(act.date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="px-3 pt-0 pb-3 flex items-center gap-2">
        <Button
          className="flex-1 h-9 rounded-full bg-[#274da3]/65 hover:bg-[#2e59bc] text-white font-medium text-xs"
          onClick={onEdit}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full glass hover:bg-primary/20 text-slate-200"
          onClick={onQr}
          title="Carte / code membre"
        >
          <QrCode className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full glass hover:bg-white/10 text-slate-300"
          onClick={onHistory}
          title="Historique"
        >
          <HistoryIcon className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
