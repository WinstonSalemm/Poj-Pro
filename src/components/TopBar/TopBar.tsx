"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export default function TopBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    // Устанавливаем CSS переменную для высоты TopBar
    const topbar = document.querySelector('[data-topbar]') as HTMLElement;
    if (topbar) {
      const height = topbar.offsetHeight;
      document.documentElement.style.setProperty('--topbar-height', `${height}px`);
    }
  }, []);

  // Скрываем TopBar на страницах логина и регистрации
  if (pathname === "/login" || pathname === "/register") {
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
      <div className="container mx-auto flex flex-row items-center justify-center min-[900px]:justify-between gap-2 sm:gap-3 md:gap-4 pl-1 pr-14 sm:pr-20 md:pr-32 min-w-0 ml-[10px]">
        {/* Анимация огнетушителя — всегда слева, видна на любом экране, по центру по высоте */}
        <div 
          className="relative flex items-center justify-center shrink-0 w-14 min-[400px]:w-[90px] sm:w-[110px] md:w-[130px]" 
          style={{ 
            height: '100%',
            minHeight: '100%',
            position: 'relative',
            perspective: '1000px',
            perspectiveOrigin: 'center center',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              animation: 'extinguisherMove 8s ease-in-out infinite',
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 32 20"
              className="relative z-10 w-6 min-[400px]:w-7 sm:w-8 h-auto"
              style={{
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(2px 2px 4px rgba(102, 0, 0, 0.4))',
                minWidth: '24px',
              }}
            >
              {/* Тень для объёма */}
              <defs>
                <linearGradient id="extinguisherGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#660000" stopOpacity="1" />
                  <stop offset="50%" stopColor="#7a1a1a" stopOpacity="1" />
                  <stop offset="100%" stopColor="#520000" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="extinguisherInnerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#660000" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#660000" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#660000" stopOpacity="0.25" />
                </linearGradient>
                <filter id="extinguisherShadow">
                  <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#660000" floodOpacity="0.4"/>
                </filter>
              </defs>
              
              {/* Корпус огнетушителя с объёмом - боковая грань для 3D эффекта */}
              <rect x="2" y="6" width="1" height="12" rx="0.5" fill="#520000" opacity="0.8" />
              {/* Основной корпус */}
              <rect x="2" y="6" width="8" height="12" rx="2" fill="url(#extinguisherGradient)" opacity="0.95" filter="url(#extinguisherShadow)" />
              {/* Блик сверху для объёма */}
              <ellipse cx="6" cy="8" rx="2.5" ry="1.5" fill="white" opacity="0.4" />
              {/* Тень внутри для глубины */}
              <rect x="3" y="7" width="6" height="10" rx="1.5" fill="url(#extinguisherInnerGradient)" />
              {/* Правая грань для объёма */}
              <rect x="9" y="6" width="0.5" height="12" rx="0.25" fill="#520000" opacity="0.6" />
              {/* Ручка с объёмом */}
              <rect x="4" y="4" width="4" height="2" rx="0.5" fill="url(#extinguisherGradient)" opacity="0.95" />
              <rect x="4.5" y="4.2" width="3" height="0.8" rx="0.3" fill="#660000" opacity="0.6" />
              {/* Шланг - изогнутый, выходит с самого верха огнетушителя */}
              <path
                d="M 6 6 Q 10 4, 18 6"
                stroke="#660000"
                strokeWidth="2"
                fill="none"
                opacity="0.9"
                strokeLinecap="round"
                filter="url(#extinguisherShadow)"
              />
              {/* Сопло на конце шланга с объёмом */}
              <rect x="17" y="5" width="3" height="2" rx="0.5" fill="url(#extinguisherGradient)" opacity="0.95" filter="url(#extinguisherShadow)" />
              <rect x="17.3" y="5.2" width="2.4" height="0.6" rx="0.2" fill="#660000" opacity="0.5" />
              {/* Струя - выходит из сопла вправо */}
              <g className="extinguisher-stream">
                {/* Частицы струи - движутся вправо */}
                <circle cx="20" cy="6" r="1.5" fill="#660000" opacity="0.9">
                  <animate attributeName="cx" values="20;24;20" dur="0.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.4;0.9" dur="0.4s" repeatCount="indefinite" />
                  <animate attributeName="r" values="1.5;2;1.5" dur="0.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="21" cy="5.5" r="1.2" fill="#660000" opacity="0.7">
                  <animate attributeName="cx" values="21;25;21" dur="0.4s" begin="0.1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.4s" begin="0.1s" repeatCount="indefinite" />
                  <animate attributeName="r" values="1.2;1.8;1.2" dur="0.4s" begin="0.1s" repeatCount="indefinite" />
                </circle>
                <circle cx="21" cy="6.5" r="1.2" fill="#660000" opacity="0.7">
                  <animate attributeName="cx" values="21;25;21" dur="0.4s" begin="0.15s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.4s" begin="0.15s" repeatCount="indefinite" />
                  <animate attributeName="r" values="1.2;1.8;1.2" dur="0.4s" begin="0.15s" repeatCount="indefinite" />
                </circle>
                <circle cx="22" cy="6" r="1" fill="#660000" opacity="0.5">
                  <animate attributeName="cx" values="22;26;22" dur="0.4s" begin="0.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.4s" begin="0.2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="1;1.5;1" dur="0.4s" begin="0.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="23" cy="6" r="0.8" fill="#660000" opacity="0.3">
                  <animate attributeName="cx" values="23;27;23" dur="0.4s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.4s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="r" values="0.8;1.2;0.8" dur="0.4s" begin="0.3s" repeatCount="indefinite" />
                </circle>
              </g>
            </svg>
          </div>
        </div>

        {/* Правая группа: контакты — график и 2 номера на широких экранах, 1 номер на узких */}
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 min-w-0">
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
