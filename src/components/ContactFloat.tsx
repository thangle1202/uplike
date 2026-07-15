import { type ReactNode } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const PHONE = "0877677863";
const ZALO_URL = `https://zalo.me/${PHONE}`;

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#0068FF" />
      <path
        fill="#fff"
        d="M16.5 14h15c1.1 0 2 .9 2 2v10.5c0 1.1-.9 2-2 2H22l-5.5 3.5V28.5h-1c-1.1 0-2-.9-2-2V16c0-1.1.9-2 2-2z"
      />
      <text
        x="24"
        y="23"
        textAnchor="middle"
        fill="#0068FF"
        fontSize="7"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        Zalo
      </text>
    </svg>
  );
}

function FloatButton({
  href,
  title,
  delay,
  pulseColor,
  className,
  children,
  external,
}: {
  href: string;
  title: string;
  delay: string;
  pulseColor: string;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <div
      className="relative opacity-0 animate-contact-enter"
      style={{ animationDelay: delay }}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full animate-contact-ring pointer-events-none",
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
          "hover:scale-110 hover:-translate-y-0.5 hover:shadow-xl",
          "active:scale-95",
          className
        )}
      >
        {children}
      </a>
    </div>
  );
}

export function ContactFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <FloatButton
        href={ZALO_URL}
        title={`Chat Zalo ${PHONE}`}
        delay="0.1s"
        pulseColor="bg-[#0068FF]/30"
        external
        className="bg-[#0068FF] text-white pl-3 pr-4 py-2.5 hover:shadow-[0_8px_28px_-4px_rgba(0,104,255,0.55)]"
      >
        <span className="animate-contact-pulse shrink-0">
          <ZaloIcon className="h-8 w-8" />
        </span>
        <span className="text-sm font-semibold hidden sm:inline">Zalo</span>
      </FloatButton>

      <FloatButton
        href={`tel:${PHONE}`}
        title={`Gọi ${PHONE}`}
        delay="0.25s"
        pulseColor="bg-emerald-500/30"
        className="bg-white text-foreground border border-border pl-3 pr-4 py-2.5 hover:shadow-[0_8px_28px_-4px_rgba(16,185,129,0.4)]"
      >
        <span className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 animate-phone-shake">
          <Phone className="h-4 w-4 text-white" />
        </span>
        <span className="text-sm font-semibold tabular-nums">{PHONE}</span>
      </FloatButton>
    </div>
  );
}
