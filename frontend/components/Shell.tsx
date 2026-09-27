"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Activity, Home, Users, BarChart3, LineChart, Moon, Sun, Languages, LogOut, Menu, X, HeartPulse,
} from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Avatar, Button, cx } from "./ui";

const NAV: { href: string; key: Key; icon: any; auth?: boolean }[] = [
  { href: "/", key: "nav_home", icon: Home },
  { href: "/community", key: "nav_community", icon: Users },
  { href: "/insights", key: "nav_insights", icon: BarChart3 },
  { href: "/dashboard", key: "nav_dashboard", icon: LineChart, auth: true },
  { href: "/track", key: "nav_track", icon: Activity, auth: true },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => !n.auth || user);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <nav className="glass mx-auto flex h-16 max-w-6xl items-center gap-2 rounded-full px-3 sm:px-5 shadow-[0_8px_36px_-20px_rgba(10,12,30,.5)]">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6_50%,#14b8a6)] text-white shadow-lg shadow-indigo-500/25">
              <HeartPulse size={18} />
            </span>
            <span className="hidden sm:block leading-tight">
              <span className="block text-[15px] font-bold tracking-tight">{t("brand")}</span>
              <span className="block text-[10px] ink-soft">{t("brandSub")}</span>
            </span>
          </Link>

          <div className="mx-auto hidden lg:flex items-center gap-1">
            {items.map((n) => {
              const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cx(
                    "relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                    active ? "text-indigo-600 dark:text-indigo-300" : "ink-soft hover:opacity-80"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-400/15"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t(n.key)}</span>
                </Link>
              );
            })}
          </div>

          <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
            <IconBtn onClick={() => setLocale(locale === "fa" ? "en" : "fa")} label="language">
              <Languages size={17} />
              <span className="text-[11px] font-semibold">{locale === "fa" ? "EN" : "فا"}</span>
            </IconBtn>
            <IconBtn onClick={toggle} label="theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                  className="grid place-items-center"
                >
                  {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                </motion.span>
              </AnimatePresence>
            </IconBtn>

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link href="/profile" className="hidden sm:flex items-center gap-2 rounded-full p-1 pe-3 hover:bg-black/[.04] dark:hover:bg-white/[.06] transition">
                  <Avatar seed={user.avatar_seed} name={user.display_name} size={32} />
                  <span className="text-[13px] font-medium max-w-24 truncate">{user.display_name}</span>
                </Link>
                <IconBtn onClick={logout} label="logout"><LogOut size={16} /></IconBtn>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button size="sm" variant="ghost">{t("login")}</Button>
                </Link>
                <Link href="/login?mode=signup">
                  <Button size="sm">{t("getStarted")}</Button>
                </Link>
              </>
            )}

            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-full hover:bg-black/[.05] dark:hover:bg-white/[.07]"
              aria-label="menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden mx-auto mt-2 max-w-6xl card p-2"
            >
              {items.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                >
                  <n.icon size={17} className="ink-soft" />
                  {t(n.key)}
                </Link>
              ))}
              <Link
                href={user ? "/profile" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
              >
                <Users size={17} className="ink-soft" />
                {user ? t("nav_profile") : t("login")}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-8 sm:px-6 lg:pb-16">{children}</main>

      <nav className="glass fixed bottom-3 z-50 mx-auto flex w-[calc(100%-1.5rem)] max-w-md items-center justify-around rounded-full p-1.5 inset-x-3 lg:hidden">
        {items.slice(0, 5).map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] transition-colors",
                active ? "text-white" : "ink-soft"
              )}
            >
              {active && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,#6366f1,#8b5cf6_60%,#14b8a6)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <n.icon size={17} className="relative z-10" />
              <span className="relative z-10">{t(n.key)}</span>
            </Link>
          );
        })}
      </nav>

      <footer className="border-t hairline px-4 py-8 text-center">
        <p className="mx-auto max-w-2xl text-xs ink-soft leading-6">{t("footer_note")}</p>
        <p className="mt-2 text-[11px] ink-soft opacity-70">
          © {new Date().getFullYear()} {t("brand")} — PatientsLikeMe Iran
        </p>
      </footer>
    </div>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-9 items-center gap-1 rounded-full px-2.5 transition hover:bg-black/[.05] dark:hover:bg-white/[.07]"
    >
      {children}
    </button>
  );
}
