import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { OrderFormModal } from "@/components/OrderFormModal";
import { Platform, Service } from "@/types/service";
import { Button } from "@/components/ui/button";

export default function PlatformPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!platformId) return;
    fetch(`/api/services/${platformId}`)
      .then((res) => res.json())
      .then((data) => setPlatform(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [platformId]);

  const handleOrder = (service: Service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy nền tảng</h1>
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8 md:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tất cả nền tảng
          </Link>
        </Button>

        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${platform.color}20` }}
            >
              {platform.id === "facebook" && "📘"}
              {platform.id === "tiktok" && "🎵"}
              {platform.id === "instagram" && "📸"}
              {platform.id === "threads" && "🧵"}
              {platform.id === "youtube" && "▶️"}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{platform.name}</h1>
              <p className="text-muted-foreground">{platform.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platform.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              platform={platform}
              onOrder={handleOrder}
            />
          ))}
        </div>
      </main>

      <OrderFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        platform={platform}
      />

      <Footer />
    </div>
  );
}
