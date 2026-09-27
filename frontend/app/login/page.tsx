"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button, Field, inputCls, Segmented, Spinner } from "@/components/ui";

function LoginInner() {
  const { t, locale } = useI18n();
  const { login, register, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [form, setForm] = useState({
    email: "", password: "", display_name: "", role: "patient", condition_slug: "",
  });
  const [conds, setConds] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api<any[]>("/conditions").then(setConds).catch(() => {}); }, []);
  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else
        await register({
          email: form.email, password: form.password, display_name: form.display_name,
          role: form.role, condition_slug: form.condition_slug || null,
        });
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "خطا");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-4">
      <motion.span
        initial={{ scale: 0.6, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[linear-gradient(135deg,#6366f1,#8b5cf6_50%,#14b8a6)] text-white shadow-2xl shadow-indigo-500/30"
      >
        <HeartPulse size={28} />
      </motion.span>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        {mode === "login" ? t("auth_login_t") : t("auth_signup_t")}
      </h1>

      <div className="mt-6">
        <Segmented
          value={mode}
          onChange={(v) => { setMode(v); setErr(""); }}
          options={[{ value: "login" as const, label: t("login") }, { value: "signup" as const, label: t("signup") }]}
        />
      </div>

      <motion.form layout onSubmit={submit} className="card mt-6 w-full space-y-4 !p-6">
        <AnimatePresence initial={false}>
          {mode === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden"
            >
              <Field label={t("name")}>
                <input className={inputCls} value={form.display_name} onChange={set("display_name")}
                       required={mode === "signup"} placeholder={locale === "fa" ? "مثلاً نیلوفر م." : "e.g. Sara M."} />
              </Field>
              <Field label={t("role")}>
                <select className={inputCls} value={form.role} onChange={set("role")}>
                  <option value="patient">{t("role_patient")}</option>
                  <option value="caregiver">{t("role_caregiver")}</option>
                  <option value="clinician">{t("role_clinician")}</option>
                  <option value="researcher">{t("role_researcher")}</option>
                </select>
              </Field>
              <Field label={t("pick_condition")}>
                <select className={inputCls} value={form.condition_slug} onChange={set("condition_slug")}>
                  <option value="">—</option>
                  {conds.map((c) => (
                    <option key={c.slug} value={c.slug}>{locale === "fa" ? c.name_fa : c.name_en}</option>
                  ))}
                </select>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <Field label={t("email")}>
          <input className={inputCls} type="email" dir="ltr" value={form.email} onChange={set("email")} required
                 placeholder="name@example.com" />
        </Field>
        <Field label={t("password")}>
          <input className={inputCls} type="password" dir="ltr" value={form.password} onChange={set("password")}
                 required minLength={6} placeholder="••••••••" />
        </Field>

        {err && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-rose-500/10 px-4 py-3 text-[13px] text-rose-600 dark:text-rose-400">
            {err}
          </motion.p>
        )}

        <Button className="w-full" size="lg" disabled={busy}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : mode === "login" ? t("login") : t("signup")}
        </Button>

        <div className="rounded-2xl bg-indigo-500/[.07] p-3 text-center">
          <p className="text-[12px] ink-soft">{t("demo_hint")}</p>
          <button type="button"
            onClick={() => { setMode("login"); setForm({ ...form, email: "demo@hamrahsalamat.ir", password: "demo1234" }); }}
            className="mt-1.5 text-[12.5px] font-semibold text-indigo-600 dark:text-indigo-300 hover:underline">
            {t("demo_fill")}
          </button>
        </div>
      </motion.form>

      <p className="mt-5 text-[13px] ink-soft">
        {mode === "login" ? t("no_account") : t("have_account")}{" "}
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="font-semibold text-indigo-600 dark:text-indigo-300 hover:underline">
          {mode === "login" ? t("signup") : t("login")}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginInner />
    </Suspense>
  );
}
