import React from 'react';
import { motion } from 'framer-motion'; // সঠিক ফ্রেমার মোশন ইমপোর্ট (টাইপ এরর ফিক্সড)
import { ShieldCheck, Sparkles, FileCheck2, Truck } from 'lucide-react';

// স্ট্যাগারড কার্ড রিভিলের জন্য ফ্রেমার মোশন কনফিগ
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
      damping: 20,
      stiffness: 80,
    },
  },
};

interface HighlightItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const TrustHighlights: React.FC = () => {
  // প্রথম পেজ ইমেজ এবং বিটুবি স্ট্যান্ডার্ড ডিরেকশন অনুযায়ী কন্টেন্ট ডেটা (ব্রিটিশ ইংলিশ কনভেনশনে)
  const highlights: HighlightItem[] = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-primary" />,
      title: 'Quality Assured',
      description: 'UK standard quality control and checks at every single step.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-brand-primary" />,
      title: 'Hygienic Process',
      description: 'Clean, safe, and hygienic product handling and packaging.',
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-brand-primary" />,
      title: 'Authentic Products',
      description: '100% authentic products sourced from trusted international origins.',
    },
    {
      icon: <Truck className="w-6 h-6 text-brand-primary" />,
      title: 'Reliable Delivery',
      description: 'On-time product delivery and logistical planning with complete reliability.',
    },
  ];

  return (
    <section className="bg-brand-bg-alt py-10 border-b border-brand-neutral-border text-left relative z-20">
      <div className="premium-container">
        
        {/* ৪-কলাম বিশিষ্ট রেসপন্সিভ কার্ড গ্রিড (Part 03, Section 06) */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group"
              variants={cardVariants}
            >
              {/* প্রিমিয়াম ডিজাইনের সাথে মানানসই আইকন কন্টেইনার ফ্লেক্সিবিলিটি */}
              <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-brand-accent transition-all duration-300">
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
              </div>

              {/* কার্ডের শিরোনাম */}
              <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2">
                {item.title}
              </h3>

              {/* কার্ডের ডেসক্রিপশন */}
              <p className="text-sm text-brand-neutral-muted leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};