import {
  Phone,
  Mail,
  X,
  QrCode,
  Pencil,
  History as HistoryIcon,
  CheckCircle2,
  AlertTriangle,
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
import { getClientActivities } from "../../lib/clientActivities";

type Props = {
  detailClient: Client;
  onClose: () => void;
  onHistory: (id: number) => void;
  onQr: (client: Client) => void;
  onEdit: (client: Client) => void;
  formatDate: (date?: string) => string;
  isSubscriptionValid: (endDate?: string) => boolean;
};

export function ClientDetailsPanel({
  detailClient,
  onClose,
  onHistory,
  onQr,
  onEdit,
  formatDate,
  isSubscriptionValid,
}: Props) {
  return (
    <div className="lg:col-span-4 sticky top-28 animate-in slide-in-from-right-10 duration-500">
      <Card className="glass-card border-none overflow-hidden relative">
        <div
          className={cn(
            "h-2 w-full absolute top-0 left-0",
            isSubscriptionValid(detailClient.subscription_end_date)
              ? "bg-primary"
              : "bg-red-500",
          )}
        />

        <CardHeader className="p-8 pb-4 relative flex flex-row items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className={cn(
                "w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-2xl font-black uppercase shadow-2xl",
                isSubscriptionValid(detailClient.subscription_end_date)
                  ? "bg-gradient-cyan text-white"
                  : "bg-white/10 text-slate-500",
              )}
            >
              {detailClient.first_name[0]}
              {detailClient.last_name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                {detailClient.first_name} <br /> {detailClient.last_name}
              </h2>
              <Badge className="bg-white/5 text-slate-400 border-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                ID: #{detailClient.id}
              </Badge>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-12 w-12 glass hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-8 pt-6 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-500 ml-1">
              Statut Abonnements
            </p>
            <div className="grid grid-cols-1 gap-3">
              {getClientActivities(detailClient).map((act, idx) => {
                const valid = isSubscriptionValid(act.date);
                return (
                  <div
                    key={idx}
                    className="glass p-5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          valid
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400",
                        )}
                      >
                        {valid ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tight text-sm">
                          {act.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                          Expire le {formatDate(act.date)}
                        </p>
                      </div>
                    </div>
                    {valid ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                        Actif
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-400 border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                        Expiré
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-5 rounded-2xl space-y-2">
              <Mail className="w-5 h-5 text-primary opacity-50" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                  Email
                </p>
                <p className="text-xs font-bold text-white truncate">
                  {detailClient.email || "Non renseigné"}
                </p>
              </div>
            </div>
            <div className="glass p-5 rounded-2xl space-y-2">
              <Phone className="w-5 h-5 text-primary opacity-50" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                  Téléphone
                </p>
                <p className="text-xs font-bold text-white">
                  {detailClient.phone || "Non renseigné"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-2xl glass hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px]"
              onClick={() => onHistory(detailClient.id)}
            >
              <HistoryIcon className="w-4 h-4 mr-3" /> Historique
            </Button>
            <Button
              className="flex-1 h-14 rounded-2xl btn-primary"
              onClick={() => onQr(detailClient)}
            >
              <QrCode className="w-4 h-4 mr-3" /> Partager QR
            </Button>
          </div>
        </CardContent>

        <CardFooter className="p-8 bg-white/[0.03] border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest"
            onClick={() => onEdit(detailClient)}
          >
            <Pencil className="w-4 h-4 mr-2" /> Modifier le profil de membre
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
