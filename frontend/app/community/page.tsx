"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Card, Empty, PageTitle, Pill, Segmented, Spinner } from "@/components/ui";
import PostCard from "@/components/PostCard";

export default function CommunityPage() {
  const { t, num, locale } = useI18n();
  const [conds, setConds] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [kind, setKind] = useState<"all" | "experience" | "question" | "tip">("all");

  useEffect(() => { api<any[]>("/conditions").then(setConds).catch(() => {}); }, []);
  useEffect(() => {
    setPosts(null);
    api<any[]>(`/posts?limit=40${kind === "all" ? "" : `&kind=${kind}`}`).then(setPosts).catch(() => setPosts([]));
  }, [kind]);

  return (
    <div className="space-y-8">
      <PageTitle title={t("comm_t")} sub={t("comm_sub")} />

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {conds.map((c, i) => (
          <Link key={c.id} href={`/community/${c.slug}`} className="shrink-0">
            <Card delay={i * 0.05} hover className="w-56 !p-4">
              <span className="block h-9 w-9 rounded-2xl"
                    style={{ background: `linear-gradient(140deg, ${c.accent}, ${c.accent}66)` }} />
              <p className="mt-3 text-[14px] font-bold">{locale === "fa" ? c.name_fa : c.name_en}</p>
              <p className="mt-2 text-[11.5px] ink-soft digits-fa">{num(c.member_count)} {t("members")}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{t("feed")}</h2>
        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            { value: "all" as const, label: t("all") },
            { value: "experience" as const, label: t("kind_experience") },
            { value: "question" as const, label: t("kind_question") },
            { value: "tip" as const, label: t("kind_tip") },
          ]}
        />
      </div>

      {posts === null ? <Spinner />
        : posts.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((p, i) => <PostCard key={p.id} p={p} delay={i * 0.05} />)}
          </div>
        ) : <Empty text={t("no_data")} />}
    </div>
  );
}
