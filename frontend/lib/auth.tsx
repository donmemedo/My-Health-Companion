"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

export type User = {
  id: number;
  email: string;
  display_name: string;
  avatar_seed: string;
  bio: string;
  city: string;
  year_of_birth: number | null;
  gender: string;
  role: string;
  research_consent: boolean;
  conditions?: { id: number; slug: string; name_fa: string; name_en: string; accent: string }[];
};

const Ctx = createContext<{
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await api<User>("/auth/me"));
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const r = await api<{ token: string }>("/auth/login", { method: "POST", body: { email, password } });
    localStorage.setItem("token", r.token);
    await refresh();
  };

  const register = async (data: any) => {
    const r = await api<{ token: string }>("/auth/register", { method: "POST", body: data });
    localStorage.setItem("token", r.token);
    await refresh();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, refresh, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
