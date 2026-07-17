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
  // ফিক্স: আইকন থেকে text-brand-primary ক্লাসটি রিমুভ করা হয়েছে
  const steps: ProcessStep[] = [
    {
      number: '01',
      title: 'Assess',
      description: "Understand the buyer's product, volume, timeline, destination, and commercial requirements.",
      icon: <ClipboardList className="w-6 h-6" />,
    },
    {
      number: '02',
      title: 'Source',
      description: 'Coordinate with suitable suppliers and identify products aligned with the agreed specification.',
      icon: <Search className="w-6 h-6" />,
    },
    {
      number: '03',
      title: 'Coordinate',
      description: 'Organise communication, documentation, quality checks, packaging, and delivery planning.',
      icon: <FileSignature className="w-6 h-6" />,
    },
    {
      number: '04',
      title: 'Deliver',
      description: 'Support reliable fulfilment with transparent communication and structured order tracking.',
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
  ];

  return (
    // ফিক্স: অতিরিক্ত গ্যাপ কমানোর জন্য py-16 md:py-24 এর পরিবর্তে py-12 lg:py-16 ব্যবহার করা হয়েছে
    <section className="py-12 lg:py-16 bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

      <div className="premium-container relative z-10">
        
        <div className="max-w-xl mb-12 lg:mb-16">
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

        <div className="relative">
          
          <div className="hidden lg:block absolute top-[48px] left-[12%] right-[12%] border-t-2 border-dashed border-brand-neutral-border z-0" />

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                className="flex flex-col items-start text-left bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium transition-all duration-300 relative group"
                variants={stepVariants}
              >
                <div className="absolute top-4 right-6 font-heading font-extrabold text-3xl text-brand-accent/30 group-hover:text-brand-accent transition-colors duration-300 select-none">
                  {step.number}
                </div>

                {/* ফাইনাল ফিক্স: আইকন বক্সের ডিফল্ট কালার text-brand-primary এবং হোভারে text-brand-accent হবে */}
                <div className="w-12 h-12 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-brand-accent transition-all duration-300 relative z-10 border border-brand-primary/5">
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-3 group-hover:text-brand-primary transition-colors duration-300">
                  {step.title}
                </h3>

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