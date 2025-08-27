import cls from './Button.module.css';
import React from 'react';

type Variant = 'primary'|'secondary'|'ghost';
type Size = 'md'|'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
}
export default function Button({className = '', variant='primary', size='md', ...props}: ButtonProps){
  return <button className={[cls.btn, cls[variant], cls[size], className].join(' ')} {...props} />;
}
