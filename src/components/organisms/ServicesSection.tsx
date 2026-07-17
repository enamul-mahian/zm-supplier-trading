import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Award, 
  Tag, 
  ShieldCheck, 
  Truck, 
  ClipboardCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { fetchServices } from '../../services/firestore';
import { Service } from '../../shared/types';
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 80,
    },
  },
};

// ফায়ারস্টোর ডেটাবেস সম্পূর্ণ খালি বা লোড হতে দেরি হলে বায়ারের জন্য ১ নম্বর পেজ প্রিভিউ অনুযায়ী ১০০% আসল ফলব্যাক ডাটা
const FALLBACK_SERVICES = [
  {
    id: 'sourcing',
    name: 'Product Sourcing',
    slug: 'product-sourcing',
    shortDescription: 'We source high-quality products from trusted manufacturers across the UK and globally.',
    iconName: 'Search',
  },
  {
    id: 'wholesale',
    name: 'Wholesale Supply',
    slug: 'wholesale-supply',
    shortDescription: 'Bulk supply solutions for retailers, distributors, importers and businesses.',
    iconName: 'Award',
  },
  {
    id: 'private-label',
    name: 'Private Label',
    slug: 'private-label-support',
    shortDescription: 'Custom private label solutions to build and grow your own brand.',
    iconName: 'Tag',
  },
  {
    id: 'quality',
    name: 'Quality Assurance',
    slug: 'quality-assurance',
    shortDescription: 'Strict quality control and hygienic processes to ensure product safety.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'logistics',
    name: 'Logistics & Delivery',
    slug: 'logistics-planning',
    shortDescription: 'Reliable logistics and on-time delivery across the UK and worldwide.',
    iconName: 'Truck',
  },
  {
    id: 'documentation',
    name: 'Documentation',
    slug: 'commercial-documentation',
    shortDescription: 'Complete export documentation and compliance support for smooth trade.',
    iconName: 'ClipboardCheck',
  },
];

// ডায়নামিক আইকন ট্র্যাকার হেল্পার
// ফিক্স: আইকন থেকে text-brand-primary রিমুভ করা হয়েছে হোভার কাজ করার জন্য
const getServiceIcon = (iconName: string) => {
  const iconStyle = "w-6 h-6";
  switch (iconName) {
    case 'Search': return <Search className={iconStyle} />;
    case 'Award': return <Award className={iconStyle} />;
    case 'Tag': return <Tag className={iconStyle} />;
    case 'ShieldCheck': return <ShieldCheck className={iconStyle} />;
    case 'Truck': return <Truck className={iconStyle} />;
    case 'ClipboardCheck': return <ClipboardCheck className={iconStyle} />;
    default: return <ShieldCheck className={iconStyle} />;
  }
};

const SkeletonCard: React.FC = () => (
  <div className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft h-[240px] animate-pulse flex flex-col justify-between">
    <div>
      <div className="w-12 h-12 bg-brand-neutral-gray rounded-xl mb-4" />
      <div className="h-5 bg-brand-neutral-gray rounded w-2/3 mb-3" />
      <div className="h-4 bg-brand-neutral-gray rounded w-full mb-2" />
      <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
    </div>
    <div className="h-4 bg-brand-neutral-gray rounded w-1/3 mt-4" />
  </div>
);

export const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await fetchServices();
        if (data && data.length > 0) {
          setServices(data.slice(0, 6));
        } else {
          setServices(FALLBACK_SERVICES);
        }
      } catch (error) {
        console.error('[ServicesSection fetch error]:', error);
        setServices(FALLBACK_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    // ফিক্স: py-16 md:py-24 এর পরিবর্তে py-12 lg:py-16 ব্যবহার করা হয়েছে অতিরিক্ত গ্যাপ কমানোর জন্য
    <section className="py-12 lg:py-16 bg-brand-bg text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ডে অত্যন্ত হালকা কাস্টম গোল্ডেন শ্যাডো ডট */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none" />

      <div className="premium-container">
        
        {/* সেকশন হেডার প্যানেল - ফিক্স: গ্যাপ কমানোর জন্য mb-12 দেওয়া হয়েছে */}
        <div className="max-w-xl mb-12">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            What We Do
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            Comprehensive B2B Supply Solutions
          </h2>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
            End-to-end supply solutions tailored for your business needs, ensuring strict quality control and predictable trade flow.
          </p>
        </div>

        {/* সার্ভিসেস কার্ড গ্রিড রেন্ডারিং */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {services.map((service) => (
              <motion.div
                key={service.id || service.slug}
                className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group h-full"
                variants={cardVariants}
              >
                <div>
                  {/* আইকন বক্স - ফিক্স: হোভারের সময় কালার ওভারল্যাপ ঠিক করা হয়েছে */}
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-all duration-300">
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      {getServiceIcon(service.iconName || 'ShieldCheck')}
                    </span>
                  </div>

                  {/* সার্ভিস নাম */}
                  <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-2.5 group-hover:text-brand-primary transition-colors duration-300">
                    {service.name}
                  </h3>

                  {/* সার্ভিস ডেসক্রিপশন */}
                  <p className="text-sm text-brand-neutral-muted leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                {/* "Learn More" ডায়নামিক অ্যাকশন লিঙ্ক */}
                <div className="mt-6 pt-5 border-t border-brand-neutral-border/50">
                  <Link 
                    to={`/services/${service.slug}`}
                    className="inline-flex items-center text-xs font-bold text-brand-primary tracking-wider uppercase group-hover:text-brand-accent-dark transition-colors duration-300"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* সেকশনের নিচে গ্লোবাল অ্যাকশন সিটিএ বার */}
        <div className="mt-12 text-center">
          <Button to="/services" variant="outline" size="md">
            View All Services
          </Button>
        </div>

      </div>
    </section>
  );
};