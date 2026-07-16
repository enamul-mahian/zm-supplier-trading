import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, HeartHandshake, Eye, ClipboardCheck, Check } from 'lucide-react';
import { BRAND_INFO } from '../shared/constants';

// গ্লোবাল অর্গানিজমস পুনর্ব্যবহার বা রিসাইক্লিং (Part 06, Rule 37)
import { WhyChooseUsSection } from '../components/organisms/WhyChooseUsSection'; // ৫ বেনিফিট কার্ড + ৪ ট্রাস্ট স্ট্রিপ সংবলিত রিয়াল লেআউট
import { ProcessSection } from '../components/organisms/ProcessSection'; // বায়ার ট্রানজ্যাকশন জার্নি বা ৪-ধাপের প্রসেস
import { InquiryCTASection } from '../components/organisms/InquiryCTASection'; // ফাইনাল কোটেশন প্যানেল

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
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

// ১. কাস্টম ইনার-পেজ হিরো ব্যানার (Part 04, Section 03)
const WhyUsHero: React.FC = () => {
  return (
    <section className="bg-brand-secondary text-white py-16 text-left relative overflow-hidden border-b border-brand-secondary-dark">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
      
      <div className="premium-container relative z-10">
        {/* রুট-ব্রেডক্রাম্বস */}
        <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
          <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-accent">Why Choose Us</span>
        </nav>
        
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
          Why Choose Us
        </h1>
        <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
          UK-standard commercial coordination, clean hygienic presentation, and stable wholesale supply chain routes.
        </p>
      </div>
    </section>
  );
};

// ২. ট্রাস্ট ও কমপ্লায়েন্স গভীর বিশ্লেষণ সেকশন (Sourcing & Logistics deep dive - Part 04, Section 10)
const SourcingAssurance: React.FC = () => {
  const assurances = [
    'Rigorous supplier audit and evaluation schedules',
    'Independent third-party specification verifications',
    'Audited packaging, case weights, and shipping containers',
    'Predictable and secure B2B transaction communication',
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-left border-b border-brand-neutral-border relative overflow-hidden">
      <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <motion.div 
          className="lg:col-span-7 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
        >
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block">
            Sourcing Precision
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-6">
            Predictable Supply Chain Coordination
          </h2>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6">
            To provide high-level commercial security for wholesalers and importers, we coordinate our supply streams with verified logistics and production partners. We make it our priority to systematically eliminate the delays and specification discrepancies often found in fragmented trade systems.
          </p>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
            By organising transparent communication, structured cargo manifestations, and packaging compliance reviews, {BRAND_INFO.name} establishes a stable partnership framework built for long-term commercial trade.
          </p>
        </motion.div>

        <motion.div 
          className="lg:col-span-5 flex flex-col space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
        >
          {assurances.map((item, index) => (
            <div 
              key={index}
              className="flex items-center space-x-3 bg-brand-bg-alt/50 p-4 rounded-xl border border-brand-neutral-border"
            >
              <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-brand-primary font-bold" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-brand-neutral-charcoal capitalize">
                {item}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export const WhyChooseUs: React.FC = () => {
  return (
    <>
      {/* গ্লোবাল ট্রাস্ট এসইও মেটা ট্যাগস (Part 07, Rule 06) */}
      <Helmet>
        <title>Why Choose Us | {BRAND_INFO.name} | Reliable B2B Sourcing</title>
        <meta name="description" content="Discover why businesses trust ZM Supplier & Trading: UK-standard quality checks, clean hygienic handling, transparent communication, and predictable B2B supply logistics." />
        <link rel="canonical" href="https://zmsupplier.co.uk/why-choose-us" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col">
        {/* ধাপ ০১: ইনার পেজ হিরো ব্যানার */}
        <WhyUsHero />

        {/* ধাপ ০২: ৪ নম্বর পেজ অনুযায়ী হুবহু ৫টি বেনিফিট কার্ড এবং নিচের ৪-কলামের গ্লোবাল ট্রাস্ট স্ট্রিপ (রিসাইক্লিং) */}
        <WhyChooseUsSection />

        {/* ধাপ ০৩: কমার্শিয়াল সোর্সিং এবং সরবরাহ নিশ্চয়তা বিশ্লেষণ */}
        <SourcingAssurance />

        {/*  ধাপ ০৪: বায়ার জার্নি বা ৪-ধাপের প্রসেস টাইমলাইন (রিসাইক্লিং - Part 04, Section 10) */}
        <ProcessSection />

        {/* ধাপ ০৫: গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল */}
        <InquiryCTASection />
      </div>
    </>
  );
};