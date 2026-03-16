import { useTranslation } from "@/lib/i18n";
import { useListDeployments, useListServices, useCreateDeployment, DeploymentStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExternalLink, Play, Square, Loader2, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDeploymentsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";

const StatusBadge = ({ status }: { status: DeploymentStatus }) => {
  const { t } = useTranslation();
  const styles = {
    running: "bg-green-500/10 text-green-500 border-green-500/20",
    deploying: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    stopped: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  const icons = {
    running: <Play className="w-3 h-3 mr-1" />,
    deploying: <Loader2 className="w-3 h-3 mr-1 animate-spin" />,
    stopped: <Square className="w-3 h-3 mr-1" />,
    failed: <AlertTriangle className="w-3 h-3 mr-1" />,
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {icons[status]}
      {t(`dash.status.${status}` as any)}
    </span>
  );
};

export default function Dashboard() {
  const { t, isAr } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  const { data: deployments, isLoading: loadingDeps } = useListDeployments();
  const { data: services, isLoading: loadingServices } = useListServices();
  const createDepMutation = useCreateDeployment();

  const handleDeploy = async (serviceId: number) => {
    try {
      await createDepMutation.mutateAsync({ data: { serviceId } });
      queryClient.invalidateQueries({ queryKey: getListDeploymentsQueryKey() });
    } catch (e) {
      alert(t("common.error"));
    }
  };

  const filteredServices = services?.filter(s => 
    (isAr ? s.nameAr : s.nameEn).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">{t("dash.title")}</h1>
        <p className="text-muted-foreground text-lg">Manage your cloud infrastructure</p>
      </div>

      {/* Active Deployments */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <div className="w-2 h-8 bg-primary rounded-full"></div>
          {t("dash.deployments")}
        </h2>
        
        {loadingDeps ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : deployments?.length === 0 ? (
          <Card className="p-12 text-center border-dashed bg-card/50">
            <CloudIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-foreground mb-2">{t("dash.no_deployments")}</h3>
            <p className="text-muted-foreground">Select a service below to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {deployments?.map(dep => (
              <Card key={dep.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-3xl shrink-0">
                    {dep.service?.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{isAr ? dep.service?.nameAr : dep.service?.nameEn}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={dep.status} />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(dep.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                {dep.status === "running" && dep.domainUrl && (
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <a href={dep.domainUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t("dash.open_btn")}
                    </a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Available Services */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-2 h-8 bg-secondary rounded-full"></div>
            {t("dash.available")}
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search services..." 
              className="pl-10 h-10 rounded-full" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loadingServices ? (
           <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices?.map(service => (
              <Card key={service.id} className="flex flex-col h-full hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border-border/60">
                <div className="p-6 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center text-4xl mb-6 shadow-inner">
                    {service.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{isAr ? service.nameAr : service.nameEn}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {isAr ? service.descAr : service.descEn}
                  </p>
                </div>
                <div className="p-6 pt-0 mt-auto border-t border-border/50 pt-4">
                  <Button 
                    className="w-full gap-2 group" 
                    onClick={() => handleDeploy(service.id)}
                    disabled={createDepMutation.isPending}
                  >
                    {createDepMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {t("dash.deploy_btn")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CloudIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>;
}
