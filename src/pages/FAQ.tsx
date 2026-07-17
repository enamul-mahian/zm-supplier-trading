import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, HelpCircle, Phone, Mail, Search } from 'lucide-react';
import { fetchFAQs } from '../services/firestore';
import { BRAND_INFO, FALLBACK_FAQS } from '../shared/constants';
import { FAQ as FAQType } from '../shared/types';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';

// অ্যাকোর্ডিয়ন ওপেন/ক্লোজ অ্যানিমেশন কনফিগ (Part 06, Rule 32)
const accordionVariants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ৮ নম্বর পেজ লেআউট অনুযায়ী আসল B2B ফলব্যাক ডাটাসমূহ
const DETAILED_FALLBACK_FAQS = [
  {
    id: 'f1',
    question: 'What does ZM Supplier & Trading specialise in?',
    answer: 'We specialise in the UK-standard sourcing, wholesale product supply, private-label coordination, and cross-border logistics support for commercial buyers worldwide.',
    categoryId: 'General',
    isEnabled: true,
    sortOrder: 1,
  },
  {
    id: 'f2',
    question: 'Do you supply products to businesses only?',
    answer: 'Yes, ZM Supplier & Trading is strictly a B2B supplier. We only serve commercial entities, retail chains, hospitality providers, manufacturers, and wholesale distributors.',
    categoryId: 'General',
    isEnabled: true,
    sortOrder: 2,
  },
  {
    id: 'f3',
    question: 'What is your standard Minimum Order Quantity (MOQ)?',
    answer: 'Our Minimum Order Quantity (MOQ) varies depending on the product, variant, and packaging format. Typically, UK wholesale orders start at 1 full pallet, while global export consignments require full container loads (FCL or LCL).',
    categoryId: 'Wholesale',
    isEnabled: true,
    sortOrder: 3,
  },
  {
    id: 'f4',
    question: 'Can you source products not listed on your website?',
    answer: 'Absolutely. A significant part of our business is custom product sourcing. If you require a specific specification, grade, or product type not listed in our public catalogue, you can submit a sourcing request through our dedicated quote page.',
    categoryId: 'Sourcing',
    isEnabled: true,
    sortOrder: 4,
  },
  {
    id: 'f5',
    question: 'Do you offer private-label and customised packaging support?',
    answer: 'Yes. We coordinate private-label solutions for selected products, including customised brand labelling, specialised case sizing, and biodegradable container options. Private-label orders typically require higher MOQs depending on manufacturer parameters.',
    categoryId: 'Private Label',
    isEnabled: true,
    sortOrder: 5,
  },
  {
    id: 'f6',
    question: 'Do you coordinate international freight and custom documents?',
    answer: 'Yes, we coordinate cross-border logistics and freight planning with certified cargo partners. We also assist in preparing and coordinating cargo manifests, proforma invoices, and international trade checklists. We do not provide regulated customs brokerage or legal clearance guarantees.',
    categoryId: 'Logistics',
    isEnabled: true,
    sortOrder: 6,
  },
  {
    id: 'f7',
    question: 'How do you ensure product quality and hygienic standards?',
    answer: 'Our quality framework includes strict supplier audits, information assessments, specification parameter reviews, and hygienic storage expectations with our production partners before any loading takes place.',
    categoryId: 'Sourcing',
    isEnabled: true,
    sortOrder: 7,
  },
  {
    id: 'f8',
    question: 'How can my business request a quotation?',
    answer: 'You can easily request a quotation by navigating to our Request a Quote page. Provide your desired products, target volume, destination, timeline, and packaging requirements, and our trade desk will compile a professional quotation response.',
    categoryId: 'General',
    isEnabled: true,
    sortOrder: 8,
  }
];

// সিএলএস (CLS) মুক্ত করতে পালস স্কেলেটন প্লেসহোল্ডার
const FAQPageSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-14 bg-brand-neutral-gray rounded-xl w-full" />
    <div className="h-14 bg-brand-neutral-gray rounded-xl w-full" />
    <div className="h-14 bg-brand-neutral-gray rounded-xl w-full" />
  </div>
);

