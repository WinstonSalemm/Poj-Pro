"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

const IMAGES: string[] = [
    "/OtherPics/product1photo.png",
    "/OtherPics/product2photo.jpg",
    "/OtherPics/product3photo.png",
    "/OtherPics/product5photo.png",
    "/OtherPics/product6photo.png",
];

export default function ImageSlider() {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
        }, 6000);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        startTimer();
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

    return (
        <div
            className="w-full max-w-[1200px] mt-20 mx-auto relative overflow-hidden border-none shadow-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative w-full h-[600px] max-[1024px]:h-[400px] max-[768px]:h-[300px] bg-transparent overflow-hidden">
                {IMAGES.map((img, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => goToSlide(index)}
                        className={`absolute top-0 left-0 w-full h-full bg-white bg-no-repeat bg-center bg-contain opacity-0 transition-opacity duration-800 ease-in-out p-5 box-border cursor-pointer ${index === currentIndex ? "opacity-100 z-10 animate-fadeIn" : ""
                            }`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}

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
