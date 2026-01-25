import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600
      hover:from-primary-600 hover:to-primary-700
      text-white shadow-button hover:shadow-lg
      focus:ring-primary-400
    `,
    secondary: `
      bg-secondary-100 hover:bg-secondary-200
      text-secondary-700
      focus:ring-secondary-300
    `,
    outline: `
      border-2 border-secondary-200 hover:border-secondary-300
      bg-white hover:bg-secondary-50
      text-secondary-700
      focus:ring-secondary-300
    `,
    ghost: `
      bg-transparent hover:bg-secondary-100
      text-secondary-600 hover:text-secondary-800
      focus:ring-secondary-300
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-emerald-600
      hover:from-emerald-600 hover:to-emerald-700
      text-white shadow-button hover:shadow-lg
      focus:ring-emerald-400
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
      text-white shadow-button hover:shadow-lg
      focus:ring-red-400
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-3',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
