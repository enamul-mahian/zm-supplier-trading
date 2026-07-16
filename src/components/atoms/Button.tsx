import React from 'react';
import { Link } from 'react-router-dom';

// বাটন কম্পোনেন্টের শক্তিশালী টাইপ সেফ প্রোপার্টিজ ইন্টারফেস (Part 06, Rule 04)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  to?: string; // রিয়্যাক্ট রাউটারের ইন্টারনাল লিঙ্কের জন্য
  href?: string; // এক্সটার্নাল বা এংকর লিঙ্কের জন্য
  external?: boolean; // নতুন ট্যাবে লিঙ্ক ওপেন করার জন্য (target="_blank")
}

// অ্যাক্সেসিবিলিটি ফ্রেন্ডলি সিএসএস লোডিং স্পিনার কম্পোনেন্ট
const LoadingSpinner: React.FC = () => (
  <svg 
    className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" 
    fill="none" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  to,
  href,
  external = false,
  disabled,
  className = '',
  type = 'button',
  ...rest
}) => {
  // ডিজাইন টোকেন ও থিম কালার সিঙ্ক করে সিএসএস ক্লাসের সমন্বয়
  const baseStyle = 'inline-flex items-center justify-center font-heading font-semibold transition-all duration-300 rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-soft hover:shadow-premium focus-visible:ring-brand-primary',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary-dark shadow-soft focus-visible:ring-brand-secondary',
    outline: 'border border-brand-primary text-brand-primary hover:bg-brand-primary/5 focus-visible:ring-brand-primary',
    ghost: 'text-brand-primary hover:bg-brand-primary/5 focus-visible:ring-brand-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
    warning: 'bg-brand-accent text-brand-neutral-charcoal hover:bg-brand-accent-dark shadow-soft hover:shadow-accent focus-visible:ring-brand-accent',
    text: 'text-brand-neutral-charcoal hover:text-brand-primary underline underline-offset-4 focus-visible:ring-brand-primary',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 h-9',
    md: 'text-sm px-5 py-2.5 h-11',
    lg: 'text-base px-7 py-3.5 h-[52px]',
  };

  const widthStyle = fullWidth ? 'w-full' : 'w-auto';
  
  // সবগুলো ক্লাসের সমন্বয়
  const combinedClasses = `${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`.trim();

  // বাটনের ভেতরের কন্টেন্ট রেন্ডার লজিক (লোডিং মেকানিজম এবং আইকন পজিশনিং সহ)
  const renderContent = () => (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        leftIcon && <span className="mr-2 inline-flex items-center justify-center" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="ml-2 inline-flex items-center justify-center" aria-hidden="true">{rightIcon}</span>
      )}
    </>
  );

  // ১. যদি রিয়্যাক্ট রাউটারের ইন্টারনাল লিঙ্ক (to) প্রোপস থাকে
  if (to) {
    return (
      <Link 
        to={to} 
        className={combinedClasses}
        {...(rest as any)}
      >
        {renderContent()}
      </Link>
    );
  }

  // ২. যদি সাধারণ বা এক্সটার্নাল এংকর লিঙ্ক (href) প্রোপস থাকে
  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...(rest as any)}
      >
        {renderContent()}
      </a>
    );
  }

  // ৩. সাধারণ এন্ট্রি বা ফর্ম সাবমিশন বাটন রেন্ডার
  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {renderContent()}
    </button>
  );
};