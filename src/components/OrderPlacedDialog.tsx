import { CheckCircle2, Mail, Wallet, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PlacedOrderInfo = {
  id: string;
  totalAmount: number;
  serviceName: string;
  paidWithWallet?: boolean;
  needsPayment?: boolean;
  contactEmail?: string;
};

interface OrderPlacedDialogProps {
  open: boolean;
  order: PlacedOrderInfo | null;
  onClose: () => void;
  onPay?: () => void;
}

export function OrderPlacedDialog({ open, order, onClose, onPay }: OrderPlacedDialogProps) {
  if (!open || !order) return null;

  const hasValidEmail =
    !!order.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.contactEmail);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        <div className="p-6 text-center space-y-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold">Đặt hàng thành công!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Mã đơn <span className="font-semibold text-violet-600">#{order.id}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-left space-y-2">
            <p className="text-sm font-medium">{order.serviceName}</p>
            <p className="text-2xl font-bold gradient-text">{formatPrice(order.totalAmount)}</p>
            {order.paidWithWallet && (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" /> Đã thanh toán bằng ví
              </p>
            )}
            {!order.paidWithWallet && order.needsPayment && (
              <p className="text-xs text-amber-700 font-medium">
                Vui lòng thanh toán để admin xử lý đơn
              </p>
            )}
            {!order.paidWithWallet && !order.needsPayment && (
              <p className="text-xs text-muted-foreground">
                Đơn đang chờ xử lý. Admin sẽ cập nhật trạng thái sớm.
              </p>
            )}
          </div>

          {hasValidEmail && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email xác nhận đã gửi tới {order.contactEmail}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {order.needsPayment && onPay && (
              <Button className="w-full" onClick={onPay}>
                Thanh toán ngay
              </Button>
            )}
            <Button variant={order.needsPayment ? "outline" : "default"} className="w-full" onClick={onClose}>
              {order.needsPayment ? "Thanh toán sau" : "Đóng"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
