import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useListServices } from "@workspace/api-client-react";
import { Server, Shield, Zap, ArrowRight, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { t, isAr } = useTranslation();
  const { data: services, isLoading } = useListServices();

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative w-full py-24 lg:py-32 overflow-hidden flex items-center justify-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-6"
          >
            {t("hero.title")}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-[700px] text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto gap-2 group">
                {t("nav.register")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t("nav.login")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("features.title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("feature.1.title")}</h3>
              <p className="text-muted-foreground">{t("feature.1.desc")}</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("feature.2.title")}</h3>
              <p className="text-muted-foreground">{t("feature.2.desc")}</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("feature.3.title")}</h3>
              <p className="text-muted-foreground">{t("feature.3.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("dash.available")}</h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services?.slice(0, 8).map((service) => (
                <div key={service.id} className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{isAr ? service.nameAr : service.nameEn}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{isAr ? service.descAr : service.descEn}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
