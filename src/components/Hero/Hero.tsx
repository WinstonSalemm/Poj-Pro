"use client";
import React from 'react';
import Image from 'next/image';
import { IMG_SIZES } from '@/lib/imageSizes';
import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import cls from './Hero.module.css';

export default function Hero(){
  return (
    <section className={cls.hero}>
      <div className="container">
        <div className={cls.wrap}>
          <div className={cls.left}>
            <h1 className={cls.title}>Пожарная безопасность уровня PRO</h1>
            <p className={cls.subtitle}>Сертифицированное оборудование, проектирование и монтаж. Надёжные решения для бизнеса и объектов любой сложности.</p>
            <div className={cls.cta}>
              <Link href="/catalog"><Button variant="primary" size="lg">Каталог</Button></Link>
              <Link href="/contacts"><Button variant="secondary" size="lg">Связаться</Button></Link>
            </div>
          </div>
          <div className={cls.right}>
            <div className="aspect-square">
              <Image
                src="/OtherPics/hero-fire.png"
                alt="POJ PRO fire safety"
                fill
                priority
                sizes={IMG_SIZES.hero}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
