"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Card, Empty, PageTitle, Pill, Segmented, Spinner } from "@/components/ui";
import { BarsChart, PALETTE, TrendChart } from "@/components/Charts";

function Inner() {
  const { t, num, locale } = useI18n();
  const params = useSearchParams();
  const [conds, setConds] = useState<any[]>([]);
  const [slug, setSlug] = useState<string>(params.get("condition") || "");
  const [d, setD] = useState<any>(null);

  useEffect(() => { api<any[]>("/conditions").then(setConds).catch(() => {}); }, []);
  useEffect(() => {
    setD(null);
    api(`/insights${slug ? `?condition=${slug}` : ""}`).then(setD).catch(() => {});
  }, [slug]);

  return (
    <div className="space-y-5">
      <PageTitle title={t("ins_t")} sub={t("ins_sub")} />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={slug}
          onChange={setSlug}
          options={[{ value: "", label: t("all") },
                    ...conds.map((c) => ({ value: c.slug, label: locale === "fa" ? c.name_fa : c.name_en }))]}
        />
      </div>

      {!d ? <Spinner /> : (
        <>
          <Card className="!rounded-[1.75rem]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(140deg,#14b8a6,#6366f1)] text-white">
                <ShieldCheck size={22} />
              </span>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <p className="text-2xl font-extrabold digits-fa">{num(d.cohort_size)}</p>
                  <p className="text-[11.5px] ink-soft">{t("cohort")}</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold digits-fa">{num(d.min_cohort)}</p>
                  <p className="text-[11.5px] ink-soft">{t("min_cohort")}</p>
                </div>
              </div>
              <p className="ms-auto max-w-sm text-[12px] leading-6 ink-soft">{t("ethics_b")}</p>
            </div>
          </Card>

          {d.suppressed ? <Empty text={t("suppressed")} /> : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card delay={0.05}>
                  <h2 className="mb-4 text-lg font-bold">{t("ins_symptoms")}</h2>
                  {d.symptoms.length ? (
                    <div className="space-y-3">
                      {d.symptoms.map((s: any, i: number) => (
                        <div key={s.label}>
                          <div className="mb-1.5 flex items-center justify-between text-[13px]">
                            <span className="font-medium">{s.label}</span>
                            <span className="ink-soft digits-fa">
                              {num(s.people)} {t("people")} · {num(s.avg_severity)}
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.07]">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.avg_severity * 10}%` }}
                                        transition={{ duration: 0.9, delay: i * 0.06 }}
                                        className="h-full rounded-full"
                                        style={{ background: PALETTE[i % PALETTE.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <Empty text={t("no_data")} />}
                </Card>

                <Card delay={0.1}>
                  <h2 className="mb-4 text-lg font-bold">{t("ins_trend")}</h2>
                  {d.trend.length ? (
                    <TrendChart
                      data={d.trend.map((r: any) => ({ ...r, month: num(r.month) }))}
                      height={260}
                      series={[
                        { key: "symptom", name: t("kpi_symptom"), color: "#6366f1" },
                        { key: "quality", name: t("kpi_quality"), color: "#14b8a6" },
                      ]}
                    />
                  ) : <Empty text={t("no_data")} />}
                </Card>
              </div>

              <Card delay={0.05}>
                <h2 className="mb-4 text-lg font-bold">{t("ins_treatments")}</h2>
                {d.treatments.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[34rem] text-[13px]">
                      <thead>
                        <tr className="ink-soft text-[11.5px]">
                          <th className="p-2 text-start font-medium">{t("t_name")}</th>
                          <th className="p-2 text-start font-medium">{t("people")}</th>
                          <th className="p-2 text-start font-medium">{t("effectiveness")}</th>
                          <th className="p-2 text-start font-medium">{t("side_rate")}</th>
                          <th className="p-2 text-start font-medium">{t("still")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.treatments.map((x: any, i: number) => (
                          <motion.tr key={x.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: i * 0.05 }} className="border-t hairline">
                            <td className="p-2.5 font-medium">{x.name}</td>
                            <td className="p-2.5 digits-fa">{num(x.people)}</td>
                            <td className="p-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-16 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]">
                                  <div className="h-full rounded-full"
                                       style={{ width: `${(x.effectiveness / 5) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                                </div>
                                <span className="digits-fa">{num(x.effectiveness)}</span>
                              </div>
                            </td>
                            <td className="p-2.5 digits-fa">{num(x.side_effect_rate)}٪</td>
                            <td className="p-2.5 digits-fa">{num(x.still_taking)}٪</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <Empty text={t("no_data")} />}
              </Card>

              {d.demographics.length > 0 && (
                <Card delay={0.05}>
                  <h2 className="mb-4 text-lg font-bold">{t("ins_demo")}</h2>
                  <BarsChart data={d.demographics.map((x: any) => ({ x: x.bucket, v: x.count }))}
                             xKey="x" yKey="v" name={t("people")} height={230} />
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<Spinner />}><Inner /></Suspense>;
}
