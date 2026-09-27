"use client";
import React from "react";
import { motion } from "framer-motion";

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

export function Card({
  children,
  className = "",
  delay = 0,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4 } : undefined}
      className={cx("card noise relative overflow-hidden p-5 sm:p-6", className)}
    >
      {children}
    </motion.div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className = "", ...rest }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 active:scale-[.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { sm: "h-9 px-4 text-[13px]", md: "h-11 px-6 text-sm", lg: "h-14 px-8 text-base" };
  const variants = {
    primary:
      "text-white shadow-[0_10px_30px_-10px_rgba(79,70,229,.8)] bg-[linear-gradient(120deg,#6366f1,#8b5cf6_55%,#14b8a6)] bg-[length:200%_100%] hover:bg-[position:100%_0] hover:shadow-[0_16px_40px_-12px_rgba(79,70,229,.9)]",
    soft: "bg-black/[.05] dark:bg-white/[.07] hover:bg-black/[.09] dark:hover:bg-white/[.12]",
    ghost: "hover:bg-black/[.05] dark:hover:bg-white/[.07]",
    danger: "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10",
  };
  return <button className={cx(base, sizes[size], variants[variant], className)} {...rest} />;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-medium ink-soft">{label}</span>
      {children}
      {hint && <span className="block text-[11px] ink-soft">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border bg-white/60 dark:bg-white/[.04] px-4 py-3 text-sm outline-none transition " +
  "focus:border-indigo-400/70 focus:ring-4 focus:ring-indigo-500/10 placeholder:opacity-50";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="glass inline-flex rounded-full p-1 gap-1 overflow-x-auto no-scrollbar max-w-full">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors whitespace-nowrap",
            value === o.value ? "text-white" : "ink-soft hover:opacity-80"
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${options.map((x) => x.value).join("")}`}
              className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,#6366f1,#8b5cf6_60%,#14b8a6)]"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Avatar({ seed, name, size = 40 }: { seed: string; name: string; size?: number }) {
  const hues = [255, 200, 165, 320, 20, 280];
  const h = hues[(parseInt(seed || "0", 10) || 0) % hues.length];
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(140deg, hsl(${h} 80% 62%), hsl(${(h + 40) % 360} 75% 52%))`,
      }}
    >
      {(name || "?").trim().charAt(0)}
    </div>
  );
}

export function Pill({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{
        background: color ? `${color}1f` : "rgba(99,102,241,.12)",
        color: color || "#6366f1",
      }}
    >
      {children}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/25 border-t-indigo-500" />
    </div>
  );
}

export function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[linear-gradient(140deg,#6366f1,#14b8a6)] opacity-20" />
      <p className="text-sm ink-soft">{text}</p>
      {action}
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-7"
    >
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-sm ink-soft">{sub}</p>}
    </motion.div>
  );
}
