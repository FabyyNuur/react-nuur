import { cn } from "../../lib/utils";

type Step = 1 | 2;

type Props = {
  step: Step;
  className?: string;
  circleClassName?: string;
};

export function ClientStepper({
  step,
  className,
  circleClassName = "w-8 h-8",
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 pt-2",
        className,
      )}
    >
      <div
        className={cn(
          circleClassName,
          "rounded-full flex items-center justify-center text-xs font-bold border-2",
          step === 1
            ? "bg-primary text-white border-primary"
            : "bg-white/10 text-slate-300 border-white/20",
        )}
      >
        1
      </div>
      <div
        className={cn(
          "h-[2px] w-12 rounded-full",
          step === 2 ? "bg-primary" : "bg-white/20",
        )}
      />
      <div
        className={cn(
          circleClassName,
          "rounded-full flex items-center justify-center text-xs font-bold border-2",
          step === 2
            ? "bg-primary text-white border-primary"
            : "bg-white/10 text-slate-300 border-white/20",
        )}
      >
        2
      </div>
    </div>
  );
}
