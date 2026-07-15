import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { X, Loader2, QrCode, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types/service";
import { PaymentQR, getOrderStatusLabel, getOrderStatusColor, isOrderPaid } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderPaymentDialogProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  onConfirmed?: () => void;
}

export function OrderPaymentDialog({
  open,
  orderId,
  onClose,
  onConfirmed,
}: OrderPaymentDialogProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [qrData, setQrData] = useState<PaymentQR | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!open || !orderId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !paying) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    setLoading(true);
    setOrder(null);
    setQrData(null);

    Promise.all([
      fetch(`/api/orders/${orderId}`).then((r) => r.json()),
      fetch(`/api/payments/order/${orderId}/qr`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([orderData, qr]) => {
        if (orderData.error) throw new Error(orderData.error);
        setOrder(orderData);
        setQrData(qr);
      })
      .catch((e) => toast.error(e.message || "Không tải được thông tin thanh toán"))
      .finally(() => setLoading(false));

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, orderId, onClose, paying]);

  const handleGuestConfirm = async () => {
    if (!orderId) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/payments/order/${orderId}/confirm-guest`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data);
      toast.success("Thanh toán thành công! Đơn hàng đang chờ admin xử lý.");
      onConfirmed?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thanh toán thất bại");
    } finally {
      setPaying(false);
    }
  };

  if (!open || !orderId) return null;

  const isPaid = order ? isOrderPaid(order) : false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={paying ? undefined : onClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-white shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 bg-white border-b border-border/60">
          <div>
            <h2 className="text-lg font-bold">Thanh toán đơn hàng</h2>
            {order && (
              <p className="text-xs text-muted-foreground mt-0.5">#{order.id}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 pt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : !order ? (
            <p className="text-sm text-destructive text-center py-12">
              Không tải được thông tin đơn hàng
            </p>
          ) : isPaid ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
              <p className="font-medium">Đã xác nhận thanh toán</p>
              <Badge className={getOrderStatusColor(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Đơn hàng đang chờ admin xử lý. Bạn sẽ nhận cập nhật khi hoàn thành.
              </p>
              <Button className="w-full" onClick={onClose}>
                Đóng
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm border-b pb-3">
                <span className="text-muted-foreground">Tổng thanh toán</span>
                <span className="text-lg font-bold text-violet-600">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>

              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Email: {order.contact}</p>
                <p>{order.items.length} dịch vụ</p>
              </div>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Quét QR thanh toán (khách)
                  </span>
                </div>
              </div>

              {qrData && (
                <div className="flex flex-col items-center space-y-4 p-4 bg-violet-50/50 rounded-2xl border border-violet-100">
                  <QrCode className="h-5 w-5 text-violet-600" />
                  <p className="text-sm font-medium">Quét mã QR để chuyển khoản</p>
                  <div className="p-4 bg-white border-2 border-violet-100 rounded-2xl">
                    <QRCode value={qrData.qrPayload} size={180} />
                  </div>
                  <div className="text-sm text-center space-y-1 w-full">
                    <p>
                      <span className="text-muted-foreground">Ngân hàng:</span>{" "}
                      {qrData.bank.bankName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">STK:</span>{" "}
                      {qrData.bank.accountNumber}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Chủ TK:</span>{" "}
                      {qrData.bank.accountName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Nội dung:</span>{" "}
                      <strong>{qrData.bank.transferNote}</strong>
                    </p>
                    <p className="text-violet-600 font-bold text-lg">
                      {formatPrice(qrData.totalAmount)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    (Mã QR mock — dùng để test. Nhấn xác nhận sau khi chuyển khoản.)
                  </p>
                  <Button
                    className="w-full"
                    onClick={handleGuestConfirm}
                    disabled={paying}
                  >
                    {paying
                      ? "Đang xác nhận..."
                      : "Tôi đã chuyển khoản — Xác nhận thanh toán"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
