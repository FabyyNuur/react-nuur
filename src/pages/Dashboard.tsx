import { useState, useEffect } from "react";
import api from "../services/api";
import {
  Users,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CalendarDays } from "lucide-react";
import {
  DASHBOARD_PERIOD_OPTIONS,
  type DashboardApiResponse,
  type DashboardLog,
  type DashboardPeriodId,
} from "../types/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<DashboardPeriodId>("day");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/dashboard?period=${period}`);
        setStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);


  const getChartData = () => {
    const chart = stats?.chart;
    if (!chart?.labels || chart.labels.length === 0) {
      return [];
    }

    const labels = chart.labels;
    const revenues = chart.revenues ?? chart.values ?? [];
    const expenses = chart.expenses ?? [];

    return labels.map((label: string, i: number) => ({
      name: label,
      income: Number(revenues[i]) || 0,
      expense: Number(expenses[i]) || 0,
    }));
  };

  const chartData = getChartData();
  const weeklyLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const scanCountsByDay = (stats?.recentLogs || []).reduce((acc: number[], log: DashboardLog) => {
    if (!log.scanned_at) return acc;
    const date = new Date(log.scanned_at);
    if (Number.isNaN(date.getTime())) return acc;
    const dayIndex = (date.getDay() + 6) % 7;
    acc[dayIndex] += 1;
    return acc;
  }, [0, 0, 0, 0, 0, 0, 0]);

  const weeklyChartData = weeklyLabels.map((label, i) => ({
    name: label,
    value: scanCountsByDay[i],
  }));

  const metricCards = [
    {
      title: `Revenus (${DASHBOARD_PERIOD_OPTIONS.find((p) => p.id === period)?.label})`,
      value: `${new Intl.NumberFormat("fr-FR").format(stats?.stats?.periodIncome || 0)} CFA`,
      icon: TrendingUp,
      color: "text-cyan-300",
      bg: "bg-blue-400/10",
    },
    {
      title: `Dépenses (${DASHBOARD_PERIOD_OPTIONS.find((p) => p.id === period)?.label})`,
      value: `${new Intl.NumberFormat("fr-FR").format(stats?.stats?.periodExpense || 0)} CFA`,
      icon: Wallet,
      color: "text-emerald-300",
      bg: "bg-emerald-400/10",
    },
    {
      title: `Tickets (${DASHBOARD_PERIOD_OPTIONS.find((p) => p.id === period)?.label})`,
      value: stats?.stats?.ticketsSold || 0,
      icon: Ticket,
      color: "text-sky-300",
      bg: "bg-sky-400/10",
    },
    {
      title: `Inscriptions (${DASHBOARD_PERIOD_OPTIONS.find((p) => p.id === period)?.label})`,
      value: stats?.stats?.newMembers || 0,
      icon: Users,
      color: "text-violet-300",
      bg: "bg-indigo-400/10",
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  if (!stats && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/40">
        <p className="text-lg font-bold">Impossible de charger les données.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Tableau de Bord</h1>
          <p className="text-slate-300/80 text-sm mt-1">
            Aperçu général de l'activité du club.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as DashboardPeriodId)}
            >
              <SelectTrigger className="w-[180px] h-11 bg-white/5 border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] backdrop-blur-xl">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                {DASHBOARD_PERIOD_OPTIONS.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    className="focus:bg-primary/20 focus:text-primary py-3 cursor-pointer text-[10px] font-black uppercase tracking-widest"
                  >
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl h-11">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
              Système Actif
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-700 delay-100">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              className={cn(
                "glass-card border-white/20 hover:bg-white/[0.16] transition-all duration-300 group overflow-hidden relative rounded-2xl",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-200/70">{card.title}</p>
                    <div className="text-3xl font-semibold text-white tracking-tight">{card.value}</div>
                  </div>
                  <div
                    className={cn(
                      "p-2 rounded-xl transition-all group-hover:scale-105 shadow-lg",
                      card.bg,
                      card.color,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-white/20 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold text-white">Visites de la semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[330px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.55)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.55)" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(35,45,64,0.88)",
                      borderColor: "rgba(255,255,255,0.18)",
                      borderRadius: "14px",
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                    }}
                    formatter={(value) => [new Intl.NumberFormat("fr-FR").format(Number(value ?? 0) || 0)]}
                  />
                  <Bar dataKey="value" fill="#31c7de" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold text-white">Revenus Mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[330px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 6, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ce3ad" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#4ce3ad" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.55)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.55)" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(35,45,64,0.88)",
                      borderColor: "rgba(255,255,255,0.18)",
                      borderRadius: "14px",
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                    }}
                    formatter={(value) => [`${new Intl.NumberFormat("fr-FR").format(Number(value ?? 0) || 0)} CFA`]}
                  />
                  <Area type="monotone" dataKey="income" stroke="#4ce3ad" strokeWidth={3} fill="url(#revenueArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
