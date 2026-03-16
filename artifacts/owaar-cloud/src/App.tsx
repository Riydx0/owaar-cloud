import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuthStore } from "./store/use-store";
import { useEffect } from "react";

// Pages
import Home from "./pages/home";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/admin";
import { Navbar } from "./components/layout/Navbar";
import { useGetMe } from "@workspace/api-client-react";

// Global Fetch Interceptor to inject Token
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const stateStr = localStorage.getItem("owaar-auth");
  let token = null;
  if (stateStr) {
    try {
      const state = JSON.parse(stateStr);
      token = state?.state?.token;
    } catch (e) {}
  }

  if (token) {
    init = init || {};
    init.headers = {
      ...init.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return originalFetch(input, init);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Wrapper
function ProtectedRoute({ component: Component, requireAdmin = false }: { component: any, requireAdmin?: boolean }) {
  const { token, user, clearAuth } = useAuthStore();
  const [, setLocation] = useLocation();
  const { data: serverUser, isError } = useGetMe({ query: { enabled: !!token } });

  useEffect(() => {
    if (!token || isError) {
      clearAuth();
      setLocation("/login");
    }
  }, [token, isError, setLocation, clearAuth]);

  if (!token) return null;
  
  if (requireAdmin && user?.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">Unauthorized</h1></div>;
  }

  return <Component />;
}

// Auth Route Wrapper (redirects to dash if already logged in)
function AuthRoute({ component: Component }: { component: any }) {
  const { token } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (token) {
      setLocation("/dashboard");
    }
  }, [token, setLocation]);

  if (token) return null;
  return <Component />;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login"><AuthRoute component={Login} /></Route>
          <Route path="/register"><AuthRoute component={Register} /></Route>
          <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
          <Route path="/admin"><ProtectedRoute component={Admin} requireAdmin={true} /></Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground mt-auto">
        <p>© {new Date().getFullYear()} OWAAR CLOUD. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
