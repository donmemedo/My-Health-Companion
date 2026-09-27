"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowDownRight, ArrowUpRight, Flame, HeartPulse, Pill as PillIcon, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Guard from "@/components/Guard";
import { Button, Card, Empty, PageTitle, Pill, Spinner, cx } from "@/components/ui";
import { BarsChart, TrendChart } from "@/components/Charts";

function Kpi({ label, value, unit, delta, icon: Icon, color, delay }: any) {
  const { num } = useI18n();
  const up = delta != null && delta > 0;
  return (
    <Card delay={delay} hover className="!p-5">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-2xl text-white"
              style={{ background: `linear-gradient(140deg, ${color}, ${color}aa)` }}>
          <Icon size={18} />
        </span>
        {delta != null && (
          <span className={cx("flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
            up ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-teal-500/10 text-teal-600 dark:text-teal-400")}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {num(Math.abs(delta).toFixed(1))}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold digits-fa">
        {value == null ? "—" : num(value)}
        {unit && <span className="ms-1 text-[12px] font-medium ink-soft">{unit}</span>}
      </p>
      <p className="mt-0.5 text-[12px] ink-soft">{label}</p>
    </Card>
  );
}

function Inner() {
  const { t, num, locale } = useI18n();
  const { user } = useAuth();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState(false);

  useEffect(() => { api("/dashboard?days=60").then(setD).catch(() => setErr(true)); }, []);
  if (err)
    return (
      <Empty
        text={t("no_data")}
        action={<Button onClick={() => location.reload()}>{t("continue")}</Button>}
      />
    );
  if (!d) return <Spinner />;

  const k = d.kpi;
  const delta = k.symptom_7d != null && k.symptom_prev7d != null ? k.symptom_7d - k.symptom_prev7d : null;
  const labKeys = Object.keys(d.labs || {});

  return (
    <div className="space-y-5">
      <PageTitle title={`${t("dash_hi")} ${user?.display_name} 👋`} sub={t("dash_sub")} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={`${t("kpi_symptom")} · ${t("kpi_week")}`} value={k.symptom_7d} delta={delta}
             icon={Activity} color="#6366f1" delay={0} />
        <Kpi label={t("kpi_quality")} value={k.quality_7d} icon={HeartPulse} color="#14b8a6" delay={0.06} />
        <Kpi label={t("kpi_adherence")} value={k.adherence_7d} unit="٪" icon={PillIcon} color="#f59e0b" delay={0.12} />
        <Kpi label={t("kpi_streak")} value={k.streak} icon={Flame} color="#ec4899" delay={0.18} />
      </div>

      <Card delay={0.1}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{t("trend_t")}</h2>
            <p className="text-[12px] ink-soft">{t("trend_sub")}</p>
          </div>
          <Link href="/track"><Button size="sm" variant="soft">{t("track_t")}</Button></Link>
        </div>
        {d.trend.length ? (
          <TrendChart
            data={d.trend.map((r: any) => ({ ...r, date: num(r.date.slice(5)) }))}
            height={300}
            series={[
              { key: "symptom", name: t("kpi_symptom"), color: "#6366f1" },
              { key: "quality", name: t("kpi_quality"), color: "#14b8a6" },
            ]}
          />
        ) : (
          <Empty text={t("no_data")} action={<Link href="/track"><Button size="sm">{t("add_first")}</Button></Link>} />
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card delay={0.05}>
          <h2 className="mb-4 text-lg font-bold">{t("top_symptoms")}</h2>
          {d.top_symptoms.length ? (
            <div className="space-y-3">
              {d.top_symptoms.map((s: any, i: number) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="font-medium">{s.label}</span>
                    <span className="ink-soft digits-fa">{num(s.avg)} / {num(10)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.07]">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${s.avg * 10}%` }}
                      transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg,#6366f1,#8b5cf6,#14b8a6)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty text={t("no_data")} />}
        </Card>

        <Card delay={0.12}>
          <h2 className="mb-4 text-lg font-bold">{t("my_communities")}</h2>
          <div className="flex flex-wrap gap-2">
            {(user?.conditions || []).map((c) => (
              <Link key={c.id} href={`/community/${c.slug}`}>
                <Pill color={c.accent}>{locale === "fa" ? c.name_fa : c.name_en}</Pill>
              </Link>
            ))}
            {!user?.conditions?.length && <p className="text-[13px] ink-soft">—</p>}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-black/[.04] dark:bg-white/[.05] p-4">
              <p className="text-2xl font-extrabold digits-fa">{num(d.treatments)}</p>
              <p className="text-[11px] ink-soft">{t("active_treatments")}</p>
            </div>
            <div className="rounded-2xl bg-black/[.04] dark:bg-white/[.05] p-4">
              <p className="text-2xl font-extrabold digits-fa">{num(k.entries_total)}</p>
              <p className="text-[11px] ink-soft">{t("stat_datapoints")}</p>
            </div>
          </div>
        </Card>
      </div>

      {labKeys.length > 0 && (
        <Card delay={0.05}>
          <h2 className="mb-4 text-lg font-bold">{t("labs_t")}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {labKeys.map((key) => (
              <div key={key}>
                <p className="mb-2 text-[13px] font-medium">
                  {key} <span className="ink-soft">{d.labs[key][0]?.unit}</span>
                </p>
                <BarsChart
                  data={d.labs[key].map((r: any) => ({ x: num(r.date.slice(5)), v: r.value }))}
                  xKey="x" yKey="v" name={key} height={170} colorByIndex={false}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function Page() {
  return <Guard><Inner /></Guard>;
}
