import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Testimonial } from '../../shared/types';
import { Sparkles, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// স্লাইড পরিবর্তনের ফেইড ট্রানজিশন কনফিগ (Part 06, Rule 32)
const slideVariants = {
  enter: { opacity: 0, x: 15 },
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.3, ease: 'easeIn' } },
};

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে বায়ারের ৭ নম্বর পেজ লেআউট অনুযায়ী আসল B2B ফলব্যাক ডাটাসমূহ
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    quote: "ZM Supplier & Trading has been a reliable partner in managing our food sourcing requirements. Their structured approach, supply coordination, and consistent communication have helped us maintain stable supply operations across multiple orders.",
    clientName: "Lukas Meyer",
    role: "Procurement Manager",
    company: "Meyer Foods GmbH",
    country: "Germany",
    isEnabled: true,
    sortOrder: 1,
  },
  {
    id: 'testi-2',
    quote: "Their private-label support and tailored packaging solutions have allowed us to expand our brand footprint efficiently. A truly professional supply chain coordinator that values commercial standards.",
    clientName: "Sarah Jenkins",
    role: "Director of Sourcing",
    company: "Crown Grocers Ltd",
    country: "United Kingdom",
    isEnabled: true,
    sortOrder: 2,
  },
  {
    id: 'testi-3',
    quote: "Extremely reliable wholesale supply and prompt responses to B2B enquiries. They make complex international product supply feel remarkably structured and predictable.",
    clientName: "Mateo Ricci",
    role: "Operations Director",
    company: "Ricci Wholesale",
    country: "Italy",
    isEnabled: true,
    sortOrder: 3,
  },
];

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [loading, setLoading] = useState(true);

  // কার্গো ট্রাকের প্রিমিয়াম B2B ইমেজ (৭ নম্বর পেজের গাইডলাইন অনুযায়ী)
  const defaultCargoTruckImage = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800';

  // ফায়ারস্টোর থেকে ডায়নামিক প্রশংসাপত্র ডেটা লোড
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        const ref = collection(db, 'testimonials');
        // ফিক্স: orderBy রিমুভ করা হয়েছে ইনডেক্স এরর বাইপাস করার জন্য
        const q = query(ref, where('isEnabled', '==', true));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // ফিক্স: ক্লায়েন্ট-সাইডে sortOrder অনুযায়ী ডেটা সাজানো হচ্ছে
        list.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

        if (list.length > 0) {
          setTestimonials(list);
        } else {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } catch (error) {
        console.error('[TestimonialsSection fetch error]:', error);
        setTestimonials(FALLBACK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  // অটোপ্লে হ্যান্ডলার
  useEffect(() => {
    if (!autoplay || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const handlePrev = () => {
    setAutoplay(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setAutoplay(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setAutoplay(false);
    setActiveIndex(index);
  };

  return (
    <section className="home-section bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

      <div className="premium-container">
        
        <div className="max-w-xl mb-12 lg:mb-16">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            Social Proof
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            Trusted by Businesses That Value Reliable Supply
          </h2>
        </div>

        {loading ? (
          <div className="bg-brand-bg-alt rounded-card border border-brand-neutral-border p-8 h-[340px] animate-pulse" />
        ) : (
          <div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-brand-bg-alt rounded-card border border-brand-neutral-border p-6 sm:p-8 lg:p-10 relative"
            onMouseEnter={() => setAutoplay(false)} 
            onMouseLeave={() => setAutoplay(true)}
          >
            
            <div className="lg:col-span-7 flex flex-col justify-between h-full min-h-[260px] sm:min-h-[220px]">
              
              <div className="relative">
                <Quote className="w-12 h-12 text-brand-primary/10 absolute -top-4 -left-2 rotate-180" />
                
                <div className="relative z-10 pl-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="text-sm sm:text-base md:text-lg text-brand-neutral-charcoal font-medium leading-relaxed italic"
                    >
                      "{testimonials[activeIndex]?.quote}"
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mt-8 pl-6">
                <div>
                  <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal leading-none mb-1.5">
                    {testimonials[activeIndex]?.clientName}
                  </h3>
                  <p className="text-xs text-brand-neutral-muted font-semibold tracking-wide">
                    {testimonials[activeIndex]?.role}, <span className="text-brand-primary">{testimonials[activeIndex]?.company}</span> ({testimonials[activeIndex]?.country})
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-lg bg-brand-surface border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:shadow-soft transition-all duration-300"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex space-x-1.5">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === activeIndex ? 'w-5 bg-brand-primary' : 'w-2 bg-brand-neutral-muted/40'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                        aria-current={idx === activeIndex ? 'true' : 'false'}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-lg bg-brand-surface border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:shadow-soft transition-all duration-300"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full h-[240px] sm:h-[280px] lg:h-[300px] rounded-card overflow-hidden shadow-soft border border-brand-neutral-border relative group">
              <img 
                src={defaultCargoTruckImage} 
                alt="Modern cargo transport truck delivering wholesale products" 
                className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/10 via-transparent to-transparent pointer-events-none" />
            </div>

          </div>
        )}

      </div>
    </section>
  );
};