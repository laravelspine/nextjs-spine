"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Saat mount: kalau ada token tersimpan, validasi lewat /auth/me.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<AuthUser>("/api/v1/auth/me")
      .then((res) => {
        if (res.ok) setUser(res.data);
        else setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(token: string) {
    setToken(token);
    const res = await api<AuthUser>("/api/v1/auth/me");
    if (res.ok) setUser(res.data);
  }

  async function logout() {
    await api("/api/v1/auth/logout", { method: "POST" });
    setToken(null);
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, signIn, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
