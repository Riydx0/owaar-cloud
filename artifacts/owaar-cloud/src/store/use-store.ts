import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@workspace/api-client-react";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        if (next === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ theme: next });
      },
    }),
    {
      name: "owaar-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },
    }
  )
);

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: "owaar-auth" }
  )
);

type Language = "en" | "ar";

interface LangState {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: "ltr" | "rtl";
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "en",
      dir: "ltr",
      setLang: (lang) => {
        const dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
        set({ lang, dir });
      },
    }),
    { 
      name: "owaar-lang",
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.dir = state.dir;
          document.documentElement.lang = state.lang;
        }
      }
    }
  )
);
