import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { Deposit } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WalletPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [amount, setAmount] = useState("50000");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [depositResult, setDepositResult] = useState<{
    deposit: Deposit;
    qrPayload: string;
    bank: { bankName: string; accountNumber: string; accountName: string };
  } | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/wallet/deposits", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setDeposits)
      .catch(console.error);
  }, [token, depositResult]);

  const handleDeposit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseInt(amount, 10), note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDepositResult(data);
      toast.success("Yêu cầu nạp tiền đã tạo. Vui lòng chuyển khoản theo hướng dẫn.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tạo yêu cầu nạp tiền thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <p>Vui lòng đăng nhập để nạp tiền vào ví</p>
        <Button asChild><Link to="/">Về trang chủ</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Trang chủ</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" /> Ví của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatPrice(user?.walletBalance ?? 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Nạp tiền</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Số tiền (VND)</Label>
              <Input type="number" min={10000} step={10000} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú (tuỳ chọn)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
            <Button onClick={handleDeposit} disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo yêu cầu nạp tiền"}
            </Button>
          </CardContent>
        </Card>

        {depositResult && (
          <Card className="border-primary/30">
            <CardHeader><CardTitle>Quét QR chuyển khoản</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border rounded-lg">
                <QRCode value={depositResult.qrPayload} size={180} />
              </div>
              <div className="text-sm text-center space-y-1">
                <p>Ngân hàng: {depositResult.bank.bankName}</p>
                <p>STK: {depositResult.bank.accountNumber}</p>
                <p>Chủ TK: {depositResult.bank.accountName}</p>
                <p>Số tiền: <strong>{formatPrice(depositResult.deposit.amount)}</strong></p>
                <p>Nội dung CK: <strong>{depositResult.deposit.transferCode}</strong></p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Admin sẽ duyệt nạp tiền sau khi nhận được chuyển khoản. (Mock test)
              </p>
            </CardContent>
          </Card>
        )}

        {deposits.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Lịch sử nạp tiền</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {deposits.map((d) => (
                <div key={d.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div>
                    <p className="font-medium">{formatPrice(d.amount)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <Badge variant={d.status === "approved" ? "default" : d.status === "rejected" ? "destructive" : "secondary"}>
                    {d.status === "pending" ? "Chờ duyệt" : d.status === "approved" ? "Đã duyệt" : "Từ chối"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
