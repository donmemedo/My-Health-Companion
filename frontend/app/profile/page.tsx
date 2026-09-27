"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Guard from "@/components/Guard";
import { Avatar, Button, Card, Field, PageTitle, Pill, inputCls, cx } from "@/components/ui";

function Inner() {
  const { t, locale } = useI18n();
  const { user, refresh, logout } = useAuth();
  const [f, setF] = useState<any>({});
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (user)
      setF({
        display_name: user.display_name, bio: user.bio, city: user.city,
        year_of_birth: user.year_of_birth ?? "", gender: user.gender,
        research_consent: user.research_consent,
      });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/auth/me", {
      method: "PATCH",
      body: { ...f, year_of_birth: f.year_of_birth ? Number(f.year_of_birth) : null },
    });
    await refresh();
    setOk(true);
    setTimeout(() => setOk(false), 1800);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageTitle title={t("prof_t")} />

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar seed={user.avatar_seed} name={user.display_name} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">{user.display_name}</p>
            <p className="text-[12px] ink-soft" dir="ltr">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(user.conditions || []).map((c) => (
                <Link key={c.id} href={`/community/${c.slug}`}>
                  <Pill color={c.accent}>{locale === "fa" ? c.name_fa : c.name_en}</Pill>
                </Link>
              ))}
            </div>
          </div>
          <Button variant="danger" onClick={logout}>{t("logout")}</Button>
        </div>
      </Card>

      <Card delay={0.05}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("name")}>
              <input className={inputCls} value={f.display_name || ""}
                     onChange={(e) => setF({ ...f, display_name: e.target.value })} />
            </Field>
            <Field label={t("city")}>
              <input className={inputCls} value={f.city || ""} onChange={(e) => setF({ ...f, city: e.target.value })} />
            </Field>
            <Field label={t("birth")}>
              <input className={inputCls} type="number" dir="ltr" value={f.year_of_birth || ""}
                     onChange={(e) => setF({ ...f, year_of_birth: e.target.value })} placeholder="1365" />
            </Field>
            <Field label={t("gender")}>
              <select className={inputCls} value={f.gender || ""} onChange={(e) => setF({ ...f, gender: e.target.value })}>
                <option value="">—</option>
                <option value="f">{t("g_f")}</option>
                <option value="m">{t("g_m")}</option>
                <option value="other">{t("g_o")}</option>
              </select>
            </Field>
          </div>
          <Field label={t("bio")}>
            <textarea className={cx(inputCls, "min-h-24 resize-none leading-7")} value={f.bio || ""}
                      onChange={(e) => setF({ ...f, bio: e.target.value })} />
          </Field>

          <button type="button" onClick={() => setF({ ...f, research_consent: !f.research_consent })}
                  className="flex w-full items-start gap-3 rounded-2xl bg-black/[.035] dark:bg-white/[.05] p-4 text-start transition hover:bg-black/[.06] dark:hover:bg-white/[.08]">
            <span className={cx("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg transition",
              f.research_consent ? "bg-[linear-gradient(120deg,#6366f1,#14b8a6)] text-white" : "bg-black/10 dark:bg-white/15")}>
              {f.research_consent && <Check size={14} />}
            </span>
            <span>
              <span className="flex items-center gap-2 text-[13.5px] font-semibold">
                <ShieldCheck size={15} className="text-teal-500" /> {t("consent_t")}
              </span>
              <span className="mt-1 block text-[12px] leading-6 ink-soft">{t("consent_b")}</span>
            </span>
          </button>

          <Button size="lg" className="w-full">
            {ok ? <motion.span initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <Check size={17} /> {t("updated")}</motion.span> : t("update")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function Page() { return <Guard><Inner /></Guard>; }
