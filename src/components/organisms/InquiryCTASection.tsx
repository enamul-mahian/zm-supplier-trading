import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Send, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
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

export const InquiryCTASection: React.FC = () => {
  return (
    <section className="py-12 bg-white text-left relative overflow-hidden">
      <div className="premium-container px-4">
        
        {/* গ্লোবাল হাই-ইমপ্যাক্ট বিটুবি সিটিএ প্যানেল (ব্র্যান্ডের প্রধান গাঢ় পান্না সবুজ ব্যাকগ্রাউন্ডে - Part 03, Section 19) */}
        <motion.div 
          className="bg-brand-primary text-white rounded-hero shadow-premium border border-brand-primary-light/10 relative overflow-hidden p-8 sm:p-12 lg:p-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          {/* ব্যাকগ্রাউন্ডে সজ্জাসংক্রান্ত সূক্ষ্ম ডেকোরেটিভ এসভিজি গ্রিড প্যাটার্ন (Lighthouse ফ্রেন্ডলি) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          {/* ব্যাকগ্রাউন্ড গোল্ডেন ফ্লেয়ার শ্যাডো */}
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/10 blur-[80px] pointer-events-none" />

          {/* প্যানেল মেইন কন্টেন্ট গ্রিড */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* বাম কলাম: কন্টেন্ট ও বিটুবি রিকোয়ারমেন্ট ইনফরমেশন (ডেস্কটপে ৮ কলাম) */}
            <div className="lg:col-span-8 flex flex-col">
              <motion.span 
                variants={fadeUpVariants}
                className="text-brand-accent font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Partner With Us
              </motion.span>

              {/* সেকশন হেডিংস */}
              <motion.h2 
                variants={fadeUpVariants}
                className="text-2xl sm:text-3xl lg:text-[36px] font-heading font-extrabold text-white leading-tight mb-4"
              >
                Looking for a Reliable B2B Supply Partner?
              </motion.h2>

              {/* বায়ারদের জন্য প্রয়োজনীয় প্যারামিটার নির্দেশক প্যারাগ্রাফ (Part 03, Section 19) */}
              <motion.p 
                variants={fadeUpVariants}
                className="text-sm sm:text-base text-brand-accent-pale leading-relaxed max-w-3xl"
              >
                Let us build a stronger, more transparent supply chain together. Share your detailed product specifications, target order volume, preferred delivery destination, packaging formats, and private-label requirements with our dedicated commercial coordination team today.
              </motion.p>
            </div>

            {/* ডান কলাম: মোবাইল ফ্রেন্ডলি স্ট্যাকড সিটিএ বাটন গ্রুপ (ডেস্কটপে ৪ কলাম) */}
            <motion.div 
              className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center lg:items-stretch gap-4 w-full"
              variants={fadeUpVariants}
            >
              {/* প্রাইমারি কোটেশন বাটন (গোল্ডেন কালার থিম) */}
              <Button 
                to="/request-quote" 
                variant="warning" 
                size="lg" 
                className="w-full sm:w-auto lg:w-full"
              >
                <FileText className="w-5 h-5 mr-2" />
                Request a Quote
              </Button>

              {/* সেকেন্ডারি কন্টাক্ট বাটন (হোয়াইট আউটলাইন থিম) */}
              <Button 
                to="/contact" 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto lg:w-full border-white text-white hover:bg-white/5 focus-visible:ring-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Contact Our Team
              </Button>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};