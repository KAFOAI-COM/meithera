import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-sans text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-emerald text-white hover:bg-forest",
        secondary: "border border-line-strong bg-card text-ink hover:bg-mint/60",
        ghost: "text-forest hover:bg-mint/70",
        mint: "bg-mint text-emerald hover:bg-mint/70",
        gold: "bg-gold text-emerald hover:bg-gold/85",
        danger: "bg-risk-ink text-white hover:opacity-90",
        inverse: "bg-white text-emerald hover:bg-mint",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-card shadow-card", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 p-6 pb-3", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-sans text-lg font-semibold text-ink", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-3", className)} {...props} />;
}

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold", {
  variants: {
    tone: {
      mint: "bg-mint text-emerald",
      emerald: "bg-emerald text-white",
      neutral: "bg-surface text-muted border border-line",
      gold: "bg-demo text-demo-ink",
      risk: "bg-risk text-risk-ink",
    },
  },
  defaultVariants: { tone: "mint" },
});
export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("h-11 w-full rounded-lg border border-line-strong bg-card px-3 text-sm text-ink placeholder:text-muted/80 focus-visible:outline-2 focus-visible:outline-forest", className)}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn("h-11 w-full rounded-lg border border-line-strong bg-card px-3 text-sm text-ink", className)} {...props} />
));
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("font-sans text-sm font-medium text-ink", className)} {...props} />;
}

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-mint", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={label}>
      <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink", className)} {...props} />;
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}
export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("border-b border-line px-3 py-2.5 text-left font-sans text-xs font-semibold uppercase tracking-wide text-muted", className)} {...props} />;
}
export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-line px-3 py-3 align-top text-ink", className)} {...props} />;
}

export function Stat({ label, value, sub, className }: { label: string; value: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="tabular mt-2 font-sans text-2xl font-bold text-ink sm:text-[28px]">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </Card>
  );
}
