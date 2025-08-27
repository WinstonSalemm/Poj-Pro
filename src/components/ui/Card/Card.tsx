import React from 'react';
import cls from './Card.module.css';

type Props = React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode };

export default function Card({ children, className, ...rest }: Props) {
  return (
    <div className={[cls.card, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
