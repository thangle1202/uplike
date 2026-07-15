import { Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  submitting?: boolean;
  platformName: string;
  serviceName: string;
  serverName: string;
  url: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  payWithWallet?: boolean;
}

export function OrderConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
  platformName,
  serviceName,
  serverName,
  url,
  quantity,
  unit,
  totalPrice,
  payWithWallet,
}: OrderConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận đặt hàng</DialogTitle>
          <DialogDescription>Vui lòng kiểm tra thông tin trước khi đặt.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground shrink-0">Nền tảng</span>
              <span className="font-medium text-right">{platformName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground shrink-0">Dịch vụ</span>
              <span className="font-medium text-right">{serviceName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground shrink-0">Server</span>
              <span className="font-medium text-right">{serverName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground shrink-0">Số lượng</span>
              <span className="font-medium">{quantity.toLocaleString()} {unit}</span>
            </div>
            <div className="pt-2 border-t border-border/60">
              <p className="text-muted-foreground mb-1">Link</p>
              <p className="font-medium break-all text-xs">{url}</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="font-medium">Tổng thanh toán</span>
            <span className="text-xl font-bold gradient-text">{formatPrice(totalPrice)}</span>
          </div>

          {payWithWallet && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 px-1">
              <Zap className="h-3.5 w-3.5" /> Sẽ thanh toán bằng ví
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
