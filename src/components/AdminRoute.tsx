import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginDialog } from "@/components/LoginDialog";
import { useState } from "react";

function AdminAccessDenied({ reason }: { reason: "login" | "forbidden" }) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-0 shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-2">
            <ShieldAlert className="h-7 w-7 text-violet-600" />
          </div>
          <CardTitle>
            {reason === "login" ? "Đăng nhập để truy cập Admin" : "Không có quyền truy cập"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {reason === "login"
              ? "Trang quản trị chỉ dành cho tài khoản admin. Vui lòng đăng nhập."
              : "Tài khoản của bạn không có quyền admin. Liên hệ quản trị viên nếu cần hỗ trợ."}
          </p>
          {reason === "login" ? (
            <Button className="w-full" onClick={() => setLoginOpen(true)}>
              <LogIn className="h-4 w-4 mr-2" /> Đăng nhập
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to="/">Về trang chủ</Link>
            </Button>
          )}
          {reason === "login" && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/">← Về trang chủ</Link>
            </Button>
          )}
        </CardContent>
      </Card>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAccessDenied reason="login" />;
  }

  if (!isAdmin) {
    return <AdminAccessDenied reason="forbidden" />;
  }

  return <>{children}</>;
}
