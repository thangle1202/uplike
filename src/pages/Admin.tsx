import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Users,
  ShoppingBag,
  Wallet,
  Settings,
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/types/service";
import {
  User,
  Deposit,
  AdminStats,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  OrderStatus,
  getOrderStatusLabel,
  getOrderStatusColor,
  normalizeOrderStatus,
  isAwaitingPayment,
  isOrderPaid,
} from "@/types/order";
import { Platform, ServiceServer } from "@/types/service";
import { useAuth } from "@/context/AuthContext";
import { AdminServiceServersPanel } from "@/components/admin/AdminServiceServersPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "overview" | "orders" | "users" | "deposits" | "services";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "completed", "cancelled"];

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "users", label: "Users", icon: Users },
  { id: "deposits", label: "Nạp tiền", icon: Wallet },
  { id: "services", label: "Dịch vụ", icon: Settings },
];

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof TrendingUp;
  accent?: string;
}) {
  return (
    <Card className="glass-card border-0 shadow-soft">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1 gradient-text">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              accent || "bg-violet-100"
            )}
          >
            <Icon className={cn("h-5 w-5", accent ? "text-white" : "text-violet-600")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [servicesData, setServicesData] = useState<{ platforms: Platform[] } | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const [userSearch, setUserSearch] = useState("");
  const [selectedService, setSelectedService] = useState<{ platformId: string; serviceId: string } | null>(null);
  const [savingServers, setSavingServers] = useState(false);

  const headers = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [statsRes, ordersRes, usersRes, depositsRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: authHeaders }),
        tab === "orders" || tab === "overview"
          ? fetch("/api/admin/orders", { headers: authHeaders })
          : Promise.resolve(null),
        tab === "users" ? fetch("/api/admin/users", { headers: authHeaders }) : Promise.resolve(null),
        tab === "deposits" ? fetch("/api/admin/deposits", { headers: authHeaders }) : Promise.resolve(null),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes?.ok) setOrders(await ordersRes.json());
      if (usersRes?.ok) setUsers(await usersRes.json());
      if (depositsRes?.ok) setDeposits(await depositsRes.json());

      if (tab === "services") {
        const r = await fetch("/api/admin/services", { headers: authHeaders });
        if (r.ok) setServicesData(await r.json());
      }
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Cập nhật đơn hàng thành công");
      loadData();
    } else toast.error("Cập nhật thất bại");
  };

  const updateWallet = async (userId: string, walletBalance: number) => {
    const res = await fetch(`/api/admin/users/${userId}/wallet`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ walletBalance }),
    });
    if (res.ok) {
      toast.success("Cập nhật ví thành công");
      loadData();
    } else toast.error("Cập nhật thất bại");
  };

  const updateRole = async (userId: string, role: "user" | "admin") => {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(role === "admin" ? "Đã cấp quyền admin" : "Đã thu hồi quyền admin");
      loadData();
    } else toast.error(data.error || "Cập nhật thất bại");
  };

  const processDeposit = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch(`/api/wallet/deposits/${id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(status === "approved" ? "Đã duyệt nạp tiền" : "Đã từ chối");
      loadData();
    } else toast.error("Xử lý thất bại");
  };

  const saveServers = async (
    platformId: string,
    serviceId: string,
    servers: ServiceServer[]
  ): Promise<boolean> => {
    setSavingServers(true);
    try {
      const res = await fetch(`/api/admin/services/${platformId}/${serviceId}/servers`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ servers }),
      });
      if (res.ok) {
        toast.success("Đã lưu servers");
        await loadData();
        return true;
      }
      toast.error("Lưu thất bại");
      return false;
    } catch {
      toast.error("Lưu thất bại");
      return false;
    } finally {
      setSavingServers(false);
    }
  };

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((o) => normalizeOrderStatus(o.status) === orderFilter);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen mesh-bg">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-600 shrink-0" />
                Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
            Làm mới
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto pb-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                  tab === t.id
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {tab === "overview" && stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Doanh thu tổng"
                value={formatPrice(stats.revenue.total)}
                sub={`Tháng này: ${formatPrice(stats.revenue.month)}`}
                icon={DollarSign}
                accent="gradient-primary"
              />
              <StatCard
                label="Doanh thu hôm nay"
                value={formatPrice(stats.revenue.today)}
                sub={`Ví: ${formatPrice(stats.revenue.wallet)} · CK: ${formatPrice(stats.revenue.guest)}`}
                icon={TrendingUp}
              />
              <StatCard
                label="Đơn hàng"
                value={stats.orders.total}
                sub={`${stats.orders.processing} đang xử lý · ${stats.orders.completed} hoàn thành`}
                icon={ShoppingBag}
              />
              <StatCard
                label="Users"
                value={stats.users.total}
                sub={`${stats.users.admins} admin · ${stats.deposits.pending} nạp chờ duyệt`}
                icon={Users}
              />
            </div>

            <div className="grid md:grid-cols-5 gap-3">
              {(
                [
                  ["pending", stats.orders.pending, Clock, "Chờ xử lý"],
                  ["processing", stats.orders.processing, RefreshCw, "Đang XL"],
                  ["completed", stats.orders.completed, CheckCircle2, "Hoàn thành"],
                  ["cancelled", stats.orders.cancelled, XCircle, "Đã hủy"],
                ] as const
              ).map(([status, count, Icon, label]) => (
                <Card key={status} className="glass-card border-0">
                  <CardContent className="pt-4 text-center">
                    <Icon className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
              <Card className="glass-card border-0">
                <CardContent className="pt-4 text-center">
                  <Wallet className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{formatPrice(stats.deposits.approvedTotal)}</p>
                  <p className="text-xs text-muted-foreground">Tổng nạp đã duyệt</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-sm">#{order.id}</span>
                      <Badge className={cn("ml-2 text-[10px]", getOrderStatusColor(order.status))}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.contact}</p>
                    </div>
                    <span className="font-bold text-violet-600">{formatPrice(order.totalAmount)}</span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Chưa có đơn hàng</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {tab === "orders" && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={orderFilter === "all" ? "default" : "outline"}
                onClick={() => setOrderFilter("all")}
              >
                Tất cả ({orders.length})
              </Button>
              {STATUS_OPTIONS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={orderFilter === s ? "default" : "outline"}
                  onClick={() => setOrderFilter(s)}
                >
                  {ORDER_STATUS_LABELS[s]} ({orders.filter((o) => normalizeOrderStatus(o.status) === s).length})
                </Button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="glass-card border-0">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <span className="font-bold">#{order.id}</span>
                        <Badge className={cn("ml-2", getOrderStatusColor(order.status))}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <span className="font-bold text-violet-600">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{order.contact} · {order.items.length} dịch vụ · {order.paymentMethod || "—"}</p>
                      {order.items.map((item, i) => (
                        <p key={i} className="text-xs">
                          {item.platformName} — {item.serviceName} × {item.quantity.toLocaleString()}
                        </p>
                      ))}
                      <p className="text-xs">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={normalizeOrderStatus(order.status) === s ? "default" : "outline"}
                          onClick={() => updateOrderStatus(order.id, s)}
                        >
                          {ORDER_STATUS_LABELS[s]}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-12">Không có đơn hàng</p>
              )}
            </div>
          </>
        )}

        {tab === "users" && (
          <>
            <Input
              placeholder="Tìm theo email hoặc tên..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="max-w-sm"
            />
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <Card key={u.id} className="glass-card border-0">
                  <CardContent className="pt-4 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{u.name}</p>
                        {u.role === "admin" && (
                          <Badge className="bg-violet-100 text-violet-700">Admin</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tham gia {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-32"
                          defaultValue={u.walletBalance}
                          onBlur={(e) =>
                            updateWallet(u.id, parseInt(e.target.value, 10) || 0)
                          }
                        />
                        <span className="text-sm text-muted-foreground">VND</span>
                      </div>
                      {u.id !== user?.id && (
                        <Button
                          size="sm"
                          variant={u.role === "admin" ? "outline" : "default"}
                          onClick={() =>
                            updateRole(u.id, u.role === "admin" ? "user" : "admin")
                          }
                        >
                          {u.role === "admin" ? "Thu hồi admin" : "Cấp admin"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {tab === "deposits" && (
          <div className="space-y-3">
            {deposits.map((d) => (
              <Card key={d.id} className="glass-card border-0">
                <CardContent className="pt-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-medium">{formatPrice(d.amount)} — {d.userEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.transferCode} · {new Date(d.createdAt).toLocaleString("vi-VN")}
                    </p>
                    {d.note && <p className="text-xs text-muted-foreground mt-1">{d.note}</p>}
                  </div>
                  {d.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => processDeposit(d.id, "approved")}>
                        Duyệt
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => processDeposit(d.id, "rejected")}>
                        Từ chối
                      </Button>
                    </div>
                  ) : (
                    <Badge
                      className={
                        d.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {d.status === "approved" ? "Đã duyệt" : "Từ chối"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
            {deposits.length === 0 && (
              <p className="text-center text-muted-foreground py-12">Chưa có yêu cầu nạp tiền</p>
            )}
          </div>
        )}

        {tab === "services" && servicesData && (
          <AdminServiceServersPanel
            platforms={servicesData.platforms}
            selectedService={selectedService}
            onSelectService={setSelectedService}
            onSave={saveServers}
            saving={savingServers}
          />
        )}
      </main>
    </div>
  );
}
