import { useEffect, useState, type ElementType } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Layers,
  Sparkles,
  Shield,
  Zap,
  Headphones,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PlatformIcon } from "@/lib/platformIcons";
import { Platform } from "@/types/service";
import { Button } from "@/components/ui/button";

interface LandingStats {
  customers: string;
  ordersDelivered: string;
  satisfactionRate: string;
  supportHours: string;
  tagline: string;
  highlights: string[];
  platforms: number;
  services: number;
}

interface HomePanelProps {
  platforms: Platform[];
}

function HighlightStat({
  icon: Icon,
  value,
  label,
}: {
  icon: ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center px-4">
      <div className="inline-flex h-11 w-11 rounded-xl bg-violet-100 items-center justify-center mb-2">
        <Icon className="h-5 w-5 text-violet-600" />
      </div>
      <p className="text-2xl font-bold gradient-text">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export function HomePanel({ platforms }: HomePanelProps) {
  const navigate = useNavigate();
  const [landing, setLanding] = useState<LandingStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setLanding)
      .catch(console.error);
  }, []);

  const serviceCount = platforms.reduce((sum, p) => sum + p.services.length, 0);

  const goToService = (platform: Platform) => {
    const first = platform.services[0];
    if (first) navigate(`/${platform.id}/${first.id}`);
  };

  return (
    <div className="flex-1 min-w-0 mesh-bg overflow-y-auto">
      {/* Hero */}
      <section className="px-8 pt-10 pb-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-600">
            Social Growth Platform
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-2xl">
          Tăng tương tác{" "}
          <span className="gradient-text">mạng xã hội</span>{" "}
          cùng UpLike
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-xl leading-relaxed">
          {landing?.tagline ||
            "Dịch vụ buff like, follow, comment, view cho Facebook, TikTok, Instagram và nhiều nền tảng khác."}
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            size="lg"
            onClick={() => platforms[0] && goToService(platforms[0])}
          >
            Bắt đầu ngay
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Xem dịch vụ
          </Button>
        </div>
      </section>

      {/* Marketing stats */}
      <section className="px-8 pb-8 max-w-5xl">
        <div className="glass-card rounded-3xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border border-violet-100/80">
          <HighlightStat
            icon={Users}
            value={landing?.customers ?? "12,000+"}
            label="Khách hàng tin dùng"
          />
          <HighlightStat
            icon={CheckCircle2}
            value={landing?.ordersDelivered ?? "850,000+"}
            label="Đơn đã hoàn thành"
          />
          <HighlightStat
            icon={Layers}
            value={String(landing?.services ?? serviceCount)}
            label="Dịch vụ đa dạng"
          />
          <HighlightStat
            icon={TrendingUp}
            value={landing?.satisfactionRate ?? "98%"}
            label="Khách hài lòng"
          />
        </div>
      </section>

      {/* Highlights */}
      {landing?.highlights && landing.highlights.length > 0 && (
        <section className="px-8 pb-8 max-w-5xl">
          <div className="flex flex-wrap gap-2">
            {landing.highlights.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {item}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      <section id="services" className="px-8 pb-8 max-w-5xl">
        <div className="mb-5">
          <h2 className="text-xl font-bold">Dịch vụ của chúng tôi</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {platforms.length} nền tảng · {serviceCount} dịch vụ sẵn sàng
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => goToService(platform)}
              className="glass-card rounded-2xl p-5 text-left border border-transparent hover:border-violet-200 hover:shadow-soft transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 p-2.5"
                  style={{ backgroundColor: `${platform.color}14` }}
                >
                  <PlatformIcon
                    platformId={platform.id}
                    className="h-full w-full object-contain"
                    alt={platform.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{platform.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {platform.description}
                  </p>
                  <p className="text-xs font-medium text-violet-600 mt-2">
                    {platform.services.length} dịch vụ
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {platform.services.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                      >
                        {s.name}
                      </span>
                    ))}
                    {platform.services.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        +{platform.services.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Why UpLike */}
      <section className="px-8 pb-12 max-w-5xl">
        <h2 className="text-xl font-bold mb-5">Vì sao chọn UpLike?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Nhanh & ổn định",
              desc: "Nhiều server, tốc độ xử lý linh hoạt theo nhu cầu của bạn.",
            },
            {
              icon: Shield,
              title: "An toàn",
              desc: "Không yêu cầu mật khẩu tài khoản. Chỉ cần link cần buff.",
            },
            {
              icon: Headphones,
              title: `Hỗ trợ ${landing?.supportHours ?? "24/7"}`,
              desc: "Đội ngũ sẵn sàng hỗ trợ qua email và hệ thống đơn hàng.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card rounded-2xl p-5">
              <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
