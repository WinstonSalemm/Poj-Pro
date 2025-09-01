"use client";

import React from "react";

type Step = "cart" | "delivery" | "payment" | "done";

interface Props {
  active: Step;
  className?: string;
}

const steps: { key: Step; label: string }[] = [
  { key: "cart", label: "Cart" },
  { key: "delivery", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "done", label: "Done" },
];

export default function CheckoutStepper({ active, className = "" }: Props) {
  const activeIndex = steps.findIndex((s) => s.key === active);

  return (
    <nav aria-label="Checkout steps" className={`w-full ${className}`}>
      <ol className="flex items-center gap-3">
        {steps.map((step, idx) => {
          const isActive = idx === activeIndex;
          const isCompleted = idx < activeIndex;
          return (
            <li key={step.key} className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium select-none
                ${isActive ? "border-[#660000] text-[#660000] bg-white" : isCompleted ? "border-gray-300 text-gray-700 bg-gray-100" : "border-gray-300 text-gray-400 bg-white"}`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs
                  ${isActive ? "bg-[#660000] text-white" : isCompleted ? "bg-gray-300 text-gray-700" : "bg-gray-200 text-gray-500"}`}
                >
                  {idx + 1}
                </span>
                <span>{step.label}</span>
              </div>
              {idx < steps.length - 1 ? (
                <span className={`h-px w-6 ${idx < activeIndex ? "bg-[#660000]" : "bg-gray-300"}`} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
