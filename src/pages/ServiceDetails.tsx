import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  ClipboardCheck, 
  HelpCircle, 
  AlertCircle,
  FileText,
  CheckCircle2,
  Users,
  Building
} from 'lucide-react';
import { fetchServiceBySlug, fetchFAQs, fetchServices } from '../services/firestore';
import { Service, FAQ } from '../shared/types';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ৩ নম্বর পেজ লেআউট অনুযায়ী আসল B2B ফলব্যাক ডাটাসমূহ
const DETAILED_FALLBACK_SERVICES: Record<string, any> = {
  'product-sourcing': {
    name: 'Product Sourcing',
    eyebrow: 'B2B Sourcing Operations',
    shortDescription: 'We specialise in coordinating strict product specification matching with manufacturers across the UK and globally.',
    fullDescription: 'Our Product Sourcing service is structured to protect B2B buyers from fragmented procurement channels and quality mismatches. We organize robust supplier audits and verify compliance paperwork directly with audited manufacturing facilities.',
    challenge: 'Fragmented sourcing processes, unverified supplier networks, and quality parameter mismatches often lead to extensive commercial disputes and delivery delays.',
    solution: 'We conduct supplier evaluations, review compliance certificates, and lock down product metrics prior to contract signing, establishing a predictable procurement route.',
    processSteps: [
      { step: '01', title: 'Requirement Assessment', desc: 'Understanding your detailed product specifications, target volume, and packaging formats.' },
      { step: '02', title: 'Supplier Audit & Matching', desc: 'Sourcing through verified manufacturer networks that meet strict UK hygiene parameters.' },
      { step: '03', title: 'Specification Control', desc: 'Coordinating pre-shipment checks, size metrics, and case weights before cargo dispatch.' },
      { step: '04', title: 'Logistics Allocation', desc: 'Arranging consolidated freight container planning with certified carriers.' }
    ],
    benefits: [
      'traceable product specifications and purity controls',
      'elimination of unverified middleman channels',
      'compliant packaging and labelling reviews',
      'structured trade communication throughout'
    ],
    buyerTypes: ['Wholesalers', 'Importers', 'Retail Chains', 'Hospitality Brands'],
    buyerInfo: [
      'Product specifications (grade, volume, dimensions)',
      'Preferred B2B packaging format (bulk bags, retail boxes)',
      'Target delivery port and timeline parameters',
      'Private-labelling artwork files (if customisation is required)'
    ],
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
  },
  'wholesale-supply': {
    name: 'Wholesale Supply',
    eyebrow: 'Bulk Consignment Planning',
    shortDescription: 'Bulk supply solutions for retailers, distributors, importers and businesses.',
    fullDescription: 'We coordinate stable wholesale supply streams for commercial entities globally. By aligning logistics manifests, container loads, and storage parameters, we secure a predictable and hygienic supply route for high-volume transactions.',
    challenge: 'Inconsistent wholesale quantities, unverified case weights, and poorly planned container transport often disrupt distribution timelines.',
    solution: 'We establish bulk supply agreements with audited producers, securing reserved allocations and container space months in advance.',
    processSteps: [
      { step: '01', title: 'Volume Negotiation', desc: 'Determining wholesale consignment schedules, contract lengths, and optimised pricing.' },
      { step: '02', title: 'Cargo Consolidation', desc: 'Planning safe container loading, pallet patterns, and hygienic case palletization.' },
      { step: '03', title: 'Manifest Coordination', desc: 'Preparing custom manifests, export commercial invoices, and bill of lading documents.' },
      { step: '04', title: 'Consignment Delivery', desc: 'Coordinating smooth delivery and route tracking support to your warehouse.' }
    ],
    benefits: [
      'stable product allocations and price predictability',
      'custom case and pallet configurations',
      'audited freight transit protection',
      'B2B contract compliance monitoring'
    ],
    buyerTypes: ['Wholesale Distributors', 'Supermarket Chains', 'Catering Providers', 'Industrial Buyers'],
    buyerInfo: [
      'Target wholesale quantities and pallet capacities',
      'Specific case and carton packing preferences',
      'Delivery port or inland warehouse details',
      'Required billing and credit documentation'
    ],
    heroImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
  }
};

