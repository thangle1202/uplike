import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  MessageCircle,
  Eye,
  ThumbsUp,
  UserPlus,
  Wallet,
  Sparkles,
  TrendingUp,
  LogIn,
  History,
  Plus,
  Home,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Platform, getServiceIcon } from "@/types/service";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/LoginDialog";
import { DepositQrOverlay } from "@/components/DepositQrOverlay";
import { OrderHistoryDialog } from "@/components/OrderHistoryDialog";
import { PlatformIcon } from "@/lib/platformIcons";

interface ServiceSidebarProps {
  platforms: Platform[];
  activePlatformId?: string;
  activeServiceId?: string;
}

const serviceIcons = {
  like: ThumbsUp,
  follow: UserPlus,
  comment: MessageCircle,
  view: Eye,
  share: TrendingUp,
  default: TrendingUp,
};

export function ServiceSidebar({ platforms, activePlatformId, activeServiceId }: ServiceSidebarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    platforms.forEach((p) => {
      initial[p.id] = p.id === activePlatformId || platforms.length <= 3;
    });
    return initial;
  });

  return (
    <>
      <aside className="w-[320px] shrink-0 sidebar-gradient text-white flex flex-col h-screen sticky top-0 border-r border-white/5 overflow-x-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
            >
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">UpLike</span>
                <p className="text-[10px] text-white/40 font-medium">Social Growth</p>
              </div>
            </button>
            {isAuthenticated ? (
              <button
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="Đăng xuất"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="Đăng nhập"
                onClick={() => setLoginOpen(true)}
              >
                <LogIn className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative rounded-2xl p-4 space-y-3 overflow-hidden bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-purple-600/20 border border-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.3)] ring-1 ring-violet-300/25 backdrop-blur-md">
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-violet-400/25 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Tài khoản</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-100 border border-violet-300/30">
                  {isAdmin ? "Admin" : "Member"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate">{isAuthenticated ? user?.name : "Khách"}</p>
                <p className="text-xs text-white/40 truncate">{isAuthenticated ? user?.email : "Chưa đăng nhập"}</p>
              </div>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs text-white/50 flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" /> Số dư
                </span>
                <span className="text-sm font-bold text-emerald-300">
                  {isAuthenticated ? formatPrice(user?.walletBalance ?? 0) : "0đ"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="relative flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-glow hover:brightness-110 active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" />
                Nạp tiền
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden pb-4 scrollbar-thin">
          <div className="px-4 mb-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                !activePlatformId && !activeServiceId
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              )}
            >
              <Home className="h-4 w-4" />
              Trang chủ
            </button>
          </div>

          {isAuthenticated && (
            <div className="px-4 mb-2">
              <button
                type="button"
                onClick={() => setOrderHistoryOpen(true)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                  "text-white/55 hover:text-white hover:bg-white/5"
                )}
              >
                <History className="h-4 w-4" />
                Order History
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="px-4 mb-2">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                  "text-violet-200 hover:text-white hover:bg-violet-500/20 border border-violet-400/20"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </button>
            </div>
          )}

          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase">Dịch vụ</span>
          </div>

          {platforms.map((platform) => {
            const isExpanded = expanded[platform.id];
            const isActivePlatform = platform.id === activePlatformId;

            return (
              <div key={platform.id} className="mb-1 px-4">
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [platform.id]: !prev[platform.id] }))}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[13px] font-semibold transition-all min-w-0",
                    isActivePlatform
                      ? "text-violet-200 bg-violet-500/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <PlatformIcon platformId={platform.id} className="h-5 w-5 object-contain shrink-0" alt={platform.name} />
                  <span className="flex-1 truncate">{platform.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-0.5 ml-2 pl-3 border-l border-white/10 space-y-0.5 min-w-0">
                    {platform.services.map((service) => {
                      const iconKey = getServiceIcon(service.id);
                      const Icon = serviceIcons[iconKey] || serviceIcons.default;
                      const isActive =
                        platform.id === activePlatformId && service.id === activeServiceId;

                      return (
                        <button
                          key={service.id}
                          onClick={() => navigate(`/${platform.id}/${service.id}`)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[12px] transition-all duration-200 min-w-0",
                            isActive
                              ? "bg-white text-slate-900 font-semibold shadow-soft"
                              : "text-white/50 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-violet-600" : "")} />
                          <span className="truncate">{service.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <DepositQrOverlay open={depositOpen} onClose={() => setDepositOpen(false)} />
      <OrderHistoryDialog open={orderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} />
    </>
  );
}
