import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/store/use-store";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";

export default function Register() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const setAuth = useAuthStore(s => s.setAuth);
  
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await registerMutation.mutateAsync({ data: { name, email, password } });
      setAuth(data.token, data.user);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || t("common.error"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-card/80 border-white/10 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-primary">
            <UserIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">{t("nav.register")}</CardTitle>
          <CardDescription className="text-base mt-2">Create your cloud workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">{t("auth.name")}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-12" 
                  placeholder="John Doe" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-12" 
                  placeholder="name@company.com" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-12" 
                  placeholder="••••••••" 
                  minLength={6}
                  required 
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg mt-4" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t("common.loading") : t("nav.register")}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {t("auth.has_account")}{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              {t("nav.login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
