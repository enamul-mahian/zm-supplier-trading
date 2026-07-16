import React from 'react';
import { motion } from 'framer-motion';
import { Globe, FileText, Ship, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const textVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
    },
  },
};

const mapVariants = {
  hidden: { opacity: 0, scale: 0.95, x: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 80,
      delay: 0.2,
    },
  },
};

interface TradeFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const InternationalTradeSection: React.FC = () => {
  // প্রজেক্ট গাইডলাইন ও আইনি ঝুঁকি এড়াতে বিচক্ষণ কপিরাইটিং (Part 03, Section 13)
  const tradeFeatures: TradeFeature[] = [
    {
      icon: <Globe className="w-5 h-5 text-brand-primary" />,
      title: 'Market Assessment Support',
      description: 'Assisting in reviews of import specifications, commercial volumes, and destination compliance.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-brand-primary" />,
      title: 'Supplier Coordination',
      description: 'Bridging communication between global commercial buyers and audited manufacturing facilities.',
    },
    {
      icon: <FileText className="w-5 h-5 text-brand-primary" />,
      title: 'Documentation Assistance',
      description: 'Information preparation and coordination support for customs invoices, certificates, and trade checklists.',
    },
    {
      icon: <Ship className="w-5 h-5 text-brand-primary" />,
      title: 'Logistics Planning Support',
      description: 'Structured coordination with cargo freight partners to plan efficient cross-border transport routes.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-brand-bg-alt text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ডে কাস্টম পান্না সবুজ ফ্লেয়ার */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none" />

      <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* বাম কলাম: কন্টেন্ট ও ৪-ধাপের গ্লোবাল ক্যাপাবিলিটি লিস্ট (ডেস্কটপে ৭ কলাম) */}
        <motion.div 
          className="lg:col-span-7 flex flex-col text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {/* প্রিমিয়াম আইব্রো লেবেল */}
          <motion.span 
            variants={textVariants}
            className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            Global Reach
          </motion.span>

          {/* সেকশন হেডিং (H2) */}
          <motion.h2 
            variants={textVariants}
            className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-6"
          >
            International Supply & <br className="hidden sm:inline" />
            Cross-Border Sourcing Support
          </motion.h2>

          {/* বিচক্ষণ ও বাস্তবসম্মত কপিরাইটিং (Part 03, Section 13) */}
          <motion.p 
            variants={textVariants}
            className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-8 max-w-2xl"
          >
            We coordinate product supply chains across selected international trade routes, assisting commercial buyers and wholesalers in communicating parameters and compiling standard cargo information. We do not provide regulated legal advice or direct customs brokerage.
          </motion.p>

          {/* ৪-ধাপের ইনফোগ্রাফিক লিস্ট রেন্ডারিং */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {tradeFeatures.map((feature, index) => (
              <motion.div 
                key={index}
                className="flex flex-col bg-brand-surface p-5 rounded-xl border border-brand-neutral-border shadow-soft hover:shadow-premium transition-all duration-300 group text-left"
                variants={textVariants}
              >
                <div className="w-9 h-9 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-4 shrink-0 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-sm text-brand-neutral-charcoal mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-brand-neutral-muted leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* কাস্টম ইনকোয়ারি সিটিএ বাটন */}
          <motion.div variants={textVariants}>
            <Button to="/contact" variant="primary" size="md">
              Start Global Sourcing Enquiry
            </Button>
          </motion.div>
        </motion.div>

        {/* ডান কলাম: রেসপন্সিভ গ্লোবাল ট্রেড এসভিজি ম্যাপ ভিজ্যুয়াল (ডেস্কটপে ৫ কলাম) */}
        <motion.div 
          className="lg:col-span-5 w-full flex justify-center items-center relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={mapVariants}
        >
          {/* সজ্জাসংক্রান্ত ২ ডিগ্রি রোটেটেড ফ্রেম */}
          <div className="absolute inset-0 border border-brand-primary/10 rounded-card rotate-2 scale-[1.01] pointer-events-none" />

          <div className="w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] rounded-card bg-brand-secondary overflow-hidden shadow-premium border border-brand-primary-light flex items-center justify-center relative p-6 group">
            
            {/* ১. হাই-এন্ড ভেক্টর ম্যাপ ইলাস্ট্রেশন (Vite / CLS ফ্রেন্ডলি) */}
            <svg 
              className="w-full h-full text-brand-primary/20 opacity-90 transition-transform duration-[6000ms] group-hover:scale-[1.03]" 
              viewBox="0 0 800 450" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* গ্লোবাল গ্রিড লাইনস */}
              <path d="M 50 0 L 50 450 M 150 0 L 150 450 M 250 0 L 250 450 M 350 0 L 350 450 M 450 0 L 450 450 M 550 0 L 550 450 M 650 0 L 650 450 M 750 0 L 750 450" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
              <path d="M 0 50 L 800 50 M 0 150 L 800 150 M 0 250 L 800 250 M 0 350 L 800 350" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
              
              {/* বৃত্তাকার অরবিটাল ট্রেড রুটস (Connected Dotted Trails) */}
              <path d="M 320 120 C 350 180, 480 180, 520 280" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M 320 120 C 220 180, 180 200, 150 320" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M 320 120 C 400 100, 580 80, 680 160" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6 6" />

              {/* ট্রাস্ট হটস্পট ডটস (Pulsing points) */}
              {/* UK Hub */}
              <circle cx="320" cy="120" r="6" fill="#D4AF37" />
              {/* International Route Point 1 */}
              <circle cx="520" cy="280" r="4.5" fill="#024E33" stroke="#D4AF37" strokeWidth="1.5" />
              {/* International Route Point 2 */}
              <circle cx="150" cy="320" r="4.5" fill="#024E33" stroke="#D4AF37" strokeWidth="1.5" />
              {/* International Route Point 3 */}
              <circle cx="680" cy="160" r="4.5" fill="#024E33" stroke="#D4AF37" strokeWidth="1.5" />
            </svg>

            {/* ২. গ্লোব হটস্পট সিএসএস অ্যানিমেটেড রিং ইফেক্ট (UK Sourcing Hub) */}
            <div className="absolute top-[28%] left-[40%] sm:top-[28%] sm:left-[40%] flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-accent"></span>
            </div>

            {/* ম্যাপ কভার গ্লোবাল অরবিট টেক্সট লেবেল */}
            <div className="absolute bottom-5 left-5 text-left select-none">
              <span className="block font-heading font-extrabold text-[10px] uppercase tracking-widest text-brand-accent">
                International Coordination
              </span>
              <span className="block font-heading text-[9px] text-brand-accent-pale font-medium mt-1">
                UK Sourcing Hub Connecting Global Trade Routes
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};