import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BRAND_STATS } from '../../shared/constants';
import { Sparkles, Trophy, Globe, Award, ShieldCheck } from 'lucide-react';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
    },
  },
};

// আলাদা কাউন্ট-আপ প্রোপার্টিজ ইন্টারফেস
interface StatCardProps {
  value: string;
  label: string;
  description: string;
  index: number;
}

// জাস্ট-ইন-টাইম কাস্টম লাইটওয়েট কাউন্ট-আপ কম্পোনেন্ট (প্যাকেজ ব্লট ও CLS মুক্ত করার জন্য - Part 07, Rule 32)
const StatCard: React.FC<StatCardProps> = ({ value, label, description, index }) => {
  const [count, setCount] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasMounted = useRef(false);

  // সংখ্যাভিত্তিক ডেটা পার্সিং (যেমন: "100+" বা "100%" থেকে "100" আলাদা করা)
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const hasPlus = value.includes('+');
  const hasPercent = value.includes('%');
  const isNumeric = !isNaN(numericValue);

  // অ্যাক্সেসিবিলিটি (WCAG 2.1 AA): সিস্টেমে অ্যানিমেশন কমানো (Reduced Motion) থাকলে ডিটেক্ট করা
  useEffect(() => {
    hasMounted.current = true;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      if (hasMounted.current) {
        setPrefersReducedMotion(event.matches);
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => {
      hasMounted.current = false;
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  // কাস্টম JS পারফরম্যান্স-ফ্রেন্ডলি কাউন্ট-আপ ট্রিগার
  useEffect(() => {
    if (!isNumeric || prefersReducedMotion) {
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 1500; // ১.৫ সেকেন্ডে অ্যানিমেশন সমাপ্ত হবে
    const stepTime = Math.max(Math.floor(duration / end), 15);

    const timer = setInterval(() => {
      // স্প্রিং এফেক্টের মতো বড় সংখ্যাকে দ্রুত ইনক্রিমেন্ট করার জন্য ম্যাথ স্টেপ ক্যালকুলেশন
      start += Math.max(Math.ceil(end / 80), 1);
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [numericValue, isNumeric, prefersReducedMotion]);

  // "UK" এর মতো টেক্সট থাকলে সরাসরি শো করবে, অন্যথায় কাউন্ট-আপ ভ্যালু
  const displayValue = isNumeric
    ? `${prefersReducedMotion ? numericValue : count}${hasPlus ? '+' : ''}${hasPercent ? '%' : ''}`
    : value;

  // ৪টি প্রধান স্ট্যাটের জন্য সুনির্দিষ্ট Lucide আইকন অ্যাসাইনমেন্ট
  const getStatIcon = (idx: number) => {
    const iconStyle = "w-5 h-5 text-brand-accent";
    switch (idx) {
      case 0: return <ShieldCheck className={iconStyle} />;
      case 1: return <Award className={iconStyle} />;
      case 2: return <Globe className={iconStyle} />;
      default: return <Trophy className={iconStyle} />;
    }
  };

  return (
    <motion.div
      className="bg-brand-secondary-dark/60 p-6 rounded-card border border-brand-primary-light/10 shadow-soft hover:border-brand-accent/20 transition-all duration-300 flex flex-col items-center text-center group"
      variants={cardVariants}
    >
      {/* আইকন কন্টেইনার */}
      <div className="w-10 h-10 rounded-lg bg-brand-primary/15 border border-brand-primary-light/5 flex items-center justify-center mb-4 select-none">
        {getStatIcon(index)}
      </div>

      {/* গোল্ডেন কাউন্ট-আপ নাম্বার */}
      <span className="font-heading font-extrabold text-3xl sm:text-4xl text-brand-accent tracking-tight mb-2 select-none group-hover:scale-105 transition-transform duration-300">
        {displayValue}
      </span>

      {/* স্ট্যাট শিরোনাম (সাদা কালার) */}
      <h3 className="font-heading font-bold text-sm text-white mb-1.5 uppercase tracking-wider">
        {label}
      </h3>

      {/* স্ট্যাট ডেসক্রিপশন (ম্লান গোল্ডেন কালার) */}
      <p className="text-xs text-brand-accent-pale/80 leading-relaxed max-w-[200px]">
        {description}
      </p>
    </motion.div>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 bg-brand-secondary text-white border-b border-brand-secondary-dark relative overflow-hidden text-center">
      {/* ব্যাকগ্রাউন্ড গোল্ডেন ফ্লেয়ার */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />

      <div className="premium-container relative z-10">
        
        {/* ৪-কলাম বিশিষ্ট গ্লোবাল বিটুবি স্ট্যাটস গ্রিড (Part 03, Section 15) */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {BRAND_STATS.map((stat, index) => (
            <StatCard
              key={index}
              index={index}
              value={stat.value}
              label={stat.label}
              description={stat.description}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
};