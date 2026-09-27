"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MessageCircle, ThumbsUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Avatar, Button, Card, Pill, Spinner, inputCls, cx } from "@/components/ui";
import { kindLabel } from "@/components/PostCard";

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, num, locale } = useI18n();
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);
  const [text, setText] = useState("");
  const Arrow = locale === "fa" ? ArrowRight : ArrowLeft;

  useEffect(() => { api(`/posts/${id}`).then(setP).catch(() => {}); }, [id]);
  if (!p) return <Spinner />;

  const like = async () => {
    if (!user) return;
    const r = await api<any>(`/posts/${id}/like`, { method: "POST" });
    setP({ ...p, liked: r.liked, likes: r.likes });
  };

  const comment = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = await api<any>(`/posts/${id}/comments`, { method: "POST", body: { body: text } });
    setP({ ...p, comments: [...p.comments, c] });
    setText("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={p.condition ? `/community/${p.condition.slug}` : "/community"}
            className="inline-flex items-center gap-2 text-[13px] ink-soft hover:opacity-70">
        <Arrow size={15} /> {t("back")}
      </Link>

      <Card>
        <div className="flex items-center gap-3">
          <Avatar seed={p.author.seed} name={p.author.name} size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold">{p.author.name}</p>
            <p className="text-[11.5px] ink-soft digits-fa">
              {num(new Date(p.created_at).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-GB"))}
            </p>
          </div>
          <Pill>{kindLabel(p.kind, t)}</Pill>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold leading-9">{p.title}</h1>
        <p className="mt-4 whitespace-pre-line text-[14.5px] leading-9">{p.body}</p>

        <div className="mt-6 flex items-center gap-3 border-t hairline pt-4">
          <button onClick={like}
                  className={cx("flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition",
                    p.liked ? "bg-indigo-500/12 text-indigo-600 dark:text-indigo-300" : "bg-black/[.05] dark:bg-white/[.07]")}>
            <motion.span animate={p.liked ? { scale: [1, 1.3, 1] } : {}}><ThumbsUp size={15} /></motion.span>
            <span className="digits-fa">{num(p.likes)}</span> {t("likes")}
          </button>
          <span className="flex items-center gap-2 text-[13px] ink-soft">
            <MessageCircle size={15} /> <span className="digits-fa">{num(p.comments.length)}</span> {t("comments")}
          </span>
          {p.condition && (
            <Link href={`/community/${p.condition.slug}`} className="ms-auto">
              <Pill color={p.condition.accent}>{locale === "fa" ? p.condition.name_fa : p.condition.name_en}</Pill>
            </Link>
          )}
        </div>
      </Card>

      <Card delay={0.05}>
        <h2 className="mb-4 text-lg font-bold">{t("comments")}</h2>
        <div className="space-y-3">
          {p.comments.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex gap-3 rounded-2xl bg-black/[.035] dark:bg-white/[.05] p-4">
              <Avatar seed={c.author.seed} name={c.author.name} size={34} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{c.author.name}</p>
                <p className="mt-1 text-[13px] leading-7">{c.body}</p>
              </div>
            </motion.div>
          ))}
          {!p.comments.length && <p className="py-6 text-center text-[13px] ink-soft">—</p>}
        </div>

        {user ? (
          <form onSubmit={comment} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} required
                   placeholder={t("add_comment")} />
            <Button className="sm:w-32">{t("send")}</Button>
          </form>
        ) : (
          <Link href="/login" className="mt-5 block"><Button variant="soft" className="w-full">{t("login")}</Button></Link>
        )}
      </Card>
    </div>
  );
}
