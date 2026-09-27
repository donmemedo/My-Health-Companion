"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button, Empty, Spinner } from "./ui";

export default function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <Spinner />;
  if (!user)
    return (
      <Empty
        text={t("need_login")}
        action={<Link href="/login"><Button>{t("login")}</Button></Link>}
      />
    );
  return <>{children}</>;
}
