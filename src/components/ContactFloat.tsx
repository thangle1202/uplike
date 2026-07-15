import { type ReactNode } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import zaloIcon from "@/components/res/zalo.png";

const PHONE = "0877677863";
const ZALO_URL = `https://zalo.me/${PHONE}`;

function ContactButton({
  href,
  title,
  delay,
  pulseColor,
  className,
  children,
  external,
  compact,
}: {
  href: string;
  title: string;
  delay: string;
  pulseColor: string;
  className?: string;
  children: ReactNode;
  external?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative opacity-0",
        compact ? "animate-contact-header-enter" : "animate-contact-enter"
      )}
      style={{ animationDelay: delay }}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full pointer-events-none",
          compact ? "animate-contact-ring-sm" : "animate-contact-ring",
          pulseColor
        )}
        aria-hidden="true"
      />
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        title={title}
        className={cn(
          "relative flex items-center gap-2 rounded-full shadow-lg",
          "transition-all duration-300 ease-out",
          compact
            ? "hover:scale-110 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            : "hover:scale-110 hover:-translate-y-0.5 hover:shadow-xl active:scale-95",
          className
        )}
      >
        {children}
      </a>
    </div>
  );
}

type ContactButtonsProps = {
  layout?: "float" | "header";
};

export function ContactButtons({ layout = "float" }: ContactButtonsProps) {
  const compact = layout === "header";

  return (
    <>
      <ContactButton
        href={ZALO_URL}
        title={`Chat Zalo ${PHONE}`}
        delay={compact ? "0.05s" : "0.1s"}
        pulseColor="bg-[#0068FF]/30"
        external
        compact={compact}
        className={cn(
          "bg-[#0068FF] text-white hover:shadow-[0_8px_28px_-4px_rgba(0,104,255,0.55)]",
          compact ? "p-2" : "pl-3 pr-4 py-2.5"
        )}
      >
        <span className="shrink-0 animate-contact-pulse">
          <img
            src={zaloIcon}
            alt=""
            aria-hidden="true"
            className={cn("rounded-full object-cover", compact ? "h-7 w-7" : "h-8 w-8")}
          />
        </span>
        {!compact && <span className="text-sm font-semibold hidden sm:inline">Zalo</span>}
      </ContactButton>

      <ContactButton
        href={`tel:${PHONE}`}
        title={`Gọi ${PHONE}`}
        delay={compact ? "0.18s" : "0.25s"}
        pulseColor="bg-emerald-500/30"
        compact={compact}
        className={cn(
          "bg-white text-foreground border border-border hover:shadow-[0_8px_28px_-4px_rgba(16,185,129,0.4)]",
          compact ? "p-2" : "pl-3 pr-4 py-2.5"
        )}
      >
        <span
          className={cn(
            "rounded-full bg-emerald-500 flex items-center justify-center shrink-0 animate-phone-shake",
            compact ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          <Phone className={cn("text-white", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </span>
        {!compact && <span className="text-sm font-semibold tabular-nums">{PHONE}</span>}
      </ContactButton>
    </>
  );
}

export function ContactFloat() {
  return (
    <div className="fixed z-50 flex flex-col gap-3 right-4 sm:right-6 items-end bottom-6">
      <ContactButtons layout="float" />
    </div>
  );
}
