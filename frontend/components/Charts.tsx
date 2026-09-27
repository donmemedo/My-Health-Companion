"use client";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { useTheme } from "@/lib/theme";

export const PALETTE = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#0ea5e9"];

function useAxis() {
  const { theme } = useTheme();
  const grid = theme === "dark" ? "rgba(255,255,255,.07)" : "rgba(10,12,25,.07)";
  const tick = theme === "dark" ? "#9ba0b4" : "#6b7086";
  return { grid, tick };
}

function Box({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card !rounded-2xl !p-3 text-xs shadow-xl">
      <div className="mb-1 font-semibold">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="ink-soft">{p.name}</span>
          <span className="font-semibold digits-fa">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
  series,
  height = 280,
}: {
  data: any[];
  series: { key: string; name: string; color: string }[];
  height?: number;
}) {
  const { grid, tick } = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey={Object.keys(data[0] || { date: 1 })[0]} tick={{ fill: tick, fontSize: 11 }}
               tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis tick={{ fill: tick, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<Box />} />
        {series.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color}
                strokeWidth={2.4} fill={`url(#g-${s.key})`} connectNulls dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({
  data, xKey, yKey, name, height = 260, colorByIndex = true,
}: {
  data: any[]; xKey: string; yKey: string; name: string; height?: number; colorByIndex?: boolean;
}) {
  const { grid, tick } = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: tick, fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={{ fill: tick, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<Box />} cursor={{ fill: grid }} />
        <Bar dataKey={yKey} name={name} radius={[10, 10, 4, 4]} maxBarSize={44}>
          {data.map((_, i) => (
            <Cell key={i} fill={colorByIndex ? PALETTE[i % PALETTE.length] : PALETTE[0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MiniLine({ data, color = "#6366f1", height = 60 }: { data: any[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
