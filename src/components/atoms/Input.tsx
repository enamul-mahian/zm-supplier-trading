import React, { forwardRef } from 'react';

// ইনপুট কম্পোনেন্টের শক্তিশালী টাইপ সেফ প্রোপার্টিজ ইন্টারফেস (Part 06, Rule 05)
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  multiline?: boolean; // টেক্সট্রিয়া (textarea) হিসেবে ব্যবহারের জন্য ফ্ল্যাগ
  rows?: number; // টেক্সট্রিয়ার ক্ষেত্রে ডিফল্ট রো সংখ্যা
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

// React.forwardRef ব্যবহার করা হয়েছে যাতে পরবর্তীতে React Hook Form বা সরাসরি DOM ref সহজেই ট্র্যাক করা যায়
export const Input = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      success,
      multiline = false,
      rows = 4,
      leftIcon,
      rightIcon,
      required,
      disabled,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    // অ্যাক্সেসিবিলিটি (Aria) ও আইডি ট্র্যাকিং হেল্পারস
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // ডিজাইন টোকেন অনুযায়ী বর্ডার রেডিয়াস ও ইনপুট সিএসএস সেটআপ
    const baseInputStyle = 'block w-full border text-sm transition-all duration-300 rounded-form bg-white text-brand-neutral-charcoal placeholder:text-brand-neutral-muted disabled:bg-brand-neutral-gray disabled:cursor-not-allowed';
    
    // প্রিমিয়াম গোল্ড-সবুজ থিমের সাথে সামঞ্জস্যপূর্ণ ফোকাস স্টেট
    const focusStyle = 'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

    // ইনপুটের ভ্যালিডেশন স্টেট (Error, Success বা Normal)
    const stateStyle = error
      ? 'border-red-500 focus:ring-red-100 focus:border-red-500'
      : success
      ? 'border-green-500 focus:ring-green-100 focus:border-green-500'
      : 'border-brand-neutral-border hover:border-brand-primary/40';

    // আইকন পজিশনিং প্যাডিং হিসাব
    const paddingStyle = `
      ${leftIcon ? 'pl-11' : 'pl-4'}
      ${rightIcon ? 'pr-11' : 'pr-4'}
      py-3
    `.trim();

    const combinedInputClasses = `${baseInputStyle} ${focusStyle} ${stateStyle} ${paddingStyle} ${className}`.trim();

    return (
      <div className={`flex flex-col w-full text-left ${containerClassName}`.trim()}>
        {/* অ্যাক্সেসিবিলিটি ফ্রেন্ডলি ইনপুট লেবেল (Required মার্কার সহ) */}
        {label && (
          <label 
            htmlFor={inputId} 
            className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal inline-flex items-center"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        {/* ইনপুট র‍্যাপার (যা আইকন পজিশন কন্ট্রোল করবে) */}
        <div className="relative w-full rounded-form">
          {/* বাম পাশের আইকন পজিশনিং */}
          {leftIcon && (
            <div 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-brand-neutral-muted pointer-events-none" 
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          {/* ডাইনামিক রেন্ডারিং: multiline সত্য হলে <textarea>, না হলে সাধারণ <input> */}
          {multiline ? (
            <textarea
              id={inputId}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              disabled={disabled}
              className={combinedInputClasses}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              {...(rest as any)}
            />
          ) : (
            <input
              id={inputId}
              ref={ref as React.Ref<HTMLInputElement>}
              disabled={disabled}
              className={combinedInputClasses}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              {...rest}
            />
          )}

          {/* ডান পাশের আইকন পজিশনিং */}
          {rightIcon && (
            <div 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-brand-neutral-muted pointer-events-none" 
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* অ্যাক্সেসিবিলিটি (WCAG 2.1 AA) কমপ্লায়েন্ট এরর মেসেজ বা হেল্পার টেক্সট */}
        {error ? (
          <span id={errorId} className="mt-1.5 text-xs font-semibold text-red-600" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span id={helperId} className="mt-1.5 text-xs text-brand-neutral-muted">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';