import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Warehouse, Store, Utensils, Building2, Check } from 'lucide-react';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';

// গ্লোবাল অর্গানিজমস রিসাইক্লিং (Part 06, Rule 37)
import { ServicesSection } from '../components/organisms/ServicesSection';
import { ProcessSection } from '../components/organisms/ProcessSection';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';

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
const ServicesHero: React.FC = () => {
  return (
    <section className="bg-brand-secondary text-white py-16 text-left relative overflow-hidden border-b border-brand-secondary-dark">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
      
      <div className="premium-container relative z-10">
        {/* ডাইনামিক রুট-ভিত্তিক ব্রেডক্রাম্বস */}
        <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
          <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-accent">Services</span>
        </nav>
        
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
          Our Services
        </h1>
        <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
          Comprehensive UK-standard product supply, wholesale sourcing, private-label coordination, and logistics planning globally.
        </p>
      </div>
    </section>
  );
};

// ২. ৩ নম্বর পেজ প্রিভিউ অনুযায়ী মিডল ম্যাপ প্যানেল ("Need a Reliable Supply Partner?")
const MiddleMapBanner: React.FC = () => {
  return (
    <section className="py-16 bg-brand-secondary text-white border-y border-brand-secondary-dark text-center relative overflow-hidden">
      {/* ব্যাকগ্রাউন্ড গ্লোবাল ভেক্টর গ্রিড ম্যাপ */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 50 0 L 50 450 M 150 0 L 150 450 M 250 0 L 250 450 M 350 0 L 350 450 M 450 0 L 450 450 M 550 0 L 550 450 M 650 0 L 650 450 M 750 0 L 750 450" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M 0 50 L 800 50 M 0 150 L 800 150 M 0 250 L 800 250 M 0 350 L 800 350" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M 320 120 C 350 180, 480 180, 520 280" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M 320 120 C 220 180, 180 200, 150 320" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="320" cy="120" r="5" fill="#D4AF37" />
          <circle cx="520" cy="280" r="4" fill="white" />
          <circle cx="150" cy="320" r="4" fill="white" />
        </svg>
      </div>

      <div className="premium-container relative z-10 px-4">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
          Need a Reliable Supply Partner?
        </h2>
        <p className="text-sm text-brand-accent-pale max-w-lg mx-auto mb-8">
          Let's discuss how our specialised sourcing and trade coordination workflows can support your business requirements.
        </p>
        <Button to="/contact" variant="warning" size="md">
          Contact Us
        </Button>
      </div>
    </section>
  );
};

// ৩. ইন্ডাস্ট্রি ও সেক্টর অনুযায়ী বায়ার টাইপ প্যানেল
const IndustriesServed: React.FC = () => {
  const sectors = [
    {
      icon: <Warehouse className="w-6 h-6 text-brand-primary" />,
      title: 'Wholesale & Distribution',
      description: 'Reliable container-load supplies, pallets, and bulk logistics planning.'
    },
    {
      icon: <Store className="w-6 h-6 text-brand-primary" />,
      title: 'Retail & Supermarkets',
      description: 'Packaged foods, pantry goods, and consumer products ready for retail.'
    },
    {
      icon: <Utensils className="w-6 h-6 text-brand-primary" />,
      title: 'Hospitality & Catering',
      description: 'Consistently packaged ingredients, beverages, and commercial disposables.'
    },
    {
      icon: <Building2 className="w-6 h-6 text-brand-primary" />,
      title: 'Food & Beverage Brands',
      description: 'Comprehensive private-label support and tailored product packaging solutions.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      <div className="premium-container">
        
        <div className="max-w-xl mb-12 lg:mb-16">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            B2B Sectors
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            Industries We Support
          </h2>
          <p className="text-sm text-brand-neutral-muted leading-relaxed">
            We provide structured supply chain assistance across diverse commercial sectors worldwide.
          </p>
        </div>

        {/* সেক্টর গ্রিড */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {sectors.map((sector, index) => (
            <motion.div
              key={index}
              className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group"
              variants={fadeUpVariants}
            >
              <div>
                <div className="w-11 h-11 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                  {sector.icon}
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal mb-2">
                  {sector.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  {sector.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export const Services: React.FC = () => {
  return (
    <>
      {/* গ্লোবাল এসইও সেটআপ (Part 07, Rule 06) */}
      <Helmet>
        <title>Our Services | {BRAND_INFO.name} | B2B Sourcing</title>
        <meta name="description" content="Explore our UK-standard B2B services: product sourcing, wholesale supply, private label support, export documentation, and commercial logistics planning." />
        <link rel="canonical" href="https://zmsupplier.co.uk/services" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col">
        {/* ধাপ ০১: ইনার পেজ হিরো ব্যানার */}
        <ServicesHero />

        {/* ধাপ ০২: সেবা কার্ড গ্রিড ওভারভিউ */}
        <ServicesSection />

        {/* ধাপ ০৩: ম্যাপ ব্যানার ("Need a Reliable Supply Partner?") */}
        <MiddleMapBanner />

        {/* ধাপ ০৪: কাজের ৪-ধাপের প্রসেস টাইমলাইন */}
        <ProcessSection />

        {/* ধাপ ০৫: ইন্ডাস্ট্রি এবং সেক্টর ওভারভিউ */}
        <IndustriesServed />

        {/*  ধাপ ০৬: গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল */}
        <InquiryCTASection />
      </div>
    </>
  );
};