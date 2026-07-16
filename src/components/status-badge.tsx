import { statusTone } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneClasses: Record<ReturnType<typeof statusTone>, string> = {
  success: "bg-success/15 text-success ring-success/20",
  warning: "bg-warning/20 text-warning-foreground ring-warning/30",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  muted: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary/10 text-primary ring-primary/20",
};

export function StatusBadge({ status }: { status: Parameters<typeof statusTone>[0] }) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
