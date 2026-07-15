import { useEffect, useState, type ElementType } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link2,
  Server,
  Hash,
  MessageSquare,
  AlertCircle,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Platform, Service, getServiceServers } from "@/types/service";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, parseCommentsFromText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/lib/platformIcons";
import { OrderPaymentDialog } from "@/components/OrderPaymentDialog";
import { ContactButtons } from "@/components/ContactFloat";

interface ServiceDetailPanelProps {
  platform: Platform;
  service: Service;
}

const defaultInstructions = [
  "Hỗ trợ buff cho profile cá nhân và Fanpage.",
  "Vui lòng bật chế độ công khai (public) trước khi đặt.",
];

const defaultWarning =
  "Không mua nhiều đơn cho cùng một link cùng lúc. Chờ đơn trước hoàn thành rồi mới đặt tiếp.";

const VISIBLE_SERVER_COUNT = 5;

function SectionCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-card rounded-2xl p-6 animate-fade-up", className)}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
          <Icon className="h-4 w-4 text-violet-600" />
        </div>
        <h3 className="font-semibold text-[15px]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ServiceDetailPanel({ platform, service }: ServiceDetailPanelProps) {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, refreshUser } = useAuth();
  const servers = getServiceServers(service);

  const [url, setUrl] = useState("");
  const [contact, setContact] = useState("");
  const [quantity, setQuantity] = useState(String(service.minQuantity));
  const [commentText, setCommentText] = useState("");
  const [selectedServerId, setSelectedServerId] = useState(servers[0]?.id ?? "");
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  useEffect(() => {
    setUrl("");
    setQuantity(String(service.minQuantity));
    setCommentText("");
    setContact(user?.email || "");
    const nextServers = getServiceServers(service);
    setSelectedServerId(nextServers[0]?.id ?? "");
  }, [service.id, platform.id, user?.email]);

  const selectedServer = servers.find((s) => s.id === selectedServerId) ?? servers[0];
  const validComments = parseCommentsFromText(commentText);
  const qty = service.requiresComments ? validComments.length : parseInt(quantity, 10) || 0;
  const pricePerUnit = selectedServer?.pricePerUnit ?? service.pricePerUnit;
  const totalPrice = qty * pricePerUnit;
  const instructions = service.instructions?.length ? service.instructions : defaultInstructions;

  const handleCommentTextChange = (value: string) => {
    setCommentText(value);
    if (service.requiresComments) {
      setQuantity(String(parseCommentsFromText(value).length));
    }
  };

  const handleBuy = async () => {
    if (!url.trim()) {
      toast.error("Vui lòng nhập link cần buff");
      return;
    }
    const email = isAuthenticated ? user!.email : contact.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    if (service.requiresComments && validComments.length === 0) {
      toast.error("Vui lòng nhập ít nhất một comment");
      return;
    }
    if (qty < service.minQuantity || qty > service.maxQuantity) {
      toast.error(
        `Số lượng phải từ ${service.minQuantity.toLocaleString()} đến ${service.maxQuantity.toLocaleString()}`
      );
      return;
    }
    if (!selectedServer) {
      toast.error("Vui lòng chọn server");
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: [
            {
              platformId: platform.id,
              platformName: platform.name,
              serviceId: service.id,
              serviceName: service.name,
              serverId: selectedServer.id,
              serverName: selectedServer.name,
              url: url.trim(),
              quantity: qty,
              pricePerUnit: selectedServer.pricePerUnit,
              requiresComments: service.requiresComments,
              comments: service.requiresComments ? validComments : [],
              unit: service.unit,
            },
          ],
          contact: email,
        }),
      });

      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Đặt hàng thất bại");

      if (isAuthenticated && user && user.walletBalance >= totalPrice) {
        const payRes = await fetch(`/api/payments/order/${order.id}/pay-wallet`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (payRes.ok) {
          await refreshUser();
          toast.success("Đặt hàng thành công! Đơn đang được xử lý.");
          navigate("/orders");
          return;
        }
      }

      if (!isAuthenticated) {
        setPaymentOrderId(order.id);
        return;
      }

      navigate(`/payment/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đặt hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 mesh-bg overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/70 border-b border-border/50 px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-soft overflow-hidden p-2"
              style={{ backgroundColor: `${platform.color}12` }}
            >
              <PlatformIcon
                platformId={platform.id}
                className="h-full w-full object-contain"
                alt={platform.name}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">{service.name}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ContactButtons key={service.id} layout="header" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-3xl">
        <div className="space-y-5">
            {/* Info banner */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100/80 p-4 flex gap-3">
              <Info className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                {instructions.map((item, i) => (
                  <p key={i} className="text-violet-900/70">{item}</p>
                ))}
                <p className="text-red-600/80 font-medium flex items-start gap-1.5 pt-1">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {service.warning || defaultWarning}
                </p>
              </div>
            </div>

            <SectionCard icon={Link2} title="Link cần buff">
              {!isAuthenticated && (
                <div className="space-y-2 mb-4">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Email liên hệ
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  URL
                </Label>
                <Input
                  placeholder={service.urlPlaceholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </SectionCard>

            <SectionCard icon={Hash} title="Số lượng">
              <Input
                type="number"
                min={service.minQuantity}
                max={service.maxQuantity}
                value={service.requiresComments ? qty : quantity}
                onChange={(e) => !service.requiresComments && setQuantity(e.target.value)}
                readOnly={service.requiresComments}
                className={cn("max-w-xs", service.requiresComments && "opacity-70")}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Min {service.minQuantity.toLocaleString()} — Max {service.maxQuantity.toLocaleString()} {service.unit}
              </p>
            </SectionCard>

            <SectionCard icon={Server} title={`Chọn server (${servers.length})`}>
              <div
                className={cn(
                  "space-y-3",
                  servers.length > VISIBLE_SERVER_COUNT &&
                    "max-h-[calc(5*4.25rem+4*0.75rem)] overflow-y-auto overscroll-contain pr-1 -mr-1"
                )}
              >
                {servers.map((server) => {
                  const selected = selectedServerId === server.id;
                  return (
                    <div
                      key={server.id}
                      onClick={() => server.status === "active" && setSelectedServerId(server.id)}
                      className={cn(
                        "relative rounded-xl p-4 cursor-pointer transition-all duration-200 border-2",
                        selected
                          ? "border-violet-500 bg-violet-50/50 shadow-glow"
                          : "border-transparent bg-secondary/50 hover:bg-secondary/80 hover:border-border"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            selected ? "border-violet-600 bg-violet-600" : "border-muted-foreground/30"
                          )}
                        >
                          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm">{server.name}</span>
                            <span className="text-violet-600 font-bold">{formatPrice(server.pricePerUnit)}</span>
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide",
                                server.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {server.status === "active" ? "Hoạt động" : "Bảo trì"}
                            </span>
                          </div>
                          {(selected || expandedServer === server.id) && (
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                              {server.description}
                            </p>
                          )}
                          {!selected && expandedServer !== server.id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedServer(expandedServer === server.id ? null : server.id);
                              }}
                              className="text-xs text-violet-600 font-medium mt-1.5 hover:underline"
                            >
                              Xem chi tiết
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {service.requiresComments && (
              <SectionCard icon={MessageSquare} title="Danh sách comment">
                <p className="text-xs text-muted-foreground mb-3">
                  Mỗi comment trên một dòng — số lượng tự động tính
                </p>
                <Textarea
                  placeholder={"Comment 1\nComment 2\nComment 3"}
                  value={commentText}
                  onChange={(e) => handleCommentTextChange(e.target.value)}
                  rows={6}
                  className="font-mono"
                />
                {validComments.length > 0 && (
                  <p className="text-xs text-violet-600 font-medium mt-2">
                    {validComments.length} comment
                  </p>
                )}
              </SectionCard>
            )}

        </div>
      </div>

      {/* Sticky buy bar */}
      {qty > 0 && (
        <div className="sticky bottom-0 z-30 border-t border-border/50 bg-white/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between gap-4 shadow-[0_-4px_24px_-8px_rgb(0_0_0/0.08)]">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Tổng thanh toán</p>
            <p className="text-2xl font-bold gradient-text">{formatPrice(totalPrice)}</p>
            {isAuthenticated && user && user.walletBalance >= totalPrice && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <Zap className="h-3 w-3" /> Thanh toán bằng ví
              </p>
            )}
          </div>
          <Button size="lg" className="min-w-[160px]" onClick={handleBuy} disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Mua ngay"}
          </Button>
        </div>
      )}

      <OrderPaymentDialog
        open={!!paymentOrderId}
        orderId={paymentOrderId}
        onClose={() => setPaymentOrderId(null)}
      />
    </div>
  );
}
