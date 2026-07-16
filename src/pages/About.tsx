import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, Check, Target, Eye, ShieldCheck, Handshake, Heart, Users } from 'lucide-react';
import { BRAND_INFO, CORE_VALUES } from '../shared/constants';
import { Button } from '../components/atoms/Button';
import { StatsSection } from '../components/organisms/StatsSection'; // গ্লোবাল স্ট্যাটস রিসাইক্লিং
import { InquiryCTASection } from '../components/organisms/InquiryCTASection'; // গ্লোবাল সিটিএ রিসাইক্লিং

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
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
  hidden: { opacity: 0, scale: 0.95, x: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 80,
      delay: 0.3,
    },
  },
};

export const About: React.FC = () => {
  // ২ নম্বর পেজ (About Us) ইমেজের গাইডলাইন অনুযায়ী ওয়ারহাউজ ইন্সপেক্টরের রিয়াল পোর্ট্রেট ছবি
  const defaultAboutHeroImage = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800';

  // ৪টি কোর ভ্যালুর জন্য সুনির্দিষ্ট আইকন ম্যাপিং (Part 06, Rule 31)
  const getValueIcon = (iconName: string) => {
    const iconStyle = "w-6 h-6 text-brand-primary";
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className={iconStyle} />;
      case 'Handshake': return <Handshake className={iconStyle} />;
      case 'Heart': return <Heart className={iconStyle} />;
      case 'Users': return <Users className={iconStyle} />;
      default: return <ShieldCheck className={iconStyle} />;
    }
  };

  const businessCapabilities = [
    'Strict compliance and trade coordination guidelines',
    'Careful requirement assessment for commercial buyers',
    'traceable shipping manifests and logistics planning',
    'audited packaging, labeling, and container logistics',
  ];

  return (
    <>
      {/* ১. ডাইনামিক পেজ-নির্দিষ্ট এসইও সেটআপ (React Helmet Async - Part 07, Rule 06) */}
      <Helmet>
        <title>About Us | {BRAND_INFO.name} | UK-Standard B2B Sourcing</title>
        <meta name="description" content="Learn about ZM Supplier & Trading, our story, corporate values of quality, integrity, and safety, and our UK-standard B2B product supply mission." />
        <link rel="canonical" href="https://zmsupplier.co.uk/about" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* ২. ২ নম্বর পেজ ইমেজ অনুযায়ী হুবহু "About Us Hero" সেকশন */}
        <section className="py-16 md:py-24 text-left relative overflow-hidden border-b border-brand-neutral-border">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

          <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* বাম কলাম: বিবরণ ও কন্টেন্ট */}
            <motion.div 
              className="lg:col-span-7 flex flex-col text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.span 
                variants={fadeUpVariants}
                className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                Who We Are
              </motion.span>

              {/* ২ নম্বর পেজ অনুযায়ী হুবহু বোল্ড হেডিং */}
              <motion.h1 
                variants={fadeUpVariants}
                className="text-3xl sm:text-4xl md:text-[44px] font-heading font-extrabold text-brand-neutral-charcoal leading-[1.15] mb-6 text-balance"
              >
                Built on Trust. <br />
                Focused on Quality. <br />
                Driven by Partnership.
              </motion.h1>

              {/* ব্রিটিশ ইংলিশ কপিরাইটিং */}
              <motion.p 
                variants={fadeUpVariants}
                className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-4"
              >
                {BRAND_INFO.name} is a UK-based B2B product supply company committed to providing clean, hygienic, and authentic products to businesses worldwide. We bridge the gap between commercial buyers and vetted manufacturing partners globally.
              </motion.p>

              <motion.p 
                variants={fadeUpVariants}
                className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-8"
              >
                We work with trusted manufacturers and follow strict quality standards to ensure consistency, safety, and absolute reliability in every shipment. Our structured trade workflows are optimised to support your long-term business growth.
              </motion.p>

              <motion.div variants={fadeUpVariants}>
                <Button to="/contact" variant="primary" size="md">
                  Contact Us
                </Button>
              </motion.div>
            </motion.div>

            {/* ডান কলাম: ইন্সপেক্টরের পোর্ট্রেট ইমেজ */}
            <motion.div 
              className="lg:col-span-5 w-full flex justify-center items-center relative"
              initial="hidden"
              animate="visible"
              variants={imageVariants}
            >
              <div className="absolute inset-0 border border-brand-primary/10 rounded-card rotate-2 scale-[1.01] pointer-events-none" />
              
              <div className="w-full h-[280px] sm:h-[360px] md:h-[440px] rounded-card overflow-hidden shadow-premium border border-brand-neutral-border relative group">
                <img 
                  src={defaultAboutHeroImage} 
                  alt="Vetted B2B Quality Sourcing Coordinator" 
                  className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/15 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>

          </div>
        </section>

        {/* ৩. গ্লোবাল ২ নম্বর পেজের সেই সংখ্যাভিত্তিক স্ট্যাটস স্ট্রিপ (রিসাইক্লিং) */}
        <StatsSection />

        {/* ৪. মিশন এবং ভিশন ডাবল কলাম সেকশন */}
        <section className="py-16 md:py-24 bg-white text-left border-b border-brand-neutral-border relative overflow-hidden">
          <div className="premium-container grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {/* আওয়ার মিশন কার্ড */}
            <motion.div 
              className="bg-brand-bg-alt p-8 rounded-card border border-brand-neutral-border shadow-soft flex flex-col items-start hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300 group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUpVariants}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-6 border border-brand-primary/5">
                <Target className="w-6 h-6 text-brand-primary" />
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-brand-neutral-charcoal mb-4">
                Our Mission
              </h2>
              <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
                To coordinate reliable product sourcing and deliver pristine, hygienic wholesale supplies that empower B2B businesses, retail distributors, and hospitality brands to grow predictably and sustainably.
              </p>
            </motion.div>

            {/* আওয়ার ভিশন কার্ড */}
            <motion.div 
              className="bg-brand-bg-alt p-8 rounded-card border border-brand-neutral-border shadow-soft flex flex-col items-start hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300 group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUpVariants}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-6 border border-brand-primary/5">
                <Eye className="w-6 h-6 text-brand-primary" />
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-brand-neutral-charcoal mb-4">
                Our Vision
              </h2>
              <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
                To become the preferred UK-standard supply chain and international trade partner for enterprises globally, recognized for absolute product authenticity, transparent communication, and operational excellence.
              </p>
            </motion.div>

          </div>
        </section>

        {/* ৫. ২ নম্বর পেজ ইমেজ অনুযায়ী ৪টি সুনির্দিষ্ট "Our Commitment" কার্ড গ্রিড */}
        <section className="py-16 md:py-24 bg-brand-bg text-left border-b border-brand-neutral-border relative overflow-hidden">
          <div className="premium-container">
            
            <div className="max-w-xl mb-12 lg:mb-16">
              <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                Our Core Values
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
                Our Commitment
              </h2>
            </div>

            {/* ৪টি কোর ভ্যালু রেসপন্সিভ কার্ড গ্রিড */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {CORE_VALUES.map((value) => (
                <motion.div
                  key={value.id}
                  className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group"
                  variants={fadeUpVariants}
                >
                  <div className="w-11 h-11 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                    {getValueIcon(value.iconName)}
                  </div>
                  <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2">
                    {value.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* ৬. লজিস্টিকস ক্যাপাবিলিটি ও সোর্সিং স্ট্রাকচার (B2B Split Section) */}
        <section className="py-16 md:py-24 bg-white text-left border-b border-brand-neutral-border relative overflow-hidden">
          <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 text-left">
              <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block">
                Operations & Compliance
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-6">
                Structured Commercial Sourcing
              </h2>
              <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6">
                We coordinate complex international shipments and plan wholesale cargo distributions using compliant frameworks. Every B2B transaction is backed by clear invoicing, specification sheets, and audited logistics partners to secure hassle-free customs transit.
              </p>
            </div>

            <div className="lg:col-span-6 flex flex-col space-y-4">
              {businessCapabilities.map((cap, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 bg-brand-bg-alt/50 p-4 rounded-xl border border-brand-neutral-border"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-brand-primary font-bold" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-brand-neutral-charcoal capitalize">
                    {cap}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ৭. গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};