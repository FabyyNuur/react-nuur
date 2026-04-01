import { QRCodeSVG } from "qrcode.react";
import type { Client } from "../../interfaces/interfaces";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";

type Props = {
  client: Client | null;
  onOpenChange: (open: boolean) => void;
  formatDate: (date?: string) => string;
  copyToClipboard: (text: string) => void;
  copied: boolean;
};

export function ClientQrDialog({
  client,
  onOpenChange,
  formatDate,
  copyToClipboard,
  copied,
}: Props) {
  return (
    <Dialog
      open={!!client}
      onOpenChange={(open) => onOpenChange(open)}
    >
      <DialogContent className="max-w-md bg-transparent border-none p-0 shadow-none">
        <div className="relative w-full max-w-[360px] mx-auto rounded-[2.25rem] overflow-hidden shadow-[0_35px_90px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-500">
          <div className="bg-gradient-cyan p-9 text-center relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-2">
              Member Card
            </h2>
            <p className="text-[10px] font-black text-white/40 tracking-[5px] uppercase">
              Nuur Gym Community
            </p>
          </div>
          <div className="bg-white p-8 flex flex-col items-center">
            <div className="p-4 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 mb-7 transform hover:scale-105 transition-transform duration-500">
              <QRCodeSVG
                value={client?.qr_code || client?.client_code || ""}
                size={180}
                level="H"
              />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight text-center uppercase leading-none mb-2">
              {client?.first_name} <br /> {client?.last_name}
            </h3>
          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-center text-center">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-[2px] mb-2">
                Exp: {formatDate(client?.subscription_end_date)}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-2 text-xs"
                onClick={() =>
                  copyToClipboard(
                    client?.qr_code || client?.client_code || "",
                  )
                }
              >
                {copied ? "Code copie" : "Copier le code"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
