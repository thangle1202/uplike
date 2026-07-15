import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferNotePrefix: string;
  qrPayload: string;
}

interface DepositQrOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function DepositQrOverlay({ open, onClose }: DepositQrOverlayProps) {
  const [info, setInfo] = useState<DepositInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    setLoading(true);
    fetch("/api/wallet/deposit-info")
      .then((r) => r.json())
      .then(setInfo)
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

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
          "relative z-10 w-full max-w-sm rounded-3xl border border-white/20 bg-white p-6 shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center space-y-4 pt-2">
          <div>
            <h2 className="text-lg font-bold">Nạp tiền</h2>
            <p className="text-sm text-muted-foreground mt-1">Quét mã QR để chuyển khoản</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : info ? (
            <>
              <div className="mx-auto w-fit p-4 bg-white border-2 border-violet-100 rounded-2xl shadow-inner">
                <QRCode value={info.qrPayload} size={200} />
              </div>
              <div className="text-sm space-y-1.5 text-left bg-violet-50/80 rounded-xl p-4 border border-violet-100">
                <p>
                  <span className="text-muted-foreground">Ngân hàng:</span>{" "}
                  <strong>{info.bankName}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">STK:</span>{" "}
                  <strong>{info.accountNumber}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Chủ TK:</span>{" "}
                  <strong>{info.accountName}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Nội dung CK:</span>{" "}
                  <strong>{info.transferNotePrefix}</strong>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Sau khi chuyển khoản, admin sẽ duyệt và cộng tiền vào ví của bạn.
              </p>
            </>
          ) : (
            <p className="text-sm text-destructive py-8">Không tải được thông tin nạp tiền.</p>
          )}
        </div>
      </div>
    </div>
  );
}
