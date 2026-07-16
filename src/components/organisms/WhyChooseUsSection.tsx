import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Clock,
  Users,
  Eye,
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import { Button } from '../atoms/Button';

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

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, x: -20 },
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

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TrustStripItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const WhyChooseUsSection: React.FC = () => {
  // প্রিমিয়াম করপোরেট হ্যান্ডশেক বা ট্রাস্ট ছবি (Unsplash optimized)
  const defaultHandshakeImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800';

  // ৪ নম্বর পেজের গাইডলাইন অনুযায়ী ৫টি মূল বেনিফিট ডাটা
  const benefits: BenefitItem[] = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-brand-primary" />,
      title: 'UK Standard Quality',
      description: 'We follow strict UK standards to ensure top-tier product quality.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
      title: 'Clean & Hygienic',
      description: 'Strict hygienic storage, packaging, and clean handling.',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-brand-primary" />,
      title: 'Authentic Products',
      description: '100% genuine products sourced from verified suppliers.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-brand-primary" />,
      title: 'Competitive Pricing',
      description: 'Best market specs paired with highly optimised wholesale pricing.',
    },
    {
      icon: <Clock className="w-5 h-5 text-brand-primary" />,
      title: 'On-Time Delivery',
      description: 'We coordinate reliable logistics to deliver on time, every single time.',
    },
  ];

  // ৪ নম্বর পেজের নিচের ট্রাস্ট স্ট্রিপ ডাটা
  const trustStripItems: TrustStripItem[] = [
    {
      icon: <Users className="w-5 h-5 text-brand-primary" />,
      title: 'Trusted Network',
      description: 'Strong & reliable supplier networks.',
    },
    {
      icon: <Eye className="w-5 h-5 text-brand-primary" />,
      title: 'Customer Focused',
      description: 'Your business success is our priority.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
      title: 'Transparent Business',
      description: 'Clear communication at every stage of trade.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-brand-primary" />,
      title: 'Long-Term Partnership',
      description: 'We grow and succeed when your business grows.',
    },
  ];

  return (
    <section className="bg-brand-bg-alt py-16 md:py-24 text-left border-b border-brand-neutral-border relative overflow-hidden">
      <div className="premium-container">
        
        {/* পার্ট ১: দ্বি-কলাম বিশিষ্ট বেনিফিটস ও ইমেজ প্যানেল (Part 03, Section 10) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pb-16 border-b border-brand-neutral-border">
          
          {/* বাম কলাম: বেনিফিট চেকলিস্ট ও বিবরণ (ডেস্কটপে ৭ কলাম) */}
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
            <motion.span 
              variants={fadeUpVariants}
              className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              Why Choose Us
            </motion.span>

            {/* ৪ নম্বর পেজ অনুযায়ী হুবহু হেডিং */}
            <motion.h2 
              variants={fadeUpVariants}
              className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-6"
            >
              We Support Your Business <br />With Reliability & Care
            </motion.h2>

            {/* ৫টি বেনিফিট কার্ড রেন্ডারিং */}
            <motion.div 
              className="flex flex-col space-y-4 mb-8"
              variants={containerVariants}
            >
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start bg-brand-surface p-4 rounded-xl border border-brand-neutral-border shadow-soft hover:shadow-premium hover:border-brand-primary/20 transition-all duration-300 group"
                  variants={fadeUpVariants}
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/5 flex items-center justify-center mr-4 shrink-0 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-brand-neutral-charcoal mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-brand-neutral-muted leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* বাটন লিংক */}
            <motion.div variants={fadeUpVariants}>
              <Button to="/about" variant="primary" size="md">
                Why Work With Us
              </Button>
            </motion.div>
          </motion.div>

          {/* ডান কলাম: প্রিমিয়াম হ্যান্ডশেক ছবি (ডেস্কটপে ৫ কলাম) */}
          <motion.div 
            className="lg:col-span-5 w-full flex justify-center items-center relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={imageVariants}
          >
            <div className="absolute inset-0 border border-brand-primary/10 rounded-card -rotate-2 scale-[1.01] pointer-events-none" />
            
            <div className="w-full h-[280px] sm:h-[360px] md:h-[440px] lg:h-[480px] rounded-card overflow-hidden shadow-premium border border-brand-neutral-border relative group">
              <img 
                src={defaultHandshakeImage} 
                alt="B2B Trust Handshake Agreement" 
                className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/15 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

        </div>

        {/* পার্ট ২: ৪ নম্বর পেজ অনুযায়ী ৪-কলামের গ্লোবাল ট্রাস্ট স্ট্রিপ (Part 03, Section 10) */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {trustStripItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-brand-surface p-5 rounded-card border border-brand-neutral-border shadow-soft flex flex-col items-start hover:-translate-y-1 transition-transform duration-300"
              variants={fadeUpVariants}
            >
              <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-4 border border-brand-primary/5">
                {item.icon}
              </div>
              <h3 className="font-heading font-bold text-xs sm:text-sm text-brand-neutral-charcoal mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-brand-neutral-muted leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};