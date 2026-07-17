"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export default function TopBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isAdmin = Boolean(pathname?.startsWith("/admin"));
  const hidden =
    pathname === "/login" || pathname === "/register" || isAdmin;

  useEffect(() => {
    if (hidden) {
      document.documentElement.style.setProperty("--topbar-height", "0px");
      return;
    }
    const topbar = document.querySelector("[data-topbar]") as HTMLElement | null;
    if (topbar) {
      document.documentElement.style.setProperty(
        "--topbar-height",
        `${topbar.offsetHeight}px`,
      );
    }
  }, [hidden, pathname]);

  // Скрываем TopBar на логине/регистрации и во всей админке
  if (hidden) {
    return null;
  }

  return (
    <div
      data-topbar
      className="fixed top-0 left-0 right-0 z-[1000] w-full bg-white/95 backdrop-blur-sm text-[#660000] py-1.5 px-3 sm:px-4 min-h-[36px] sm:min-h-[32px] flex items-center max-[639px]:backdrop-blur"
      style={{
        paddingTop: "max(6px, env(safe-area-inset-top))",
      }}
    >
      <div className="container mx-auto flex flex-row items-center justify-center md:justify-between gap-2 sm:gap-3 md:gap-4 px-1 sm:pr-8 md:pr-16 min-w-0">
        {/* Огнетушитель — только на md+; без 3D-переворота «на ребро» */}
        <div
          className="relative hidden md:flex items-center justify-start shrink-0 w-[120px] lg:w-[140px] overflow-visible"
          aria-hidden
        >
          <div className="animate-topbar-ext-move">
            <svg
              viewBox="0 0 40 22"
              className="h-7 w-auto lg:h-8 drop-shadow-[1px_2px_2px_rgba(102,0,0,0.25)]"
            >
              <defs>
                <linearGradient id="tbExtBody" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7a1a1a" />
                  <stop offset="55%" stopColor="#660000" />
                  <stop offset="100%" stopColor="#4a0000" />
                </linearGradient>
                <radialGradient id="tbExtSpray" cx="30%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#660000" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#660000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* корпус */}
              <rect x="3" y="7" width="9" height="13" rx="2.2" fill="url(#tbExtBody)" />
              <ellipse cx="7.5" cy="9.2" rx="2.8" ry="1.4" fill="white" opacity="0.28" />
              {/* ручка */}
              <rect x="5" y="4.5" width="5" height="2.4" rx="0.7" fill="url(#tbExtBody)" />
              <rect x="5.6" y="4.8" width="3.8" height="0.9" rx="0.4" fill="#3a0000" opacity="0.45" />
              {/* шланг + сопло */}
              <path
                d="M12 9.5 C15 7.2, 19 7.5, 22 9"
                stroke="#660000"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <rect x="21.5" y="7.8" width="3.2" height="2.4" rx="0.6" fill="#660000" />

              {/* струя */}
              <g fill="url(#tbExtSpray)">
                <ellipse
                  className="animate-topbar-ext-spray"
                  cx="26"
                  cy="9"
                  rx="2.2"
                  ry="1.4"
                  style={{ animationDelay: "0ms" }}
                />
                <ellipse
                  className="animate-topbar-ext-spray-up"
                  cx="26.5"
                  cy="8.2"
                  rx="1.8"
                  ry="1.1"
                  style={{ animationDelay: "140ms" }}
                />
                <ellipse
                  className="animate-topbar-ext-spray-down"
                  cx="26.5"
                  cy="9.8"
                  rx="1.9"
                  ry="1.2"
                  style={{ animationDelay: "260ms" }}
                />
                <ellipse
                  className="animate-topbar-ext-spray"
                  cx="27"
                  cy="9"
                  rx="1.5"
                  ry="0.95"
                  style={{ animationDelay: "380ms" }}
                />
                <circle
                  className="animate-topbar-ext-spray-up"
                  cx="27.5"
                  cy="8.5"
                  r="0.9"
                  fill="#660000"
                  opacity="0.55"
                  style={{ animationDelay: "90ms" }}
                />
                <circle
                  className="animate-topbar-ext-spray-down"
                  cx="27.5"
                  cy="9.6"
                  r="0.75"
                  fill="#660000"
                  opacity="0.45"
                  style={{ animationDelay: "310ms" }}
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Контакты */}
        <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 min-w-0">
          {/* График работы — только на широких экранах (>= 900px) */}
          <div className="hidden min-[900px]:block text-[#660000]/90 whitespace-nowrap text-xs">
            {t("contacts.hours.weekdays")}, {t("contacts.hours.saturday")}
          </div>
          <div className="hidden min-[900px]:block w-px h-4 bg-[#660000]/20 flex-shrink-0" aria-hidden />
          
          {/* Первый номер телефона — всегда виден */}
          <a
            href="tel:+998712536616"
            className="text-[#660000] hover:bg-[#660000] hover:text-white active:bg-[#660000] active:text-white px-1.5 sm:px-2 py-1 rounded-md transition-colors whitespace-nowrap text-[11px] min-[400px]:text-xs sm:text-sm font-medium touch-manipulation"
          >
            <span className="hidden min-[400px]:inline">+998 </span>71 253 66 16
          </a>
          
          {/* Второй номер телефона — только на широких экранах (>= 900px) */}
          <a
            href="tel:+998909791218"
            className="hidden min-[900px]:block text-[#660000] hover:bg-[#660000] hover:text-white active:bg-[#660000] active:text-white px-1.5 sm:px-2 py-1 rounded-md transition-colors whitespace-nowrap text-xs sm:text-sm font-medium touch-manipulation"
          >
            +998 90 979 12 18
          </a>
          
          <div className="w-px h-4 bg-[#660000]/20 flex-shrink-0" aria-hidden />
          
          {/* Telegram — всегда виден */}
          <a
            href="https://t.me/pojsystema"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#660000] hover:bg-[#660000] hover:text-white active:bg-[#660000] active:text-white px-1.5 sm:px-2 py-1 rounded-md transition-colors whitespace-nowrap text-[11px] sm:text-sm font-medium touch-manipulation"
          >
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
