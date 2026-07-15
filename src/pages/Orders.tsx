import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/types/service";
import { getOrderStatusLabel, getOrderStatusColor, isAwaitingPayment } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Vui lòng đăng nhập để xem đơn hàng</p>
        <Button asChild><Link to="/">Về trang chủ</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Trang chủ</Link>
        </Button>
        <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>

        {loading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : orders.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có đơn hàng</CardContent></Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">#{order.id}</CardTitle>
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{order.items.length} dịch vụ — <strong>{formatPrice(order.totalAmount)}</strong></p>
                {isAwaitingPayment(order) && (
                  <Button asChild size="sm"><Link to={`/payment/${order.id}`}>Thanh toán</Link></Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
