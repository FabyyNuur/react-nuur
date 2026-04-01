import { cn } from "../../lib/utils";
import type { TicketFilter } from "../../types/ticketing";

const FILTER_BUTTONS: Array<{
  key: TicketFilter;
  label: string;
  activeClass: string;
  idleClass: string;
}> = [
  {
    key: "all",
    label: "Tout",
    activeClass: "bg-white/20 text-white border-white/30",
    idleClass: "bg-white/5 text-white/65 border-white/10 hover:bg-white/10",
  },
  {
    key: "active",
    label: "Actifs",
    activeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    idleClass:
      "bg-emerald-500/8 text-emerald-300/80 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  {
    key: "expired",
    label: "Expirés",
    activeClass: "bg-red-500/20 text-red-300 border-red-500/40",
    idleClass:
      "bg-red-500/8 text-red-300/80 border-red-500/20 hover:bg-red-500/15",
  },
  {
    key: "used",
    label: "Utilisés",
    activeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    idleClass:
      "bg-indigo-500/8 text-indigo-300/80 border-indigo-500/20 hover:bg-indigo-500/15",
  },
];

type Props = {
  value: TicketFilter;
  counts: Record<TicketFilter, number>;
  onChange: (filter: TicketFilter) => void;
};

export function TicketFilterBar({ value, counts, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_BUTTONS.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onChange(filter.key)}
          className={cn(
            "h-8 px-3 rounded-lg text-[11px] font-semibold border transition-colors",
            value === filter.key ? filter.activeClass : filter.idleClass,
          )}
        >
          {filter.label} ({counts[filter.key]})
        </button>
      ))}
    </div>
  );
}
