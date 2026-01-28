"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function TopBar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Скрываем TopBar на страницах логина и регистрации
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  useEffect(() => {
    // Устанавливаем CSS переменную для высоты TopBar
    const topbar = document.querySelector('[data-topbar]') as HTMLElement;
    if (topbar) {
      const height = topbar.offsetHeight;
      document.documentElement.style.setProperty('--topbar-height', `${height}px`);
    }
  }, []);

  return (
    <div
      data-topbar
      className="fixed top-0 left-0 right-0 z-[1000] w-full bg-white text-[#660000] py-1 px-2 sm:px-4"
      style={{
        paddingTop: "max(4px, env(safe-area-inset-top))",
      }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-end gap-1 sm:gap-2 md:gap-3 pr-12 sm:pr-20 md:pr-32">
        {/* Анимация огнетушителя */}
        <div 
          className="relative flex items-center justify-center mr-2 sm:mr-4" 
          style={{ 
            width: '150px',
            height: '24px',
            position: 'relative',
            perspective: '1000px',
            perspectiveOrigin: 'center center',
            overflow: 'visible'
          }}
        >
          <div
            style={{
              animation: 'extinguisherMove 8s ease-in-out infinite',
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center',
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: '-16px',
              marginTop: '-10px',
            }}
          >
            <svg
              width="32"
              height="20"
              viewBox="0 0 32 20"
              className="relative z-10"
              style={{
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(3px 3px 6px rgba(102, 0, 0, 0.5))',
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

        {/* Время работы - не кликабельное */}
        <div className="text-[#660000]/90 whitespace-nowrap text-[10px] sm:text-xs">
          {t("contacts.hours.weekdays")}, {t("contacts.hours.saturday")}
        </div>

        {/* Разделитель */}
        <div className="hidden sm:block w-px h-3 bg-[#660000]/30" />

        {/* Номера телефонов - кликабельные */}
        <a
          href="tel:+998712536616"
          className="text-[#660000] hover:bg-[#660000] hover:text-white px-1.5 sm:px-2 py-0.5 rounded transition-colors whitespace-nowrap text-[10px] sm:text-xs"
        >
          +998 71 253 66 16
        </a>
        <a
          href="tel:+998909791218"
          className="text-[#660000] hover:bg-[#660000] hover:text-white px-1.5 sm:px-2 py-0.5 rounded transition-colors whitespace-nowrap text-[10px] sm:text-xs"
        >
          +998 90 979 12 18
        </a>

        {/* Разделитель */}
        <div className="hidden sm:block w-px h-3 bg-[#660000]/30" />

        {/* Telegram - кликабельный */}
        <a
          href="https://t.me/pojsystema"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#660000] hover:bg-[#660000] hover:text-white px-1.5 sm:px-2 py-0.5 rounded transition-colors whitespace-nowrap text-[10px] sm:text-xs"
        >
          Telegram
        </a>
      </div>
    </div>
  );
}
