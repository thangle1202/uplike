import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ServiceSidebar } from "@/components/layout/ServiceSidebar";
import { ServiceDetailPanel } from "@/components/layout/ServiceDetailPanel";
import { HomePanel } from "@/components/layout/HomePanel";
import { ContactFloat } from "@/components/ContactFloat";
import { Platform, Service } from "@/types/service";

export default function Index() {
  const { platformId, serviceId } = useParams<{ platformId?: string; serviceId?: string }>();
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  const isHome = !platformId && !serviceId;

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const list: Platform[] = Array.isArray(data) ? data : [];
        setPlatforms(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activePlatform = platformId ? platforms.find((p) => p.id === platformId) : undefined;
  const activeService: Service | undefined = activePlatform?.services.find(
    (s) => s.id === serviceId
  );

  useEffect(() => {
    if (!loading && platforms.length > 0 && platformId && serviceId) {
      if (!activePlatform || !activeService) {
        navigate("/", { replace: true });
      }
    }
  }, [loading, platforms, platformId, serviceId, activePlatform, activeService, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen mesh-bg">
        <div className="w-[280px] sidebar-gradient animate-pulse" />
        <div className="flex-1 p-8 space-y-5">
          <div className="h-6 w-48 bg-white/60 rounded-xl animate-pulse" />
          <div className="h-10 w-72 bg-white/60 rounded-xl animate-pulse" />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="h-28 glass-card rounded-2xl animate-pulse" />
            <div className="h-28 glass-card rounded-2xl animate-pulse" />
            <div className="h-28 glass-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (platforms.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Không có dịch vụ nào.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ServiceSidebar
        platforms={platforms}
        activePlatformId={platformId}
        activeServiceId={serviceId}
      />
      {isHome ? (
        <HomePanel platforms={platforms} />
      ) : activePlatform && activeService ? (
        <ServiceDetailPanel platform={activePlatform} service={activeService} />
      ) : null}
      <ContactFloat />
    </div>
  );
}
