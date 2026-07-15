export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">UpLike</p>
        <p>Dịch vụ tăng tương tác mạng xã hội — Facebook, TikTok, Instagram, Threads, YouTube</p>
        <p className="mt-2">© {new Date().getFullYear()} UpLike. All rights reserved.</p>
      </div>
    </footer>
  );
}
