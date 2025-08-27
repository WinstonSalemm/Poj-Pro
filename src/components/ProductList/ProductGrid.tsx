import React from "react";
import cls from "./ProductGrid.module.css";

export default function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <section className="container">
      <div className={cls.grid}>{children}</div>
    </section>
  );
}
