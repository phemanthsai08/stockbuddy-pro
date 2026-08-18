import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-destructive-soft text-destructive",
  info: "bg-info-soft text-info",
};

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}

export function KpiCard({ label, value, hint, icon: Icon, tone = "neutral" }: KpiCardProps) {
  return (
    <div className="card-surface flex items-start gap-4 p-4 transition-shadow hover:shadow-elevated">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", TONES[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-1 truncate font-display text-2xl font-bold">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
