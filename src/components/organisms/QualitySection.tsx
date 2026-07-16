import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, Sparkles, ClipboardCheck } from 'lucide-react';
import { Button } from '../atoms/Button';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস (বিকল্প প্যাটার্ন অনুযায়ী এবার ইমেজ থাকবে বামে এবং টেক্সট ডানে)
const textVariants = {
  hidden: { opacity: 0, x: 24 },
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

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, x: -24 },
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

export const QualitySection: React.FC = () => {
  // কোয়ালিটি ইন্সপেকশন বা প্যাকেজিং রিভিউ সম্পর্কিত প্রিমিয়াম ইমেজ (Part 01, Image Policy অনুযায়ী)
  const defaultQualityImage = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800';

  // আইনগত ঝুঁকি ও অতিরিক্ত গ্যারান্টি এড়াতে বিচক্ষণ ও বাস্তবসম্মত চেকলিস্ট (Part 03, Section 12)
  const qualityChecks = [
    'Rigorous supplier verification and information review',
    'Consistent product specification coordination',
    'Clean handling and professional storage expectations',
    'Cautious packaging and labelling reviews',
    'Transparent documentation coordination support',
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ডে কাস্টম গোল্ডেন শ্যাডো ফ্লেয়ার */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

      <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* বাম কলাম: কোয়ালিটি কন্ট্রোল ও ইন্সপেকশন ইমেজ (ডেস্কটপে ৫ কলাম) */}
        <motion.div 
          className="lg:col-span-5 w-full flex justify-center items-center relative order-2 lg:order-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={imageVariants}
        >
          {/* ছবির পেছনে সজ্জাসংক্রান্ত নেগেটিভ ২ ডিগ্রি রোটেটেড ফ্রেম */}
          <div className="absolute inset-0 border border-brand-primary/10 rounded-card -rotate-2 scale-[1.01] pointer-events-none" />

          <div className="w-full h-[280px] sm:h-[360px] md:h-[400px] lg:h-[460px] rounded-card overflow-hidden shadow-premium border border-brand-neutral-border relative group">
            <img 
              src={defaultQualityImage} 
              alt="Careful B2B Quality Sourcing Inspection and Audit" 
              className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/15 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* ডান কলাম: কোয়ালিটি ডেসক্রিপশন কন্টেন্ট ও পয়েন্ট চেকলিস্ট (ডেস্কটপে ৭ কলাম) */}
        <motion.div 
          className="lg:col-span-7 flex flex-col text-left order-1 lg:order-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
        >
          {/* প্রিমিয়াম আইব্রো লেবেল */}
          <motion.span 
            variants={textVariants}
            className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-brand-accent" />
            Quality Control
          </motion.span>

          {/* সেকশন হেডিং (H2) - গাইডলাইন অনুযায়ী মিলানো */}
          <motion.h2 
            variants={textVariants}
            className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-6"
          >
            Quality, Cleanliness and <br className="hidden sm:inline" />
            Authenticity at Every Stage
          </motion.h2>

          {/* বিচক্ষণ ও বাস্তবসম্মত প্যারাগ্রাফ (গ্যারান্টিমুক্ত ও বিশ্বস্ত কপিরাইটিং - Part 03, Section 12) */}
          <motion.p 
            variants={textVariants}
            className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-4"
          >
            We focus on coordinating product specifications with our trusted supplier network to ensure that what we source aligns cleanly with your business expectations. Our approach is built on careful information assessment and practical review, ensuring your wholesale consignments are handled traceably and responsibly.
          </motion.p>

          <motion.p 
            variants={textVariants}
            className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6"
          >
            We support our B2B clients by reviewing packaging integrity and labelling compliance. While we do not claim native laboratory testing, we establish strict quality-focused expectations with our manufacturing partners to protect the authenticity of every supply project.
          </motion.p>

          {/* ৫-আইটেম প্রিমিয়াম চেকলিস্ট গ্রিড */}
          <motion.div 
            variants={textVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-8"
          >
            {qualityChecks.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-brand-primary/5 border border-brand-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-brand-primary font-bold" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-brand-neutral-dark leading-tight">
                  {item}
                </span>
              </div>
            ))}
          </motion.div>

          {/* কাস্টম কোয়ালিটি ডিরেকশন সিটিএ বাটন */}
          <motion.div variants={textVariants}>
            <Button to="/quality" variant="outline" size="md">
              Learn About Our Quality Approach
            </Button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};