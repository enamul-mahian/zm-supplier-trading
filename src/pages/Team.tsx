import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, HeartHandshake, Award, Check } from 'lucide-react';
import { BRAND_INFO } from '../shared/constants';

// গ্লোবাল অরগানিজমস পুনর্ব্যবহার বা রিসাইক্লিং (Part 06, Rule 37)
import { TeamSection } from '../components/organisms/TeamSection'; // রিয়াল টিম গ্রিড অথবা এক্সপার্টাইজ কার্ড রেন্ডারিং লাক্সারি প্যানেল
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// ১. কাস্টম ইনার-পেজ হিরো ব্যানার (Part 04, Section 03)
const TeamHero: React.FC = () => {
  return (
    <section className="bg-brand-secondary text-white py-16 text-left relative overflow-hidden border-b border-brand-secondary-dark">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
      
      <div className="premium-container relative z-10">
        {/* রুট-ব্রেডক্রাম্বস */}
        <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
          <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-accent">Team</span>
        </nav>
        
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
          Management & Team
        </h1>
        <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
          Factual professional expertise, business coordinators, and strategic B2B sourcing specialists.
        </p>
      </div>
    </section>
  );
};

// ২. টিমের কার্যপ্রণালী ও পেশাদার দর্শন সেকশন (Working Philosophy - Part 04, Section 13)
const WorkingPhilosophy: React.FC = () => {
  const philosophies = [
    {
      icon: <ShieldCheck className="w-5.5 h-5.5 text-brand-primary" />,
      title: 'Coordination Precision',
      description: 'We systematically organise every logistical route, customs documentation check, and manufacturer verification step to avoid trade delays.'
    },
    {
      icon: <Award className="w-5.5 h-5.5 text-brand-primary" />,
      title: 'Factual Accountability',
      description: 'Honest transparency governs our commercial trade agreements, with clear timelines, real-time tracking support, and open communication.'
    },
    {
      icon: <HeartHandshake className="w-5.5 h-5.5 text-brand-primary" />,
      title: 'Partnership Focus',
      description: 'We view our wholesale clients as long-term allies, committing to stable pricing strategies and reliable bulk consignment fulfilments.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-brand-bg-alt text-left border-b border-brand-neutral-border relative overflow-hidden">
      <div className="premium-container">
        
        <div className="max-w-xl mb-12 lg:mb-16">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block">
            Our Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            How Our Coordination Team Operates
          </h2>
          <p className="text-sm text-brand-neutral-muted leading-relaxed">
            ZM Supplier & Trading is built on a foundation of professional responsibility and cross-border commercial trade experience.
          </p>
        </div>

        {/* ৩-কলাম বিশিষ্ট অপারেশনাল ফিলোসফি গ্রিড */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {philosophies.map((item, index) => (
            <motion.div
              key={index}
              className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft flex flex-col items-start hover:-translate-y-1 transition-transform duration-300 group text-left"
              variants={fadeUpVariants}
            >
              <div className="w-11 h-11 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-3 group-hover:text-brand-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export const Team: React.FC = () => {
  return (
    <>
      {/* গ্লোবাল টিম এসইও মেটা ট্যাগস (Part 07, Rule 06) */}
      <Helmet>
        <title>Management & Team | {BRAND_INFO.name} | UK B2B Trade</title>
        <meta name="description" content="Meet the management and trade coordination specialists at ZM Supplier & Trading. Our professionals assist in UK-standard sourcing, documentation, and wholesale supply chain routes." />
        <link rel="canonical" href="https://zmsupplier.co.uk/team" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col">
        {/* ধাপ ০১: ইনার পেজ হিরো ব্যানার */}
        <TeamHero />

        {/* ধাপ ০২: রিয়াল টিম গ্রিড অথবা কাস্টম এক্সপার্টাইজ ক্যাপাবিলিটি প্যানেল (রিসাইক্লিং - Part 04, Section 13) */}
        <TeamSection />

        {/* ধাপ ০৩: টিমের কাজের দর্শন ও ৩-কলামের ওপারেশনাল রুলস বিশ্লেষণ */}
        <WorkingPhilosophy />

        {/*  ধাপ ০৪: গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল */}
        <InquiryCTASection />
      </div>
    </>
  );
};