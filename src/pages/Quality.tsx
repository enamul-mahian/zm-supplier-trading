import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, ClipboardCheck, Clipboard, FileCheck2, AlertCircle, Check } from 'lucide-react';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';

// গ্লোবাল অর্গানিজমস পুনর্ব্যবহার বা রিসাইক্লিং (Part 06, Rule 37)
import { QualitySection } from '../components/organisms/QualitySection'; // ইন্সপেক্টর ছবি + ৫ কোয়ালিটি চেকলিস্ট সংবলিত রিয়াল লেআউট
import { InquiryCTASection } from '../components/organisms/InquiryCTASection'; // ফাইনাল কোটেশন প্যানেল

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
const QualityHero: React.FC = () => {
  return (
    <section className="bg-brand-secondary text-white py-16 text-left relative overflow-hidden border-b border-brand-secondary-dark">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
      
      <div className="premium-container relative z-10">
        {/* রুট-ব্রেডক্রাম্বস */}
        <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
          <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-accent">Quality</span>
        </nav>
        
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
          Quality, Hygiene & Authenticity
        </h1>
        <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
          UK-standard compliance coordination, strict cleanliness expectations, and authentic B2B supply reviews.
        </p>
      </div>
    </section>
  );
};

// ২. ৪টি প্রধান কোয়ালিটি অপারেশনাল পিলার বিশ্লেষণ গ্রিড (Part 04, Section 11)
const OperationalPillars: React.FC = () => {
  const pillars = [
    {
      icon: <Clipboard className="w-6 h-6 text-brand-primary" />,
      title: 'Supplier Information Review',
      description: 'We assess supplier-provided compliance documentation, spec sheets, and facility origin records before listing products.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-brand-primary" />,
      title: 'Hygienic Packaging Review',
      description: 'All wholesale consignments must follow clean packing and double-wrapped case protection to prevent contamination during transit.'
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-brand-primary" />,
      title: 'Specification Control',
      description: 'We coordinate physical specification metrics (size, moisture levels, case counts) with manufacturers prior to loading.'
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-brand-primary" />,
      title: 'Traceable Communication',
      description: 'Ensuring trade documentation, batch details, and shipping records remain structured and easily accessible to our buyers.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-brand-bg text-left border-b border-brand-neutral-border relative overflow-hidden">
      <div className="premium-container">
        
        <div className="max-w-xl mb-12 lg:mb-16">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block">
            Our Quality Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            How We Manage Cleanliness & Specifications
          </h2>
        </div>

        {/* ৪-কলামের ওপারেশনাল গ্রিড */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group"
              variants={fadeUpVariants}
            >
              <div>
                <div className="w-11 h-11 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                  {pillar.icon}
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

// ৩. সমস্যা সমাধান এবং ইস্যু-ম্যানেজমেন্ট নীতি (Part 04, Section 11, Rule 09)
const IssueManagement: React.FC = () => {
  return (
    <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
      <div className="premium-container max-w-content mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-3 flex justify-center">
          <div className="w-16 h-14 bg-red-500/5 rounded-full flex items-center justify-center border border-red-500/10">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
        </div>
        <div className="md:col-span-9">
          <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-3">
            Practical Issue-Management Policy
          </h3>
          <p className="text-sm text-brand-neutral-muted leading-relaxed">
            In the rare event of a specification discrepancy, we coordinate directly with the producer and buyer to implement prompt resolving actions. We prioritize structured communication, traceable batch inspections, and B2B transparency to resolve any commercial concerns swiftly.
          </p>
        </div>
      </div>
    </section>
  );
};

export const Quality: React.FC = () => {
  return (
    <>
      {/* গ্লোবাল কোয়ালিটি এসইও মেটা ট্যাগস (Part 07, Rule 06) */}
      <Helmet>
        <title>Quality, Hygiene & Authenticity | {BRAND_INFO.name}</title>
        <meta name="description" content="Learn about ZM Supplier & Trading's approach to B2B quality coordination, strict cleanliness expectations, supplier verification, and compliant packaging standards." />
        <link rel="canonical" href="https://zmsupplier.co.uk/quality" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col">
        {/*  ধাপ ০১: ইনার পেজ হিরো ব্যানার */}
        <QualityHero />

        {/* ধাপ ০২: হিরো সেকশনের নিচে কোয়ালিটি ও ইন্সপেকশন বিস্তারিত বিবরণ (রিসাইক্লিং - Part 04, Section 11) */}
        <QualitySection />

        {/*  ধাপ ০৩: ৪টি প্রধান ওপারেশনাল কোয়ালিটি পিলার বিশ্লেষণ গ্রিড */}
        <OperationalPillars />

        {/*  ধাপ ০৪: সমস্যা সমাধান ও কোয়ালিটি ইস্যু-ম্যানেজমেন্ট নীতি */}
        <IssueManagement />

        {/*  ধাপ ০৫: গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল */}
        <InquiryCTASection />
      </div>
    </>
  );
};