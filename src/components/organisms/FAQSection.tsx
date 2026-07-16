import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { fetchFAQs } from '../../services/firestore';
import { FALLBACK_FAQS } from '../../shared/constants';
import { FAQ } from '../../shared/types';
import { Button } from '../atoms/Button';

// অ্যাকোর্ডিয়ন কন্টেন্ট স্লাইড ডাউন ও ফেইড ট্রানজিশন কনফিগ (Part 06, Rule 32)
const accordionVariants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const textVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
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
      delay: 0.2,
    },
  },
};

export const FAQSection: React.FC = () => {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // প্রথম এফএকিউ ডিফল্ট ওপেন থাকবে (Part 03, Section 18)
  const [loading, setLoading] = useState(true);

  // কোয়ালিটি কন্ট্রোল এবং ইন্সপেক্টরের রিয়াল পোট্রেট ওয়ারহাউজ ইমেজ (৮ নম্বর পেজের গাইডলাইন অনুযায়ী)
  const defaultFAQInspectorImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600';

  // ফায়ারস্টোর থেকে হোম পেজের সাথে অ্যাসোসিয়েটেড এফএকিউ লোড
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setLoading(true);
        const data = await fetchFAQs({ pageId: 'home' });
        if (data && data.length > 0) {
          setFAQs(data.slice(0, 5)); // সর্বোচ্চ ৫টি এফএকিউ প্রদর্শন করা হচ্ছে
        } else {
          // ডেটাবেস কানেকশন পেন্ডিং থাকলে constants থেকে ৫টি গোল্ডেন B2B FAQ লোড হবে
          setFAQs(FALLBACK_FAQS as FAQ[]);
        }
      } catch (error) {
        console.error('[FAQSection fetch error]:', error);
        setFAQs(FALLBACK_FAQS as FAQ[]);
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ড গোল্ডেন ফ্লেয়ার */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none" />

      <div className="premium-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* বাম কলাম: কাস্টম এফএকিউ অ্যাকোর্ডিয়ন গ্রিড (ডেস্কটপে ৭ কলাম) */}
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
          {/* প্রিমিয়াম আইব্রো লেবেল */}
          <motion.span 
            variants={textVariants}
            className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-brand-accent" />
            Common Questions
          </motion.span>

          {/* সেকশন হেডিং (H2) */}
          <motion.h2 
            variants={textVariants}
            className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-8"
          >
            Frequently Asked Questions
          </motion.h2>

          {loading ? (
            // স্কেলেটন প্লেসহোল্ডার
            <div className="space-y-4 animate-pulse">
              <div className="h-14 bg-brand-neutral-gray rounded-xl w-full" />
              <div className="h-14 bg-brand-neutral-gray rounded-xl w-full" />
              <div className="h-14 bg-brand-neutral-gray rounded-xl w-full" />
            </div>
          ) : (
            /* অ্যাকোর্ডিয়ন কন্টেইনার (A11y ARIA Attributes Compliant - Part 03, Section 18) */
            <motion.div 
              className="flex flex-col space-y-4 mb-8"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              {faqs.map((faq, index) => {
                const isOpen = expandedIndex === index;
                const buttonId = `faq-btn-${index}`;
                const panelId = `faq-panel-${index}`;

                return (
                  <motion.div
                    key={faq.id}
                    variants={textVariants}
                    className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                      isOpen 
                        ? 'border-brand-primary bg-brand-bg-alt/40 shadow-soft' 
                        : 'border-brand-neutral-border bg-brand-surface hover:border-brand-primary/30'
                    }`}
                  >
                    {/* অ্যাকোর্ডিয়ন হেডার বাটন */}
                    <button
                      id={buttonId}
                      aria-controls={panelId}
                      aria-expanded={isOpen}
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex justify-between items-center p-5 text-left font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal transition-colors duration-300 hover:text-brand-primary focus-visible:bg-brand-primary/5"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-brand-neutral-muted transition-transform duration-300 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-brand-primary' : ''
                      }`} />
                    </button>

                    {/* অ্যাকোর্ডিয়ন কন্টেন্ট প্যানেল */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          variants={accordionVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                        >
                          <div className="px-5 pb-5 text-xs sm:text-sm text-brand-neutral-muted leading-relaxed border-t border-brand-neutral-border/50 pt-3">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* এফএকিউ পেজের সম্পূর্ণ ডিরেক্টরি সিটিএ বাটন */}
          <motion.div variants={textVariants}>
            <Button to="/faq" variant="outline" size="md">
              View All FAQs
            </Button>
          </motion.div>
        </motion.div>

        {/* ডান কলাম: প্রিমিয়াম ওয়ারহাউজ ইন্সপেক্টর পোর্ট্রেট ছবি (ডেস্কটপে ৫ কলাম - Part 03, Section 18) */}
        <motion.div 
          className="lg:col-span-5 w-full flex justify-center items-center relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={imageVariants}
        >
          {/* ছবির পেছনে সজ্জাসংক্রান্ত ২ ডিগ্রি রোটেটেড ফ্রেম */}
          <div className="absolute inset-0 border border-brand-primary/10 rounded-card rotate-2 scale-[1.01] pointer-events-none" />

          <div className="w-full h-[320px] sm:h-[400px] md:h-[440px] lg:h-[500px] rounded-card overflow-hidden shadow-premium border border-brand-neutral-border relative group">
            <img 
              src={defaultFAQInspectorImage} 
              alt="Quality control supervisor inspecting inventory on tablet" 
              className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/15 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};