"use client";
import Link from "next/link";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, Card, Pill } from "./ui";

export function kindLabel(kind: string, t: any) {
  return kind === "question" ? t("kind_question") : kind === "tip" ? t("kind_tip") : t("kind_experience");
}
const kindColor: Record<string, string> = { question: "#f59e0b", tip: "#14b8a6", experience: "#6366f1" };

export default function PostCard({ p, delay = 0 }: { p: any; delay?: number }) {
  const { t, num, locale } = useI18n();
  const { user } = useAuth();
  const [liked, setLiked] = useState(p.liked);
  const [likes, setLikes] = useState(p.likes);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    const r = await api<{ liked: boolean; likes: number }>(`/posts/${p.id}/like`, { method: "POST" });
    setLiked(r.liked);
    setLikes(r.likes);
  };

  return (
    <Link href={`/post/${p.id}`}>
      <Card delay={delay} hover className="h-full">
        <div className="flex items-center gap-3">
          <Avatar seed={p.author.seed} name={p.author.name} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold">{p.author.name}</p>
            <p className="text-[11px] ink-soft digits-fa">
              {num(new Date(p.created_at).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-GB"))}
            </p>
          </div>
          <Pill color={kindColor[p.kind]}>{kindLabel(p.kind, t)}</Pill>
        </div>

        <h3 className="mt-4 text-[16px] font-bold leading-7">{p.title}</h3>
        <p className="mt-2 line-clamp-3 text-[13px] leading-7 ink-soft">{p.body}</p>

        <div className="mt-4 flex items-center gap-4 text-[12px] ink-soft">
          {p.condition && (
            <Pill color={p.condition.accent}>{locale === "fa" ? p.condition.name_fa : p.condition.name_en}</Pill>
          )}
          <button onClick={toggle}
                  className="ms-auto flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-black/[.05] dark:hover:bg-white/[.07]">
            <motion.span animate={liked ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.35 }}>
              <ThumbsUp size={14} className={liked ? "fill-indigo-500 text-indigo-500" : ""} />
            </motion.span>
            <span className="digits-fa">{num(likes)}</span>
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={14} /> <span className="digits-fa">{num(p.comment_count ?? 0)}</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
