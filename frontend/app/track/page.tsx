"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Guard from "@/components/Guard";
import { Button, Card, Empty, Field, PageTitle, Pill, Segmented, inputCls, cx } from "@/components/ui";

const SUGGEST: Record<string, string[]> = {
  fa: ["خستگی", "درد", "بی‌خوابی", "تهوع", "سرگیجه", "تنگی نفس", "اضطراب", "تاری دید"],
  en: ["Fatigue", "Pain", "Insomnia", "Nausea", "Dizziness", "Shortness of breath", "Anxiety", "Blurred vision"],
};

type Tab = "symptom" | "quality" | "lab" | "treatment";

function Inner() {
  const { t, num, locale } = useI18n();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("symptom");
  const [entries, setEntries] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [ok, setOk] = useState(false);
  const [form, setForm] = useState({ label: "", value: 5, unit: "", note: "" });
  const [tf, setTf] = useState({ name: "", dosage: "", purpose: "", effectiveness: 3, side_effects: "" });

  const load = async () => {
    setEntries(await api<any[]>("/entries?days=120&limit=60"));
    setTreatments(await api<any[]>("/treatments"));
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const flash = () => { setOk(true); setTimeout(() => setOk(false), 1800); };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const kind = tab === "quality" ? "quality" : tab;
    await api("/entries", {
      method: "POST",
      body: {
        kind,
        label: tab === "quality" ? (locale === "fa" ? "کیفیت زندگی" : "Quality of life") : form.label,
        value: Number(form.value),
        unit: tab === "lab" ? form.unit : locale === "fa" ? "۰ تا ۱۰" : "0–10",
        note: form.note,
        condition_id: user?.conditions?.[0]?.id ?? null,
      },
    });
    setForm({ label: "", value: 5, unit: "", note: "" });
    flash();
    load();
  };

  const saveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/treatments", { method: "POST", body: { ...tf, condition_id: user?.conditions?.[0]?.id ?? null } });
    setTf({ name: "", dosage: "", purpose: "", effectiveness: 3, side_effects: "" });
    flash();
    load();
  };

  const visible = entries.filter((e) => (tab === "treatment" ? false : e.kind === (tab === "quality" ? "quality" : tab)));

  return (
    <div className="space-y-5">
      <PageTitle title={t("track_t")} sub={t("track_sub")} />

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "symptom" as const, label: t("tab_symptom") },
          { value: "quality" as const, label: t("tab_quality") },
          { value: "lab" as const, label: t("tab_lab") },
          { value: "treatment" as const, label: t("tab_treatment") },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        {tab !== "treatment" ? (
          <Card>
            <form onSubmit={saveEntry} className="space-y-4">
              {tab !== "quality" && (
                <>
                  <Field label={t("label")}>
                    <input className={inputCls} value={form.label} required
                           onChange={(e) => setForm({ ...form, label: e.target.value })}
                           placeholder={tab === "lab" ? "HbA1c" : SUGGEST[locale][0]} />
                  </Field>
                  {tab === "symptom" && (
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGEST[locale].map((s) => (
                        <button key={s} type="button" onClick={() => setForm({ ...form, label: s })}
                                className="rounded-full border px-3 py-1.5 text-[12px] transition hover:bg-black/[.05] dark:hover:bg-white/[.07]">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "lab" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("value")}>
                    <input className={inputCls} type="number" step="0.1" dir="ltr" value={form.value}
                           onChange={(e) => setForm({ ...form, value: +e.target.value })} required />
                  </Field>
                  <Field label={t("unit")}>
                    <input className={inputCls} value={form.unit}
                           onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="mg/dL" />
                  </Field>
                </div>
              ) : (
                <Field label={tab === "quality" ? t("kpi_quality") : t("severity")}>
                  <div className="pt-1">
                    <input type="range" min={0} max={10} step={0.5} value={form.value}
                           onChange={(e) => setForm({ ...form, value: +e.target.value })}
                           className="w-full accent-indigo-500" />
                    <div className="mt-2 flex items-center justify-between text-[12px] ink-soft">
                      <span>{num(0)}</span>
                      <motion.span key={form.value} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                   className="rounded-full bg-indigo-500/12 px-3 py-1 text-[15px] font-bold text-indigo-600 dark:text-indigo-300 digits-fa">
                        {num(form.value)}
                      </motion.span>
                      <span>{num(10)}</span>
                    </div>
                  </div>
                </Field>
              )}

              <Field label={t("note")}>
                <textarea className={cx(inputCls, "min-h-20 resize-none")} value={form.note}
                          onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </Field>

              <Button className="w-full" size="lg">
                <AnimatePresence mode="wait" initial={false}>
                  {ok ? (
                    <motion.span key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                 exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Check size={17} /> {t("saved")}
                    </motion.span>
                  ) : (
                    <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {t("save")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </Card>
        ) : (
          <Card>
            <form onSubmit={saveTreatment} className="space-y-4">
              <Field label={t("t_name")}>
                <input className={inputCls} value={tf.name} required
                       onChange={(e) => setTf({ ...tf, name: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("t_dose")}>
                  <input className={inputCls} value={tf.dosage} onChange={(e) => setTf({ ...tf, dosage: e.target.value })} />
                </Field>
                <Field label={t("t_purpose")}>
                  <input className={inputCls} value={tf.purpose} onChange={(e) => setTf({ ...tf, purpose: e.target.value })} />
                </Field>
              </div>
              <Field label={t("t_effect")}>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setTf({ ...tf, effectiveness: n })}
                            className={cx("h-10 flex-1 rounded-xl text-[13px] font-semibold transition",
                              tf.effectiveness >= n
                                ? "bg-[linear-gradient(120deg,#6366f1,#14b8a6)] text-white"
                                : "bg-black/[.05] dark:bg-white/[.07] ink-soft")}>
                      {num(n)}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t("t_side")}>
                <input className={inputCls} value={tf.side_effects}
                       onChange={(e) => setTf({ ...tf, side_effects: e.target.value })} />
              </Field>
              <Button className="w-full" size="lg"><Plus size={17} /> {ok ? t("saved") : t("t_add")}</Button>
            </form>
          </Card>
        )}

        <Card delay={0.08}>
          <h2 className="mb-4 text-lg font-bold">{tab === "treatment" ? t("tab_treatment") : t("recent")}</h2>
          <div className="max-h-[30rem] space-y-2 overflow-y-auto pe-1">
            {tab === "treatment" ? (
              treatments.length ? treatments.map((x) => (
                <motion.div key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 rounded-2xl bg-black/[.035] dark:bg-white/[.05] p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{x.name} <span className="ink-soft font-normal">{x.dosage}</span></p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] ink-soft">
                      <Pill color={x.active ? "#14b8a6" : "#94a3b8"}>{x.active ? t("t_active") : t("t_stopped")}</Pill>
                      <span>{t("t_effect")}: {num(x.effectiveness)}/{num(5)}</span>
                      {x.side_effects && <span>· {x.side_effects}</span>}
                    </p>
                  </div>
                  <button onClick={async () => { await api(`/treatments/${x.id}`, { method: "DELETE" }); load(); }}
                          className="rounded-full p-2 text-rose-500 transition hover:bg-rose-500/10">
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              )) : <Empty text={t("no_data")} />
            ) : visible.length ? visible.map((x) => (
              <motion.div key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 rounded-2xl bg-black/[.035] dark:bg-white/[.05] p-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[13px] font-bold text-white digits-fa"
                      style={{ background: `linear-gradient(140deg,hsl(${250 - x.value * 12} 75% 60%),hsl(${270 - x.value * 12} 70% 52%))` }}>
                  {num(x.value)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{x.label}</p>
                  <p className="text-[11.5px] ink-soft digits-fa">
                    {num(new Date(x.recorded_at).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-GB"))}
                    {x.unit && ` · ${x.unit}`}{x.note && ` · ${x.note}`}
                  </p>
                </div>
                <button onClick={async () => { await api(`/entries/${x.id}`, { method: "DELETE" }); load(); }}
                        className="rounded-full p-2 text-rose-500 transition hover:bg-rose-500/10">
                  <Trash2 size={15} />
                </button>
              </motion.div>
            )) : <Empty text={t("no_data")} />}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return <Guard><Inner /></Guard>;
}
