import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/types/service";
import { User, Deposit, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { Platform } from "@/types/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Tab = "orders" | "users" | "deposits" | "services";

const STATUS_OPTIONS = ["ordered", "processing", "done", "cancelled"];

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [verified, setVerified] = useState(false);
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [servicesData, setServicesData] = useState<{ platforms: Platform[] } | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<{ platformId: string; serviceId: string } | null>(null);
  const [serversJson, setServersJson] = useState("");

  const headers = () => ({ "X-Admin-Passcode": passcode });

  const verify = async () => {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) {
      setVerified(true);
      toast.success("Admin verified");
    } else {
      toast.error("Invalid passcode");
    }
  };

  const loadData = async () => {
    if (!verified) return;
    setLoading(true);
    try {
      if (tab === "orders") {
        const r = await fetch("/api/admin/orders", { headers: headers() });
        setOrders(await r.json());
      } else if (tab === "users") {
        const r = await fetch("/api/admin/users", { headers: headers() });
        setUsers(await r.json());
      } else if (tab === "deposits") {
        const r = await fetch("/api/admin/deposits", { headers: headers() });
        setDeposits(await r.json());
      } else if (tab === "services") {
        const r = await fetch("/api/admin/services", { headers: headers() });
        setServicesData(await r.json());
      }
      const sr = await fetch("/api/admin/stats", { headers: headers() });
      setStats(await sr.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verified) loadData();
  }, [verified, tab]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Order updated");
      loadData();
    } else toast.error("Update failed");
  };

  const updateWallet = async (userId: string, walletBalance: number) => {
    const res = await fetch(`/api/admin/users/${userId}/wallet`, {
      method: "PATCH",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ walletBalance }),
    });
    if (res.ok) {
      toast.success("Wallet updated");
      loadData();
    } else toast.error("Update failed");
  };

  const processDeposit = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch(`/api/wallet/deposits/${id}`, {
      method: "PATCH",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(status === "approved" ? "Deposit approved" : "Deposit rejected");
      loadData();
    } else toast.error("Failed");
  };

  const saveServers = async () => {
    if (!selectedService) return;
    try {
      const servers = JSON.parse(serversJson);
      const res = await fetch(
        `/api/admin/services/${selectedService.platformId}/${selectedService.serviceId}/servers`,
        {
          method: "PATCH",
          headers: { ...headers(), "Content-Type": "application/json" },
          body: JSON.stringify({ servers }),
        }
      );
      if (res.ok) {
        toast.success("Servers saved");
        loadData();
      } else toast.error("Save failed");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle>Admin Login</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Passcode</Label>
              <Input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} />
            </div>
            <Button className="w-full" onClick={verify}>Verify</Button>
            <p className="text-xs text-muted-foreground">Default: admin123</p>
            <Button asChild variant="ghost" size="sm"><Link to="/">← Back</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: "Đơn hàng" },
    { id: "users", label: "Users" },
    { id: "deposits", label: "Nạp tiền" },
    { id: "services", label: "Dịch vụ & Server" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {stats && (
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries((stats as { orders: Record<string, number> }).orders || {}).map(([k, v]) => (
            <Card key={k}><CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{v}</p>
              <p className="text-xs text-muted-foreground capitalize">{k}</p>
            </CardContent></Card>
          ))}
        </div>
      )}

      <div className="px-6 flex gap-2 border-b bg-white">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {tab === "orders" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <span className="font-bold">#{order.id}</span>
                      <Badge className={`ml-2 ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                      </Badge>
                    </div>
                    <span className="font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.contact} · {order.items.length} items · {order.paymentMethod || "—"}</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map((s) => (
                      <Button key={s} size="sm" variant={order.status === s ? "default" : "outline"} onClick={() => updateOrderStatus(order.id, s)}>
                        {ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="pt-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-32"
                      defaultValue={u.walletBalance}
                      onBlur={(e) => updateWallet(u.id, parseInt(e.target.value, 10) || 0)}
                    />
                    <span className="text-sm">VND</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "deposits" && (
          <div className="space-y-3">
            {deposits.map((d) => (
              <Card key={d.id}>
                <CardContent className="pt-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-medium">{formatPrice(d.amount)} — {d.userEmail}</p>
                    <p className="text-xs text-muted-foreground">{d.transferCode} · {new Date(d.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  {d.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => processDeposit(d.id, "approved")}>Duyệt</Button>
                      <Button size="sm" variant="destructive" onClick={() => processDeposit(d.id, "rejected")}>Từ chối</Button>
                    </div>
                  ) : (
                    <Badge>{d.status}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "services" && servicesData && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Dịch vụ</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                {servicesData.platforms.map((p) =>
                  p.services.map((s) => (
                    <button
                      key={`${p.id}-${s.id}`}
                      className={`w-full text-left p-2 rounded text-sm hover:bg-muted ${selectedService?.platformId === p.id && selectedService?.serviceId === s.id ? "bg-primary/10 border border-primary/30" : "border"}`}
                      onClick={() => {
                        setSelectedService({ platformId: p.id, serviceId: s.id });
                        setServersJson(JSON.stringify(s.servers || [], null, 2));
                      }}
                    >
                      <span className="font-medium">{p.name}</span> — {s.name}
                      <span className="text-muted-foreground ml-1">({(s.servers || []).length} servers)</span>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Servers JSON</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {selectedService ? (
                  <>
                    <Textarea rows={16} value={serversJson} onChange={(e) => setServersJson(e.target.value)} className="font-mono text-xs" />
                    <Button onClick={saveServers}>Lưu servers</Button>
                    <p className="text-xs text-muted-foreground">
                      Format: [{"{"}"id","name","pricePerUnit","status":"active","description"{"}"}]
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Chọn dịch vụ để chỉnh servers</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
