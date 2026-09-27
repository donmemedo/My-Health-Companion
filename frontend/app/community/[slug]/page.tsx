"use client";
import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, PenLine, Users } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button, Card, Empty, Field, PageTitle, Pill, Spinner, inputCls, cx } from "@/components/ui";
import PostCard from "@/components/PostCard";

export default function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t, num, locale } = useI18n();
  const { user, refresh } = useAuth();
  const [c, setC] = useState<any>(null);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", kind: "experience" });

  const load = async () => {
    setC(await api(`/conditions/${slug}`));
    setPosts(await api<any[]>(`/posts?condition=${slug}&limit=40`));
  };
  useEffect(() => { load().catch(() => setPosts([])); }, [slug]);

  const joined = !!user?.conditions?.some((x) => x.slug === slug);

  const toggleJoin = async () => {
    if (!c || !user) return;
    await api(`/conditions/${c.id}/join`, { method: "POST" });
    await refresh();
    load();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/posts", { method: "POST", body: { ...form, condition_id: c.id } });
    setForm({ title: "", body: "", kind: "experience" });
    setOpen(false);
    load();
  };

  if (!c) return <Spinner />;

  return (
    <div className="space-y-6">
      <Card className="!rounded-[2rem] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-28 opacity-25"
             style={{ background: `linear-gradient(120deg, ${c.accent}, transparent 70%)` }} />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="grid h-16 w-16 place-items-center rounded-3xl text-white shadow-xl"
                style={{ background: `linear-gradient(140deg, ${c.accent}, ${c.accent}99)` }}>
            <Users size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === "fa" ? c.name_fa : c.name_en}
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-7 ink-soft">
              {locale === "fa" ? c.blurb_fa : c.blurb_en}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill color={c.accent}>{num(c.member_count)} {t("members")}</Pill>
              <Pill>{num(c.post_count)} {t("stat_posts")}</Pill>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/insights?condition=${slug}`}><Button variant="soft">{t("ins_t")}</Button></Link>
            {user && (
              <Button onClick={toggleJoin} variant={joined ? "soft" : "primary"}>
                {joined ? <><Check size={16} /> {t("joined")}</> : t("join")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("feed")}</h2>
        {user && (
          <Button onClick={() => setOpen((v) => !v)} size="sm">
            <PenLine size={15} /> {t("new_post")}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card>
              <form onSubmit={submit} className="space-y-4">
                <div className="flex gap-2">
                  {(["experience", "question", "tip"] as const).map((k) => (
                    <button key={k} type="button" onClick={() => setForm({ ...form, kind: k })}
                            className={cx("rounded-full px-4 py-2 text-[12.5px] font-medium transition",
                              form.kind === k ? "bg-[linear-gradient(120deg,#6366f1,#14b8a6)] text-white"
                                              : "bg-black/[.05] dark:bg-white/[.07] ink-soft")}>
                      {t(`kind_${k}` as any)}
                    </button>
                  ))}
                </div>
                <Field label={t("post_title")}>
                  <input className={inputCls} value={form.title} required
                         onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </Field>
                <Field label={t("post_body")}>
                  <textarea className={cx(inputCls, "min-h-36 resize-none leading-7")} value={form.body} required
                            onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </Field>
                <Button size="lg" className="w-full">{t("send")}</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {posts === null ? <Spinner />
        : posts.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((p, i) => <PostCard key={p.id} p={p} delay={i * 0.05} />)}
          </div>
        ) : <Empty text={t("no_data")} />}
    </div>
  );
}
