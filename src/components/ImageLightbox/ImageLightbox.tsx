"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ImageLightbox({ src, alt, isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        style={{ zIndex: 1000000 }}
        aria-label="Close"
      >
        <X size={32} />
      </button>
      <div className="relative flex items-center justify-center w-full h-full p-4">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-contain"
          quality={90}
        />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
