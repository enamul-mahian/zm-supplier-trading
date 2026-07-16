import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Globe, FileText, Ship, MessageSquare, Check, HelpCircle } from 'lucide-react';
import { BRAND_INFO } from '../shared/constants';

// গ্লোবাল অর্গানিজমস পুনর্ব্যবহার বা রিসাইক্লিং (Part 06, Rule 37)
import { InternationalTradeSection } from '../components/organisms/InternationalTradeSection'; // এসভিজি ম্যাপ ও ৪-ধাপের গ্লোবাল ক্যাপাবিলিটি সংবলিত রিয়াল লেআউট
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
const GlobalTradeHero: React.FC = () => {
  return (
    <section className="bg-brand-secondary text-white py-16 text-left relative overflow-hidden border-b border-brand-secondary-dark">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
      
      <div className="premium-container relative z-10">
        {/* রুট-ব্রেডক্রাম্বস */}
        <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
          <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-accent">Global Trade</span>
        </nav>
        
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
          International Trade & Market Support
        </h1>
        <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
          UK-standard cross-border supply coordination, documentation assistance, and shipping logistics planning.
        </p>
      </div>
    </section>
  );
};

// ২. কাস্টম বিটুবি ডকুমেন্টেশন সমন্বয় ও সাপোর্ট উইন্ডো (Part 04, Section 12)
const DocumentationAssistance: React.FC = () => {
  const documentSupport = [
    'Assistance in compiling proforma and commercial invoices',
    'Structured preparation of shipping manifests and packing lists',
    'Coordinating manufacturer specification sheets',
    'Facilitating communication of cross-border trade checklists',
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-left border-b border-brand-neutral-border relative overflow-hidden">
      <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* বাম কলাম: বিবরণ */}
        <motion.div 
          className="lg:col-span-7 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
        >
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block">
            Information Management
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-6">
            Structured Documentation Assistance
          </h2>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6">
            We provide essential information preparation and coordination support to help commercial buyers navigate international trade routes seamlessly. By reviewing required trade checklists and assisting in communication with suppliers, we help ensure your B2B documentation is organized and ready for customs processing.
          </p>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
            Please note that our services are focused on coordination and communication support. We do not provide regulated legal advice, customs brokerage, or official regulatory clearance guarantees.
          </p>
        </motion.div>

        {/* ডান কলাম: ডকুমেন্ট চেক লিস্ট */}
        <motion.div 
          className="lg:col-span-5 flex flex-col space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
        >
          {documentSupport.map((item, index) => (
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

export const GlobalTrade: React.FC = () => {
  return (
    <>
      {/* গ্লোবাল ট্রেড এসইও মেটা ট্যাগস (Part 07, Rule 06) */}
      <Helmet>
        <title>International Trade Support | {BRAND_INFO.name}</title>
        <meta name="description" content="ZM Supplier & Trading coordinates global product sourcing and assists in B2B documentation preparation, freight planning, and cross-border commercial communication." />
        <link rel="canonical" href="https://zmsupplier.co.uk/global-trade" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col">
        {/* ধাপ ০১: ইনার পেজ হিরো ব্যানার */}
        <GlobalTradeHero />

        {/* ধাপ ০২: গ্লোবাল ম্যাপ ও ৪-ধাপের ক্যাপাবিলিটি লিস্ট (রিসাইক্লিং - Part 04, Section 12) */}
        <InternationalTradeSection />

        {/* ধাপ ০৩: কাজ বা ট্রানজ্যাকশন করার ৪-ধাপের প্রসেস টাইমলাইন (রিসাইক্লিং) */}
        <ProcessSection />

        {/* ধাপ ০৪: বিটুবি ডকুমেন্টেশন সমন্বয় ও সাপোর্ট বিশ্লেষণ */}
        <DocumentationAssistance />

        {/*  ধাপ ০৫: গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল */}
        <InquiryCTASection />
      </div>
    </>
  );
};