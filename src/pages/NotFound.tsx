import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-6">Trang không tồn tại</p>
      <Button asChild>
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}
