import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { ArrowLeft, CheckCircle, Wallet, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/types/service";
import { PaymentQR, getOrderStatusLabel, getOrderStatusColor, isOrderPaid } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, token, refreshUser, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [qrData, setQrData] = useState<PaymentQR | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    Promise.all([
      fetch(`/api/orders/${orderId}`).then((r) => r.json()),
      fetch(`/api/payments/order/${orderId}/qr`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([orderData, qr]) => {
        if (orderData.error) throw new Error(orderData.error);
        setOrder(orderData);
        setQrData(qr);
      })
      .catch((e) => toast.error(e.message || "Không tải được đơn hàng"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleGuestConfirm = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/payments/order/${orderId}/confirm-guest`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data);
      toast.success("Thanh toán thành công! Đơn hàng đang chờ admin xử lý.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thanh toán thất bại");
    } finally {
      setPaying(false);
    }
  };

  const handleWalletPay = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/payments/order/${orderId}/pay-wallet`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data.order);
      await refreshUser();
      toast.success("Thanh toán bằng ví thành công!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thanh toán thất bại");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Không tìm thấy đơn hàng</p>
        <Button asChild><Link to="/">Về trang chủ</Link></Button>
      </div>
    );
  }

  const isPaid = isOrderPaid(order);

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Trang chủ</Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Thanh toán đơn hàng #{order.id}</CardTitle>
              <Badge className={getOrderStatusColor(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-lg font-bold border-b pb-4">
              <span>Tổng thanh toán</span>
              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
            </div>

            <div className="text-sm space-y-1 text-muted-foreground">
              <p>Email: {order.contact}</p>
              <p>{order.items.length} dịch vụ</p>
            </div>

            {isPaid ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <p className="font-medium">
                  {order.paymentMethod === "wallet" ? "Đã thanh toán bằng ví" : "Đã xác nhận thanh toán"}
                </p>
                <p className="text-sm text-muted-foreground">Đơn hàng đang chờ admin xử lý.</p>
                <Button asChild><Link to="/orders">Xem đơn hàng</Link></Button>
              </div>
            ) : (
              <>
                {isAuthenticated && user && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Wallet className="h-5 w-5 text-primary" />
                        Thanh toán bằng ví
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Số dư: <strong className="text-foreground">{formatPrice(user.walletBalance)}</strong>
                      </p>
                      {user.walletBalance >= order.totalAmount ? (
                        <Button className="w-full" onClick={handleWalletPay} disabled={paying}>
                          {paying ? "Đang xử lý..." : `Trừ ${formatPrice(order.totalAmount)} từ ví`}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-destructive">Số dư không đủ</p>
                          <Button asChild variant="outline" className="w-full">
                            <Link to="/wallet">Nạp tiền vào ví</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {isAuthenticated ? "hoặc quét QR" : "Quét QR thanh toán (khách)"}
                    </span>
                  </div>
                </div>

                {qrData && (
                  <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg border">
                    <QrCode className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">Quét mã QR để chuyển khoản</p>
                    <div className="p-4 bg-white border rounded-lg">
                      <QRCode value={qrData.qrPayload} size={180} />
                    </div>
                    <div className="text-sm text-center space-y-1 w-full">
                      <p><span className="text-muted-foreground">Ngân hàng:</span> {qrData.bank.bankName}</p>
                      <p><span className="text-muted-foreground">STK:</span> {qrData.bank.accountNumber}</p>
                      <p><span className="text-muted-foreground">Chủ TK:</span> {qrData.bank.accountName}</p>
                      <p><span className="text-muted-foreground">Nội dung:</span> <strong>{qrData.bank.transferNote}</strong></p>
                      <p className="text-primary font-bold text-lg">{formatPrice(qrData.totalAmount)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      (Mã QR mock — dùng để test. Nhấn xác nhận sau khi chuyển khoản.)
                    </p>
                    <Button variant="outline" className="w-full" onClick={handleGuestConfirm} disabled={paying}>
                      {paying ? "Đang xác nhận..." : "Tôi đã chuyển khoản — Xác nhận thanh toán"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