export const ServiceDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // স্টেট ম্যানেজমেন্ট
  const [service, setService] = useState<any | null>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // ডাইনামিক ডেটা লোডিং লাইফ সাইকেল
  useEffect(() => {
    const loadServiceData = async () => {
      if (!slug) return;
      try {
        setLoading(true);

        // ১. ফায়ারস্টোর থেকে ডাইনামিক সার্ভিস কোয়েরি
        const dbService = await fetchServiceBySlug(slug);

        if (dbService) {
          setService(dbService);
          const [dbRelated, dbFaqs] = await Promise.all([
            fetchServices(),
            fetchFAQs({ serviceId: dbService.id })
          ]);
          setRelatedServices(dbRelated.filter((s: Service) => s.slug !== slug).slice(0, 3));
          setFAQs(dbFaqs);
        } else {
          // ২. ডেটাবেস খালি বা অফলাইন থাকলে ফলব্যাক ডেটা লোড (Part 04, Section 06)
          const fallback = DETAILED_FALLBACK_SERVICES[slug] || DETAILED_FALLBACK_SERVICES['product-sourcing'];
          setService(fallback);
          setFAQs([]);

          // ফলব্যাক রিলেটেড সার্ভিসেস লোড
          const list = Object.keys(DETAILED_FALLBACK_SERVICES)
            .filter(k => k !== slug)
            .map(k => ({ ...DETAILED_FALLBACK_SERVICES[k], slug: k }))
            .slice(0, 3);
          setRelatedServices(list);
        }
      } catch (error) {
        console.error('[ServiceDetails load error]:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServiceData();
  }, [slug]);

  if (loading) {
    return (
      <div className="premium-container px-4 py-24 animate-pulse">
        <div className="h-6 bg-brand-neutral-gray rounded w-1/4 mb-4" />
        <div className="h-10 bg-brand-neutral-gray rounded w-2/3 mb-10" />
        <div className="w-full h-80 bg-brand-neutral-gray rounded-card mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-brand-neutral-gray rounded w-full" />
          <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="premium-container px-4 py-24 text-center max-w-md mx-auto flex flex-col items-center">
        <AlertCircle className="w-14 h-14 text-brand-primary/10 mb-4" />
        <h1 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-2">Service Not Found</h1>
        <p className="text-sm text-brand-neutral-muted mb-6">The requested B2B service is unavailable in our directory.</p>
        <Button to="/services" variant="primary">Browse All Services</Button>
      </div>
    );
  }

  return (
    <>
      {/* ডাইনামিক সার্ভিস এসইও মেটা ট্যাগস (Part 04, Section 06) */}
      <Helmet>
        <title>{service.name} | B2B Sourcing & Sourcing Solutions | {BRAND_INFO.name}</title>
        <meta name="description" content={service.shortDescription} />
        <link rel="canonical" href={`https://zmsupplier.co.uk/services/${slug}`} />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* ব্রেডক্রাম্বস */}
        <nav aria-label="Breadcrumb" className="premium-container px-4 pt-6 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider select-none">
          <ol className="flex flex-wrap items-center space-x-2">
            <li><Link to="/" className="hover:text-brand-primary transition-colors">Home</Link></li>
            <li><span>/</span></li>
            <li><Link to="/services" className="hover:text-brand-primary transition-colors">Services</Link></li>
            <li><span>/</span></li>
            <li className="text-brand-primary" aria-current="page">{service.name}</li>
          </ol>
        </nav>

        {/* সার্ভিস হিরো এরিয়া (ডেকোরেটেড স্প্লিট লেআউট - Part 04, Section 06) */}
        <section className="py-12 text-left relative overflow-hidden">
          <div className="premium-container px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* বাম কলাম: সার্ভিস হেডিংস ও ওভারভিউ (ডেস্কটপে ৭ কলাম) */}
            <div className="lg:col-span-7 flex flex-col text-left">
              <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block">
                {service.eyebrow || 'ZM Services'}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-[44px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-5">
                {service.name}
              </h1>
              <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6">
                {service.fullDescription || service.shortDescription}
              </p>
              
              <div className="flex gap-4">
                <Button to={`/request-quote?service=${slug}`} variant="primary" size="md">
                  Request a Quote
                </Button>
                <Button to="/contact" variant="outline" size="md">
                  Discuss Requirements
                </Button>
              </div>
            </div>

            {/* ডান কলাম: অপ্টিমাইজড সার্ভিস ইমেজ প্যানেল (ডেস্কটপে ৫ কলাম) */}
            <div className="lg:col-span-5 w-full h-[240px] sm:h-[320px] md:h-[360px] rounded-card overflow-hidden shadow-premium border border-brand-neutral-border relative group">
              <img 
                src={service.heroImage?.secureUrl || service.heroImage || 'https://placehold.co/600x450/024e33/ffffff?text=ZM+Service'} 
                alt={`${service.name} B2B solutions`}
                className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/15 via-transparent to-transparent pointer-events-none" />
            </div>

          </div>
        </section>

        {/* বায়ার চ্যালেঞ্জ ও কোম্পানি সলিউশন স্প্লিট সেকশন (Buyer Challenge vs Solution - Part 04, Section 06) */}
        {(service.challenge || service.solution) && (
          <section className="py-16 bg-white border-y border-brand-neutral-border text-left relative overflow-hidden">
            <div className="premium-container px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative z-10">
              
              {/* বায়ার চ্যালেঞ্জ কার্ড (পেশাদার কপিরাইটিং) */}
              <div className="bg-brand-bg-alt/50 p-8 rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between text-left">
                <div>
                  <span className="text-[10px] font-extrabold text-red-600 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 uppercase tracking-wide inline-block mb-3">The Challenge</span>
                  <h3 className="font-heading font-extrabold text-lg text-brand-neutral-charcoal mb-4">Commercial Sourcing Discrepancies</h3>
                  <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                    {service.challenge}
                  </p>
                </div>
              </div>

              {/* কোম্পানি সলিউশন কার্ড */}
              <div className="bg-brand-bg-alt/50 p-8 rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between text-left">
                <div>
                  <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 uppercase tracking-wide inline-block mb-3">Our Solution</span>
                  <h3 className="font-heading font-extrabold text-lg text-brand-neutral-charcoal mb-4">Structured Coordination & Sourcing</h3>
                  <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                    {service.solution}
                  </p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ৪-ধাপের কাজের প্রসেস টাইমলাইন (ডায়নামিক স্টেপ লোডিং - Part 04, Section 06) */}
        {service.processSteps?.length > 0 && (
          <section className="py-16 bg-brand-bg-alt text-left border-b border-brand-neutral-border">
            <div className="premium-container px-4">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-10 border-b border-brand-neutral-border pb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5.5 h-5.5 text-brand-primary" />
                Service Execution Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {service.processSteps.map((step: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-brand-neutral-border shadow-soft flex flex-col justify-between h-full relative group">
                    <div className="absolute top-4 right-4 font-heading font-extrabold text-xl text-brand-accent/25">{step.step}</div>
                    <div className="flex flex-col text-left">
                      <h3 className="font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal mb-2">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ৫. বায়ার চেকলিস্ট এবং সার্ভিস বেনিফিটস স্প্লিট উইন্ডো */}
        <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
          <div className="premium-container px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* বাম কলাম: সার্ভিস বেনিফিটস চেকলিস্ট (ডেস্কটপে ৭ কলাম - Part 04, Section 06) */}
            {service.benefits?.length > 0 && (
              <div className="lg:col-span-7 flex flex-col text-left">
                <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-6 border-b border-brand-neutral-border pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5.5 h-5.5 text-brand-primary" />
                  Key Business Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 bg-brand-bg-alt/40 p-4 rounded-xl border border-brand-neutral-border">
                      <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-brand-neutral-charcoal leading-tight capitalize">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ডান কলাম: বায়ার রিকোয়ারমেন্ট গাইডলাইন কার্ড (ডেস্কটপে ৫ কলাম - Part 04, Section 06) */}
            {service.buyerInfo?.length > 0 && (
              <div className="lg:col-span-5 bg-brand-bg-alt/60 p-6 rounded-card border border-brand-neutral-border shadow-soft text-left">
                <h3 className="font-heading font-bold text-sm text-brand-primary mb-5 flex items-center gap-2 uppercase tracking-wide">
                  <ClipboardCheck className="w-5 h-5 text-brand-primary" />
                  Required Buyer Information
                </h3>
                <ul className="flex flex-col space-y-3.5 text-xs sm:text-sm font-semibold text-brand-neutral-charcoal">
                  {service.buyerInfo.map((info: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </section>

        {/* ৬. সার্ভিস স্পেসিফিক এফএকিউ ব্লক */}
        {faqs.length > 0 && (
          <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
            <div className="premium-container px-4 max-w-content mx-auto">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-8 border-b border-brand-neutral-border pb-3 flex items-center gap-2">
                <HelpCircle className="w-5.5 h-5.5 text-brand-primary" />
                Service Specific FAQs
              </h2>
              <div className="flex flex-col space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-brand-bg-alt/50 border border-brand-neutral-border rounded-xl p-5 shadow-soft">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal mb-2">
                      Q: {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ৭. রিলেটেড বা অন্যান্য সাপ্লাই সার্ভিসেস গ্রিড */}
        {relatedServices.length > 0 && (
          <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
            <div className="premium-container px-4">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-10 border-b border-brand-neutral-border pb-3">
                Other Supply Solutions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedServices.map((rel) => (
                  <div
                    key={rel.slug}
                    className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between overflow-hidden h-full group p-5"
                  >
                    <div className="text-left flex flex-col">
                      <span className="text-[9px] font-extrabold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 px-2.5 py-1 rounded w-fit uppercase mb-3">
                        {rel.eyebrow || 'Wholesale Sourcing'}
                      </span>
                      <h3 className="font-heading font-bold text-base sm:text-lg text-brand-neutral-charcoal mb-2.5 group-hover:text-brand-primary transition-colors">
                        {rel.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed line-clamp-3">
                        {rel.shortDescription}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-brand-neutral-border/50 flex justify-end">
                      <Link 
                        to={`/services/${rel.slug}`}
                        className="text-xs font-bold text-brand-primary flex items-center hover:text-brand-accent-dark transition-colors"
                      >
                        Learn More <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ৮. গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};