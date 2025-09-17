"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { HERO_IMAGES } from "@/components/ImageSlider/images";

const IMAGES: string[] = HERO_IMAGES?.length
  ? HERO_IMAGES
  : [
      "/OtherPics/product1photo.png",
      "/OtherPics/product2photo.jpg",
      "/OtherPics/product3photo.png",
      "/OtherPics/product5photo.png",
      "/OtherPics/product6photo.png",
    ];

type SliderVariant = "default" | "overlay";

export default function ImageSlider({ variant = "default" }: { variant?: SliderVariant }) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
        }, 6000);
    }, []);

    // Гарантированно запускаем таймер на маунте и правильно ставим/снимаем паузу
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!isPaused) {
            startTimer();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused, startTimer]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        startTimer();
    }, [startTimer]);

    const goToSlide = useCallback(
        (index: number) => {
            setCurrentIndex(index);
            resetTimer();
        },
        [resetTimer]
    );

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
        resetTimer();
    }, [resetTimer]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
        resetTimer();
    }, [resetTimer]);

    const rootClass = variant === "overlay"
        ? "w-full h-full mx-auto relative overflow-hidden border-none shadow-none"
        : "w-full max-w-[1200px] mt-8 md:mt-10 mx-auto relative overflow-hidden border-none shadow-none";

    const frameClass = variant === "overlay"
        ? "relative w-full h-full bg-white overflow-hidden"
        : "relative w-full h-[420px] max-[1024px]:h-[360px] max-[768px]:h-[280px] bg-white overflow-hidden";

    const isOverlay = variant === "overlay";
    return (
        <div
            className={rootClass}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className={frameClass}>
                {isOverlay ? (
                    // In overlay, render only the current slide to reduce DOM and work
                    <div className="absolute inset-0 opacity-100 z-10">
                        <Image
                            src={IMAGES[currentIndex]}
                            alt={`Hero slide ${currentIndex + 1}`}
                            fill
                            fetchPriority="low"
                            sizes="100vw"
                            className="object-contain"
                            quality={60}
                        />
                        <button
                            type="button"
                            onClick={() => goToSlide(currentIndex)}
                            aria-label={`Go to slide ${currentIndex + 1}`}
                            className="absolute inset-0 cursor-pointer"
                        />
                    </div>
                ) : (
                    IMAGES.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 opacity-0 transition-opacity duration-700 ease-out will-change-opacity ${index === currentIndex ? "opacity-100 z-10" : ""}`}
                        >
                            <Image
                                src={img}
                                alt={`Hero slide ${index + 1}`}
                                fill
                                priority={index === 0 ? true : undefined}
                                sizes="100vw"
                                className="object-contain"
                                quality={75}
                            />
                            <button
                                type="button"
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className="absolute inset-0 cursor-pointer"
                            />
                        </div>
                    ))
                )}

                {/* Prev Arrow */}
                <button
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="absolute top-1/2 cursor-pointer -translate-y-1/2 left-5 w-[50px] h-[50px] max-[1024px]:w-[40px] max-[1024px]:h-[40px] max-[768px]:w-[36px] max-[768px]:h-[36px] bg-[#660000] hover:bg-[#550000] border-none rounded-full text-white text-[1.5rem] flex items-center justify-center shadow-none transition-all duration-300 hover:scale-110 z-10"
                >
                    ❮
                </button>

                {/* Next Arrow */}
                <button
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="absolute top-1/2 cursor-pointer -translate-y-1/2 right-5 w-[50px] h-[50px] max-[1024px]:w-[40px] max-[1024px]:h-[40px] max-[768px]:w-[36px] max-[768px]:h-[36px] bg-[#660000] hover:bg-[#550000] border-none rounded-full text-white text-[1.5rem] flex items-center justify-center shadow-none transition-all duration-300 hover:scale-110 z-10"
                >
                    ❯
                </button>

                {/* Dots */}
                <div className="absolute bottom-5 max-[768px]:bottom-2 left-0 right-0 flex justify-center gap-3 z-10 p-2 bg-transparent">
                    {IMAGES.map((_, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={isActive ? "true" : undefined}
                                className={[
                                    "cursor-pointer",
                                    // размеры
                                    "w-[12px] h-[12px] max-[768px]:w-[10px] max-[768px]:h-[10px]",
                                    // форма и рамка
                                    "rounded-full border-2 border-[#660000] shadow-md",
                                    // базовый и hover цвет
                                    isActive ? "bg-[#660000]" : "bg-white hover:bg-[#660000]",
                                    // анимация
                                    "transition-all duration-200 hover:scale-110",
                                ].join(" ")}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
