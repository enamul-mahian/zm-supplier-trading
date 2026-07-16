import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, FileSignature, CheckCircle2, Sparkles } from 'lucide-react';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepVariants = {
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

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const ProcessSection: React.FC = () => {
  // ব্রিটিশ ইংলিশ ও পার্ট ০৯ গাইডলাইন মেনে ৪-ধাপ বিশিষ্ট বিটুবি প্রসেস ডাটা
  const steps: ProcessStep[] = [
    {
      number: '01',
      title: 'Assess',
      description: "Understand the buyer's product, volume, timeline, destination, and commercial requirements.",
      icon: <ClipboardList className="w-6 h-6 text-brand-primary" />,
    },
    {
      number: '02',
      title: 'Source',
      description: 'Coordinate with suitable suppliers and identify products aligned with the agreed specification.',
      icon: <Search className="w-6 h-6 text-brand-primary" />,
    },
    {
      number: '03',
      title: 'Coordinate',
      description: 'Organise communication, documentation, quality checks, packaging, and delivery planning.',
      icon: <FileSignature className="w-6 h-6 text-brand-primary" />,
    },
    {
      number: '04',
      title: 'Deliver',
      description: 'Support reliable fulfilment with transparent communication and structured order tracking.',
      icon: <CheckCircle2 className="w-6 h-6 text-brand-primary" />,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ডে অত্যন্ত হালকা কাস্টম গোল্ডেন ফ্লেয়ার শ্যাডো */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

      <div className="premium-container relative z-10">
        
        {/* সেকশন হেডার প্যানেল */}
        <div className="max-w-xl mb-16 lg:mb-20">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            Our Approach
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            Structured Sourcing & Supply Process
          </h2>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
            We assess, structure, execute, and deliver. A predictable, four-stage workflow built to ensure total transparency.
          </p>
        </div>

        {/* টাইমলাইন কন্টেইনার প্যানেল */}
        <div className="relative">
          
          {/* ডেস্কটপে ৪টি কার্ডকে যুক্ত করার ড্যাশড কানেক্টিং লাইন (Part 03, Section 09) */}
          <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] border-t-2 border-dashed border-brand-neutral-border z-0" />

          {/* ৪-কলাম বিশিষ্ট টাইমলাইন গ্রিড */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="flex flex-col items-start text-left bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium transition-all duration-300 relative group"
                variants={stepVariants}
              >
                {/* ভাসমান বাবল ইন্ডিকেটর (গোল্ডেনTypography দিয়ে প্রিমিয়াম গোল্ড টাচ) */}
                <div className="absolute top-4 right-6 font-heading font-extrabold text-3xl text-brand-accent/30 group-hover:text-brand-accent transition-colors duration-300 select-none">
                  {step.number}
                </div>

                {/* আইকন বক্স সেটআপ */}
                <div className="w-13 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-brand-accent transition-all duration-300 relative z-10 border border-brand-primary/5">
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </span>
                </div>

                {/* প্রসেস শিরোনাম */}
                <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-3 group-hover:text-brand-primary transition-colors duration-300">
                  {step.title}
                </h3>

                {/* প্রসেস ডেসক্রিপশন */}
                <p className="text-sm text-brand-neutral-muted leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>

      </div>
    </section>
  );
};