export const FAQPage: React.FC = () => {
  const [faqs, setFAQs] = useState<FAQType[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQType[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // প্রথম এফএকিউটি ডিফল্ট ওপেন থাকবে
  const [loading, setLoading] = useState(true);

  // ফিল্টার ও সার্চ স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', 'General', 'Sourcing', 'Wholesale', 'Logistics', 'Private Label'];

  // কোয়ালিটি কন্ট্রোল এবং ইন্সপেক্টরের রিয়াল পোট্রেট ওয়ারহাউজ ইমেজ (৮ নম্বর পেজের গাইডলাইন অনুযায়ী)
  const defaultFAQInspectorImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600';

  // ফায়ারস্টোর থেকে অল এফএকিউ কোয়েরি লাইফ সাইকেল
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setLoading(true);
        const data = await fetchFAQs();
        if (data && data.length > 0) {
          setFAQs(data as FAQType[]);
        } else {
          setFAQs(DETAILED_FALLBACK_FAQS as FAQType[]);
        }
      } catch (error) {
        console.error('[FAQ Page fetch error]:', error);
        setFAQs(DETAILED_FALLBACK_FAQS as FAQType[]);
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, []);

  // সার্চ এবং ক্যাটাগরি ফিল্টারিং মেকানিজম (রিয়েল-টাইম ক্লায়েন্ট সাইড সিঙ্ক)
  useEffect(() => {
    let result = [...faqs];

    // ১. ক্যাটাগরি ট্যাব ফিল্টার
    if (activeTab !== 'All') {
      result = result.filter(faq => faq.categoryId?.toLowerCase() === activeTab.toLowerCase());
    }

    // ২. সার্চ কুয়েরি ফিল্টার
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        faq => 
          faq.question.toLowerCase().includes(q) || 
          faq.answer.toLowerCase().includes(q) ||
          faq.categoryId?.toLowerCase().includes(q)
      );
    }

    setFilteredFAQs(result);
    setExpandedIndex(result.length > 0 ? 0 : null); // ফিল্টার পরিবর্তনের পর প্রথম আইটেম ডিফল্ট ওপেন হবে
  }, [faqs, searchQuery, activeTab]);

  // অ্যাকোর্ডিয়ন ওপেন/ক্লোজ টগল করার হুক
  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      {/* গ্লোবাল এবং ক্যাটালগ স্পেসিফিক এসইও মেটা ট্যাগস (Part 07, Rule 06) */}
      <Helmet>
        <title>Frequently Asked Questions | {BRAND_INFO.name} | B2B Support</title>
        <meta name="description" content="Find answers to common B2B sourcing, wholesale supply orders, private label, international export, and quality checking questions at ZM Supplier & Trading." />
        <link rel="canonical" href="https://zmsupplier.co.uk/faq" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* মেইন পেজ হিরো ব্যানার */}
        <section className="bg-brand-secondary text-white py-16 text-left relative overflow-hidden border-b border-brand-secondary-dark">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
          
          <div className="premium-container relative z-10">
            <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
              <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
              <span>/</span>
              <span className="text-brand-accent">FAQ</span>
            </nav>
            <span className="text-brand-accent font-heading font-extrabold text-xs tracking-wider uppercase mb-2 inline-block">
              B2B Support
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
              Find clear answers to your commercial sourcing, wholesale ordering, and global logistics coordination enquiries.
            </p>
          </div>
        </section>

        {/* সার্চ এবং ক্যাটাগরি ফিল্টার প্যানেল */}
        <section className="py-8 bg-brand-bg border-b border-brand-neutral-border text-left relative z-20">
          <div className="premium-container px-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              {/* সার্চ ইনপুট */}
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
                />
              </div>
            </div>

            {/* ডাইনামিক ক্যাটাগরি ফিল্টার ট্যাব */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pb-2 border-t border-brand-neutral-border/50 pt-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`text-xs sm:text-sm font-bold tracking-wide px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === cat
                      ? 'bg-brand-primary text-white shadow-soft'
                      : 'bg-brand-surface border border-brand-neutral-border text-brand-neutral-muted hover:border-brand-primary/30 hover:text-brand-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* এফএকিউ অ্যাকোর্ডিয়ন এরিয়া */}
        <section className="py-16 bg-white text-left relative min-h-[400px]">
          <div className="premium-container px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* বাম কলাম: কাস্টম এফএকিউ অ্যাকোর্ডিয়ন গ্রিড (ডেস্কটপে ৭ কলাম) */}
            <div className="lg:col-span-7 flex flex-col text-left">
              {loading ? (
                <FAQPageSkeleton />
              ) : filteredFAQs.length > 0 ? (
                /* অ্যাকোর্ডিয়ন কন্টেইনার (A11y ARIA Attributes Compliant) */
                /* ডায়নামিক key যুক্ত করে ফ্রেমার মোশন ফিল্টারিং বাগ ফিক্স করা হলো */
                <motion.div 
                  key={`${activeTab}_${searchQuery}`} 
                  className="flex flex-col space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                >
                  {filteredFAQs.map((faq, index) => {
                    const isOpen = expandedIndex === index;
                    const buttonId = `faq-page-btn-${index}`;
                    const panelId = `faq-page-panel-${index}`;

                    return (
                      <motion.div
                        key={faq.id}
                        variants={fadeUpVariants}
                        className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                          isOpen 
                            ? 'border-brand-primary bg-brand-bg-alt/40 shadow-soft' 
                            : 'border-brand-neutral-border bg-brand-surface hover:border-brand-primary/30'
                        }`}
                      >
                        {/* অ্যাকোর্ডিয়ন বাটন */}
                        <button
                          id={buttonId}
                          aria-controls={panelId}
                          aria-expanded={isOpen}
                          onClick={() => toggleAccordion(index)}
                          className="w-full flex justify-between items-center p-5 text-left font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal transition-colors duration-300 hover:text-brand-primary focus-visible:bg-brand-primary/5"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 px-2 py-0.5 rounded-md uppercase shrink-0">
                              {faq.categoryId}
                            </span>
                            <span>{faq.question}</span>
                          </span>
                          <ChevronDown className={`w-5 h-5 text-brand-neutral-muted transition-transform duration-300 shrink-0 ml-4 ${
                            isOpen ? 'rotate-180 text-brand-primary' : ''
                          }`} />
                        </button>

                        {/* অ্যাকোর্ডিয়ন কন্টেন্ট */}
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
                              <div className="px-5 pb-5 text-xs sm:text-sm text-brand-neutral-muted leading-relaxed border-t border-brand-neutral-border/50 pt-3 pl-5 sm:pl-16">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                // খালি স্টেট
                <div className="text-center py-12 flex flex-col items-center max-w-md mx-auto">
                  <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 border border-brand-primary/10">
                    <HelpCircle className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-brand-neutral-charcoal mb-2">
                    No Questions Found
                  </h3>
                  <p className="text-sm text-brand-neutral-muted leading-relaxed mb-6">
                    No frequently asked questions match your current query or filter. Please reset filters.
                  </p>
                  <Button onClick={() => { setSearchQuery(''); setActiveTab('All'); }} variant="primary" size="md">
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>

            {/* ডান কলাম: প্রিমিয়াম ওয়ারহাউজ ইন্সপেক্টরের পোর্ট্রেট ইমেজ (ডেস্কটপে ৫ কলাম) */}
            <div className="lg:col-span-5 w-full flex justify-center items-center relative">
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
            </div>

          </div>
        </section>

        {/* ৭. কাস্টম "Still Need Help?" সেকশন */}
        <section className="py-16 bg-brand-bg text-left border-b border-brand-neutral-border">
          <div className="premium-container px-4 max-w-content mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* বাম পাশে হেল্প বিবরণী */}
            <div className="text-left">
              <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-2 inline-block">Support Desk</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal mb-4">
                Still Have Questions?
              </h2>
              <p className="text-sm text-brand-neutral-muted leading-relaxed max-w-md">
                Can't find the answer you need? Our dedicated commercial sourcing team is ready to assist you. Contact us directly or start an order enquiry.
              </p>
            </div>

            {/* ডান পাশে সাহায্যকারী কন্টাক্ট অ্যাকশনস */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start md:justify-end">
              <Button to="/contact" variant="outline" size="md">
                <Mail className="w-4 h-4 mr-2" />
                Contact Our Team
              </Button>
              <Button to="/request-quote" variant="primary" size="md">
                <Mail className="w-4 h-4 mr-2" />
                Submit Enquiry
              </Button>
            </div>

          </div>
        </section>

        {/* ৮. গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};