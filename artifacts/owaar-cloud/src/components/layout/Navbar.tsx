import { Link, useLocation } from "wouter";
import { Globe, LogOut, Cloud, Menu, X, Sun, Moon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore, useLangStore, useThemeStore } from "@/store/use-store";
import { useState } from "react";
import { useLogout, useGetSettings } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t, isAr } = useTranslation();
  const { lang, setLang } = useLangStore();
  const { user, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [_, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutMutation = useLogout();
  const { data: settings } = useGetSettings();

  const siteNameSetting = settings?.find(s => s.key === 'site_name');
  const siteName = isAr
    ? (siteNameSetting?.valueAr || "أوار كلاود")
    : (siteNameSetting?.valueEn || "OWAAR CLOUD");
  const logoUrl = settings?.find(s => s.key === 'site_logo')?.valueEn;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch(e) {
      // ignore
    } finally {
      clearAuth();
      setLocation("/");
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "ar" : "en");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b-0 border-b-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 group-hover:glow-primary transition-all duration-300">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <Cloud className="w-6 h-6 text-primary" />
              )}
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              {siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
            >
              <Globe className="w-4 h-4" />
              {lang === "en" ? "العربية" : "English"}
            </button>

            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="w-px h-6 bg-border/50" />

            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.dashboard")}
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    {t("nav.admin")}
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-2 pl-4 border-l border-border/50">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-foreground leading-none">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-4 py-2">
                  {t("nav.login")}
                </Link>
                <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-card"
          >
            <div className="flex flex-col p-4 gap-4">
              <button onClick={toggleLang} className="flex items-center gap-2 text-sm p-2">
                <Globe className="w-4 h-4" /> {lang === "en" ? "العربية" : "English"}
              </button>
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm p-2 text-muted-foreground">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? (isAr ? "الوضع الفاتح" : "Light Mode") : (isAr ? "الوضع الداكن" : "Dark Mode")}
              </button>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="p-2">{t("nav.dashboard")}</Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="p-2 text-primary">{t("nav.admin")}</Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-2 p-2 text-destructive">
                    <LogOut className="w-4 h-4" /> {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="p-2">{t("nav.login")}</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="p-2 text-primary font-bold">{t("nav.register")}</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
