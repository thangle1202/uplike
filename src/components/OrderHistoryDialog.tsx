import { useEffect, useMemo, useState } from "react";
import { X, Loader2, Package, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types/service";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, OrderStatus } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StatusFilter = "all" | OrderStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "done", label: "Completed" },
  { id: "cancelled", label: "Aborted" },
  { id: "ordered", label: "Pending" },
];

interface OrderHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function OrderHistoryDialog({ open, onClose }: OrderHistoryDialogProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    if (token) {
      setLoading(true);
      fetch("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, token]);

  useEffect(() => {
    if (!open) setFilter("all");
  }, [open]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filter === "all") return sorted;
    return sorted.filter((o) => o.status === filter);
  }, [orders, filter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-white/20 bg-white shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border/60 shrink-0">
          <div>
            <h2 className="text-xl font-bold">Order History</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sorted by date created · newest first
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-border/40 shrink-0">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  filter === item.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const item = order.items[0];
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">#{order.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <Badge
                      className={ORDER_STATUS_COLORS[order.status as OrderStatus]}
                    >
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                  </div>

                  {item && (
                    <div className="grid gap-2 text-sm">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          <span className="text-muted-foreground">Platform:</span>{" "}
                          <strong>{item.platformName}</strong>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Service:</span>{" "}
                          <strong>{item.serviceName}</strong>
                        </span>
                      </div>
                      <p>
                        <span className="text-muted-foreground">Server:</span>{" "}
                        {item.serverName}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">URL:</span>{" "}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-600 hover:underline inline-flex items-center gap-1"
                        >
                          {item.url}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          <span className="text-muted-foreground">Quantity:</span>{" "}
                          {item.quantity.toLocaleString()} {item.unit}
                        </span>
                        <span>
                          <span className="text-muted-foreground">Unit price:</span>{" "}
                          {formatPrice(item.pricePerUnit)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="text-xs text-muted-foreground">
                      {order.paymentMethod === "wallet"
                        ? "Paid with wallet"
                        : order.paymentMethod === "guest_qr"
                          ? "Paid via QR"
                          : order.status === "ordered"
                            ? "Awaiting payment"
                            : "—"}
                    </div>
                    <p className="font-bold text-violet-600">{formatPrice(order.totalAmount)}</p>
                  </div>

                  {order.status === "ordered" && (
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link to={`/payment/${order.id}`} onClick={onClose}>
                        Pay now
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
