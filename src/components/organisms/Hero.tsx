import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe, Truck, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';
import { BRAND_INFO } from '../../shared/constants';

// ফেইড-আপ ও স্ট্যাগারড ট্রানজিশনের জন্য ফ্রেমার মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
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

export const Hero: React.FC = () => {
  // বিটুবি স্ট্যান্ডার্ড লাইভ অপ্টিমাইজড ক্লাউডিনারি বা প্রফেশনাল ইমেজ পাথ (CMS এডিটেবল)
  const defaultHeroImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200';

  return (
    <section className="relative overflow-hidden bg-brand-bg py-16 md:py-24 lg:py-28 text-left">
      {/* ব্যাকগ্রাউন্ডে অত্যন্ত হালকা কাস্টম গোল্ডেন ফ্লেয়ার শ্যাডো */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />

      <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* বাম কলাম: কন্টেন্ট এরিয়া (৭ কলাম ডেস্কটপে - Part 03, Section 05) */}
        <motion.div 
          className="lg:col-span-7 flex flex-col justify-center text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* প্রিমিয়াম আইব্রো লেবেল (Eyebrow Label) */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-brand-primary/5 text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase px-3 py-1.5 rounded-full w-fit mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span>UK Standard Sourcing Solutions</span>
          </motion.div>

          {/* ১. বোল্ড হেডিং (H1) - ইমেজ প্রিভিউ অনুযায়ী হুবহু মিলানো */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-[56px] leading-[1.1] font-heading font-extrabold text-brand-neutral-charcoal text-balance mb-6"
          >
            UK Standard. <br />
            <span className="text-brand-primary">Clean. Hygienic.</span> <br />
            Authentic Product Supply.
          </motion.h1>

          {/* ২. প্রিমিয়াম সাব-ডেসক্রিপশন */}
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-brand-neutral-muted leading-relaxed mb-8 max-w-xl"
          >
            Reliable B2B supply partner delivering high-quality products to businesses across the United Kingdom and worldwide. Specialised in structured trade and long-term partnerships.
          </motion.p>

          {/* ৩. সিটিএ বাটন গ্রুপ (Our Services এবং Contact Us - Outlined) */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto"
          >
            <Button to="/services" variant="primary" size="lg" className="w-full sm:w-auto">
              Our Services
            </Button>
            <Button to="/contact" variant="outline" size="lg" className="w-full sm:w-auto">
              Contact Us
            </Button>
          </motion.div>

          {/* ৪. হিরো ট্রাস্ট ইন্ডিকেটর বা আইকন স্ট্রিপ (A11y Compliant) */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-neutral-border max-w-lg"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0" />
              <span className="text-xs font-bold text-brand-neutral-charcoal leading-tight">Quality Assured</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Globe className="w-5 h-5 text-brand-primary shrink-0" />
              <span className="text-xs font-bold text-brand-neutral-charcoal leading-tight">Global Trade</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Truck className="w-5 h-5 text-brand-primary shrink-0" />
              <span className="text-xs font-bold text-brand-neutral-charcoal leading-tight">Reliable Logistics</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ডান কলাম: প্রিমিয়াম লজিস্টিকস ইমেজ প্যানেল (৫ কলাম ডেস্কটপে - Part 03, Section 05) */}
        <motion.div 
          className="lg:col-span-5 w-full flex justify-center items-center relative"
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 80, delay: 0.4 }}
        >
          {/* ইমেজের ব্যাকগ্রাউন্ডে সজ্জাসংক্রান্ত গোল্ডেন বর্ডার ও শ্যাডো ফ্রেম */}
          <div className="absolute inset-0 border border-brand-primary/10 rounded-hero -rotate-2 scale-[1.01] pointer-events-none" />
          
          <div className="w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[480px] rounded-hero overflow-hidden shadow-premium border border-brand-neutral-border relative group">
            {/* ক্লাউডিনারি/আউট-লিঙ্কড বিটুবি রেসপন্সিভ ইমেজ (Part 02 - rounded radius '24px' / 'rounded-hero') */}
            <img 
              src={defaultHeroImage} 
              alt="Clean B2B Warehouse and Sourcing Facility" 
              className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
              loading="eager" // LCP উন্নত করতে প্রথম এন্ট্রি ইমেজটিকে দ্রুত লোড করা হচ্ছে
            />
            {/* সফট গ্রাডিয়েন্ট ওভারলে (ইমেজের লাক্সারি ফিল বাড়ানোর জন্য) */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};