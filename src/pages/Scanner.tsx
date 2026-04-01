import { useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  Activity,
  Camera,
  Zap,
  RefreshCw,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Filter,
  ScanLine,
  History,
  User,
  CreditCard,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useScanner } from "../hooks/useScanner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

export default function Scanner() {
  const {
    manualCode,
    setManualCode,
    scanResult,
    scanning,
    loadingLogs,
    logs,
    activeFilter,
    setActiveFilter,
    stats,
    pagination,
    scannerActive,
    startCamera,
    stopCamera,
    handleManualScan,
    changePage,
    formatTime,
    formatDateShort,
  } = useScanner();

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (scannerActive) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );
      scannerRef.current.render(
        (decodedText) => {
          setManualCode(decodedText);
          handleManualScan();
          stopCamera();
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error) => {
          // silent retry
        },
      );
    } else {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Cleanup error", err));
      }
    };
  }, [scannerActive, handleManualScan, setManualCode, stopCamera]);

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white leading-none">
            Contrôle d'Accès
          </h1>
          <p className="text-blue-200/65 text-sm mt-2">
            Scanner les QR codes des membres ou saisir manuellement leur
            identifiant.
          </p>
        </div>
      </div>

      {/* Global Access Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-white/15 rounded-2xl bg-white/3">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-300">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-3xl font-semibold text-white tracking-tight leading-none">
              {stats.total}
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Total Scans Validés
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-2xl bg-white/3">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-semibold text-emerald-400 tracking-tight leading-none">
              {stats.valid}
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Accès Autorisés
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-2xl bg-white/3">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-3xl font-semibold text-red-400 tracking-tight leading-none">
              {stats.refused}
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Accès Refusés (Expirés)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Active Scanner Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-white/5 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden relative border border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 animate-scanline" />

            <CardHeader className="p-10 pb-6 text-center">
              <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-4 border border-primary/20">
                <ScanLine className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                Scanner en Direct
              </CardTitle>
              <CardDescription className="text-blue-200/40 text-[10px] font-black uppercase tracking-[2px] mt-2">
                Prêt pour la reconnaissance
              </CardDescription>
            </CardHeader>

            <CardContent className="p-10 pt-0">
              {/* Scanning Visual Container */}
              <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-black/40 mb-8 flex items-center justify-center group shadow-2xl">
                <div
                  id="qr-reader"
                  className="w-full h-full border-none scan-container-custom"
                ></div>

                {!scannerActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-950/80 backdrop-blur-sm z-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 mb-6 group-hover:scale-110 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-700">
                      <Camera className="w-12 h-12" />
                    </div>
                    <p className="text-sm font-bold text-white/60 mb-8 max-w-[200px]">
                      Autorisez l'accès à la caméra pour démarrer le scan
                      automatique.
                    </p>
                    <Button
                      onClick={startCamera}
                      className="h-14 px-10 rounded-2xl bg-gradient-to-br from-primary to-accent font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                    >
                      Activer Optique
                    </Button>
                  </div>
                )}

                {scannerActive && (
                  <Button
                    onClick={stopCamera}
                    size="icon"
                    className="absolute top-6 right-6 w-12 h-12 bg-black/50 hover:bg-red-500 rounded-full text-white transition-all z-30 shadow-xl border border-white/10 backdrop-blur-md"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                )}

                {/* Animated Focus Frame (only when active) */}
                {scannerActive && (
                  <div className="absolute inset-x-12 inset-y-12 border-2 border-primary/40 rounded-[2rem] animate-pulse pointer-events-none z-20">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                  </div>
                )}
              </div>

              {/* Manual Overwrite */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleManualScan();
                }}
                className="space-y-4"
              >
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Saisie manuelle du code..."
                    className="h-14 pl-14 bg-white/5 border-white/10 rounded-2xl font-black text-sm tracking-widest placeholder:text-white/10 placeholder:font-normal uppercase focus:ring-primary/40"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    disabled={scanning}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={scanning || !manualCode.trim()}
                  variant="outline"
                  className="w-full h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center justify-center gap-4 transition-all"
                >
                  {scanning ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary" />
                  )}
                  {scanning ? "Analyse du Graphe..." : "Valider le Pass"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Result Indicator */}
          {scanResult && (
            <div
              className={cn(
                "p-8 rounded-[3rem] border-2 animate-in slide-in-from-top-6 duration-500 shadow-2xl relative overflow-hidden",
                scanResult.valid
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-red-500/10 border-red-500/20",
              )}
            >
              <div className="flex items-center gap-6 relative z-10">
                <div
                  className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl",
                    scanResult.valid
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white",
                  )}
                >
                  {scanResult.valid ? (
                    <CheckCircle2 className="w-9 h-9" />
                  ) : (
                    <AlertTriangle className="w-9 h-9" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-black uppercase tracking-[3px] text-[10px]",
                      scanResult.valid ? "text-emerald-500" : "text-red-500",
                    )}
                  >
                    {" "}
                    Verdict Systèmatique{" "}
                  </p>
                  <h4 className="text-xl font-bold text-white mt-1 leading-tight tracking-tight">
                    {scanResult.message}
                  </h4>
                  {scanResult.valid && (
                    <Badge className="mt-3 bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                      Accès Ouvert
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tracking & Logs Panel */}
        <Card className="lg:col-span-3 border-none bg-white/5 backdrop-blur-xl rounded-[3.5rem] overflow-hidden flex flex-col h-[700px] border border-white/5 lg:sticky lg:top-8">
          <CardHeader className="p-10 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 border border-white/10">
                <History className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-white tracking-tight uppercase leading-none">
                  Journal Temporaire
                </CardTitle>
                <p className="text-blue-200/40 text-[9px] font-black uppercase tracking-[3px] mt-2">
                  Dernières vérifications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveFilter("all")}
                title="Afficher tous les logs"
                aria-label="Afficher tous les logs"
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  activeFilter === "all"
                    ? "bg-white/10 text-white shadow-inner ring-1 ring-white/20"
                    : "text-white/20 hover:text-white",
                )}
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveFilter("valid")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeFilter === "valid"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-emerald-500/40 hover:text-emerald-500",
                )}
              >
                Valides
              </button>
              <button
                onClick={() => setActiveFilter("refused")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeFilter === "refused"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "text-red-500/40 hover:text-red-500",
                )}
              >
                Refusés
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-30">
                  <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[4px]">
                    Lecture du Stream...
                  </p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
                  <ShieldOff className="w-16 h-16 text-white/5" />
                  <div className="text-center">
                    <p className="text-white/40 font-bold italic text-sm">
                      Station de contrôle inactive.
                    </p>
                    <p className="text-white/10 text-[10px] uppercase font-black tracking-widest mt-2">
                      En attente de flux optique
                    </p>
                  </div>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="group p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center ring-4 transition-all group-hover:scale-110",
                          log.is_valid
                            ? "bg-emerald-500 text-white ring-emerald-500/10 shadow-lg shadow-emerald-500/20"
                            : "bg-red-500 text-white ring-red-500/10 shadow-lg shadow-red-500/20",
                        )}
                      >
                        {log.is_valid ? (
                          <User className="w-6 h-6" />
                        ) : (
                          <ShieldOff className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-base font-black text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-4 mt-2.5">
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-white/20" />
                            <span className="text-[10px] font-mono text-white/30 tracking-tight">
                              {log.qr_code_scanned}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-white/70">
                        <Clock className="w-3.5 h-3.5 text-white/20" />
                        <p className="text-xs font-black tracking-tighter">
                          {formatTime(log.scanned_at)}
                        </p>
                      </div>
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-[2px] mt-2 group-hover:text-white/20 transition-colors uppercase">
                        {formatDateShort(log.scanned_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          {/* Modular Pagination */}
          {pagination.totalPages > 1 && (
            <CardFooter className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
              <Button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="ghost"
                className="h-12 px-6 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-10"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase text-white/20 tracking-[4px]">
                  Vol. {pagination.page} / {pagination.totalPages}
                </span>
              </div>
              <Button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                variant="ghost"
                className="h-12 px-6 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-10"
              >
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
