import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '../atoms/Button';

// স্ক্রল ট্র্যাকিং ফেইড-ইন অ্যানিমেশন ভ্যারিয়েন্টস
const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
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

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, x: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 80,
    },
  },
};

export const AboutSection: React.FC = () => {
  // বিটুবি স্ট্যান্ডার্ড অর্গানিক ফুড/স্পাইসেস সাজানো ছবি (Part 01, Image Policy অনুযায়ী)
  const defaultSpicesImage = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800';

  const checklistItems = [
    'Strong supplier network',
    'Best quality products',
    'Competitive pricing',
    'Long-term partnership',
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-left relative overflow-hidden">
      <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* বাম কলাম: টেক্সট কন্টেন্ট ও চেকলিস্ট (ডেস্কটপে ৭ কলাম - Part 03, Section 07) */}
        <motion.div 
          className="lg:col-span-7 flex flex-col text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          {/* প্রিমিয়াম আইব্রো লেবেল */}
          <motion.span 
            variants={fadeUpVariants}
            className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block"
          >
            Who We Are
          </motion.span>

          {/* সেকশন হেডিং (H2) - ইমেজ প্রিভিউ অনুযায়ী হুবহু মিলানো */}
          <motion.h2 
            variants={fadeUpVariants}
            className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-6"
          >
            Trusted B2B Product Supply Partner
          </motion.h2>

          {/* কর্পোরেট বিটুবি ডেসক্রিপশন প্যারাগ্রাফ (ব্রিটিশ ইংলিশ ও ব্র্যান্ড মোটো সিঙ্ক সহ) */}
          <motion.p 
            variants={fadeUpVariants}
            className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-4"
          >
            ZM Supplier & Trading is a dedicated UK-standard B2B product sourcing and trading company. We are committed to supplying clean, hygienic, and authentic products to commercial buyers, wholesalers, and hospitality businesses across the United Kingdom and global markets.
          </motion.p>

          <motion.p 
            variants={fadeUpVariants}
            className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6"
          >
            We coordinate directly with audited manufacturers and suppliers to implement controlled quality checking and clean presentation. By maintaining transparent communication, we establish predictable supply chains and structured trade agreements for long-term growth.
          </motion.p>

          {/* ৪-আইটেম ট্রাস্ট চেকলিস্ট গ্রিড (Part 03, Section 07) */}
          <motion.div 
            variants={fadeUpVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                {/* গোল্ডেন ব্যাকগ্রাউন্ডে গ্রিন টিক আইকন */}
                <div className="w-5 h-5 rounded-full bg-brand-accent/25 flex items-center justify-center shrink-0 border border-brand-accent/50">
                  <Check className="w-3 h-3 text-brand-primary font-bold" />
                </div>
                <span className="text-sm font-bold text-brand-neutral-charcoal">
                  {item}
                </span>
              </div>
            ))}
          </motion.div>

          {/* "About Us" পেজে যাওয়ার জন্য অ্যাকশন বাটন */}
          <motion.div variants={fadeUpVariants}>
            <Button to="/about" variant="primary" size="md">
              About Us
            </Button>
          </motion.div>
        </motion.div>

        {/* ডান কলাম: সাজানো বিটুবি অর্গানিক ফুড বা স্পাইসেস ছবি (ডেস্কটপে ৫ কলাম) */}
        <motion.div 
          className="lg:col-span-5 w-full flex justify-center items-center relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={imageVariants}
        >
          {/* ছবির পেছনে সজ্জাসংক্রান্ত ২ ডিগ্রি রোটেটেড ফ্রেম */}
          <div className="absolute inset-0 border border-brand-primary/10 rounded-card rotate-2 scale-[1.01] pointer-events-none" />

          <div className="w-full h-[280px] sm:h-[360px] md:h-[400px] rounded-card overflow-hidden shadow-premium border border-brand-neutral-border relative group">
            <img 
              src={defaultSpicesImage} 
              alt="Premium spices and authentic B2B product supply" 
              className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
              loading="lazy" // উপরে ফোল্ড না থাকায় অলস লোডিং বা অলস রেন্ডারিং মেকানিজম ব্যবহার করা হয়েছে
            />
            {/* সফট শ্যাডো গ্রাডিয়েন্ট লেয়ার */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/15 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};