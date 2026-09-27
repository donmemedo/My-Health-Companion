"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Users, Activity, BarChart3, ShieldCheck, ArrowLeft, ArrowRight, Sparkles, Stethoscope,
  ClipboardList, TrendingUp, HeartHandshake, Lock, EyeOff, Undo2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Button, Card, Pill, cx } from "@/components/ui";
import { TrendChart } from "@/components/Charts";

type Cond = {
  id: number; slug: string; name_fa: string; name_en: string;
  blurb_fa: string; blurb_en: string; accent: string; member_count: number;
};

const demoTrend = Array.from({ length: 22 }, (_, i) => ({
  d: `${i + 1}`,
  symptom: +(5.6 - i * 0.12 + Math.sin(i / 2.2) * 0.75).toFixed(2),
  quality: +(4.7 + i * 0.13 + Math.cos(i / 2.6) * 0.6).toFixed(2),
}));

function Counter({ to, duration = 1400 }: { to: number; duration?: number }) {
  const { num } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className="digits-fa">{num(n.toLocaleString("en-US"))}</span>;
}

export default function Home() {
  const { t, locale, num } = useI18n();
  const [conds, setConds] = useState<Cond[]>([]);
  const [stats, setStats] = useState<any>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const Arrow = locale === "fa" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    api<Cond[]>("/conditions").then(setConds).catch(() => {});
    api("/stats").then(setStats).catch(() => {});
  }, []);

  const features = [
    { icon: Users, t: t("f1_t"), b: t("f1_b"), c: "#6366f1" },
    { icon: Activity, t: t("f2_t"), b: t("f2_b"), c: "#14b8a6" },
    { icon: BarChart3, t: t("f3_t"), b: t("f3_b"), c: "#ec4899" },
  ];
  const steps = [
    { icon: HeartHandshake, t: t("how_1t"), b: t("how_1b") },
    { icon: ClipboardList, t: t("how_2t"), b: t("how_2b") },
    { icon: TrendingUp, t: t("how_3t"), b: t("how_3b") },
    { icon: Stethoscope, t: t("how_4t"), b: t("how_4b") },
  ];
  const trust = [
    { icon: Lock, label: t("trust_1") },
    { icon: EyeOff, label: t("trust_2") },
    { icon: Undo2, label: t("trust_3") },
  ];

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* HERO */}
      <section ref={heroRef} className="relative pt-6 sm:pt-12">
        <motion.div style={{ y, opacity: fade }} className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium"
            >
              <Sparkles size={13} className="text-indigo-500" />
              {t("hero_badge")}
            </motion.div>

            <h1 className="mt-6 text-[2.6rem] leading-[1.15] sm:text-6xl sm:leading-[1.08] font-extrabold tracking-tight">
              {t("hero_title_1").split(" ").map((w, i) => (
                <motion.span
                  key={i} className="inline-block me-[.28em]"
                  initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="block aurora-text"
              >
                {t("hero_title_2")}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.7 }}
              className="mt-6 max-w-xl text-[15px] sm:text-base leading-8 ink-soft"
            >
              {t("hero_body")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/login?mode=signup"><Button size="lg">{t("hero_cta")} <Arrow size={17} /></Button></Link>
              <Link href="/community"><Button size="lg" variant="soft">{t("hero_cta2")}</Button></Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
            >
              {trust.map((x) => (
                <li key={x.label} className="flex items-center gap-2 text-[12.5px] ink-soft">
                  <x.icon size={14} className="text-teal-500" />
                  {x.label}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* floating preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotateX: 8 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="card noise p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{t("trend_t")}</p>
                  <p className="text-[11px] ink-soft">{t("trend_sub")}</p>
                </div>
                <Pill color="#14b8a6">{t("kpi_week")}</Pill>
              </div>
              <TrendChart
                data={demoTrend}
                height={200}
                series={[
                  { key: "symptom", name: t("kpi_symptom"), color: "#6366f1" },
                  { key: "quality", name: t("kpi_quality"), color: "#14b8a6" },
                ]}
              />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="card absolute -bottom-8 start-0 w-52 !p-4 sm:-start-8"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-500" />
                <span className="text-[12px] font-semibold">{t("trust_2")}</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 ink-soft">{t("min_cohort")}: {num(5)}+</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { v: stats?.members ?? 0, l: t("stat_members") },
          { v: stats?.conditions ?? 0, l: t("stat_conditions") },
          { v: stats?.posts ?? 0, l: t("stat_posts") },
          { v: stats?.datapoints ?? 0, l: t("stat_datapoints") },
        ].map((s, i) => (
          <Card key={s.l} delay={i * 0.07} className="text-center">
            <p className="text-3xl sm:text-4xl font-extrabold aurora-text">
              <Counter to={s.v} />
            </p>
            <p className="mt-1.5 text-[12px] ink-soft">{s.l}</p>
          </Card>
        ))}
      </section>

      {/* FEATURES */}
      <section>
        <Head title={t("f_title")} sub={t("f_sub")} />
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f, i) => (
            <Card key={f.t} delay={i * 0.1} hover className="group">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:scale-110"
                style={{ background: `linear-gradient(140deg, ${f.c}, ${f.c}aa)`, boxShadow: `0 12px 30px -14px ${f.c}` }}
              >
                <f.icon size={21} />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.t}</h3>
              <p className="mt-2 text-[13.5px] leading-7 ink-soft">{f.b}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* COMMUNITIES */}
      <section>
        <Head title={t("comm_t")} sub={t("comm_sub")} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conds.map((c, i) => (
            <Link key={c.id} href={`/community/${c.slug}`}>
              <Card delay={i * 0.06} hover className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">{locale === "fa" ? c.name_fa : c.name_en}</h3>
                    <p className="mt-2 text-[12.5px] leading-6 ink-soft line-clamp-2">
                      {locale === "fa" ? c.blurb_fa : c.blurb_en}
                    </p>
                  </div>
                  <span className="h-10 w-10 shrink-0 rounded-2xl" style={{ background: `linear-gradient(140deg, ${c.accent}, ${c.accent}66)` }} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Pill color={c.accent}>{num(c.member_count)} {t("members")}</Pill>
                  <Arrow size={15} className="ink-soft" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section>
        <Head title={t("how_title")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.t} delay={i * 0.08} className="relative">
              <span className="absolute end-5 top-4 text-4xl font-black opacity-[.07]">{num(i + 1)}</span>
              <s.icon size={20} className="text-indigo-500" />
              <h3 className="mt-3 text-[15px] font-bold">{s.t}</h3>
              <p className="mt-1.5 text-[12.5px] leading-6 ink-soft">{s.b}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ETHICS */}
      <section>
        <Card className="!rounded-[2.25rem] overflow-hidden">
          <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr]">
            <div className="grid h-20 w-20 place-items-center rounded-[1.6rem] bg-[linear-gradient(140deg,#14b8a6,#6366f1)] text-white shadow-xl shadow-teal-500/20">
              <ShieldCheck size={34} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{t("ethics_t")}</h3>
              <p className="mt-3 max-w-3xl text-[14px] leading-8 ink-soft">{t("ethics_b")}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-[2.25rem] p-10 sm:p-16 text-center text-white"
               style={{ background: "linear-gradient(130deg,#4f46e5,#8b5cf6 45%,#0d9488)" }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="pointer-events-none absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-white/25 blur-3xl"
        />
        <h2 className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">{t("cta_t")}</h2>
        <p className="relative mt-4 text-[15px] opacity-90">{t("cta_b")}</p>
        <Link href="/login?mode=signup" className="relative mt-8 inline-block">
          <button className="h-14 rounded-full bg-white px-9 text-[15px] font-semibold text-indigo-700 shadow-2xl transition hover:scale-[1.03] active:scale-[.98]">
            {t("hero_cta")}
          </button>
        </Link>
      </section>
    </div>
  );
}

function Head({ title, sub }: { title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.55 }}
      className="mb-8 text-center"
    >
      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
      {sub && <p className="mt-3 text-sm ink-soft">{sub}</p>}
    </motion.div>
  );
}
