import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Package } from 'lucide-react';
import { fetchCategories } from '../../services/firestore';
import { ProductCategory } from '../../shared/types';
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা লোড হতে দেরি হলে প্রজেক্ট গাইডলাইন অনুযায়ী খাঁটি B2B ক্যাটাগরি ফলব্যাক ডাটা
const FALLBACK_CATEGORIES = [
  {
    id: 'cat-packaged-foods',
    name: 'Packaged Foods',
    slug: 'packaged-foods',
    shortDescription: 'High-quality preserved food products, canned items, and grocery pantry supplies.',
    cardImage: {
      secureUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
    },
    sortOrder: 1,
  },
  {
    id: 'cat-beverages',
    name: 'Beverages',
    slug: 'beverages',
    shortDescription: 'Premium juices, mineral waters, soft drinks, tea leaf selections, and coffee.',
    cardImage: {
      secureUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600'
    },
    sortOrder: 2,
  },
  {
    id: 'cat-dry-goods',
    name: 'Dry Goods',
    slug: 'dry-goods',
    shortDescription: 'Authentic Basmati rice, pulses, wheat flour, and premium organic spices.',
    cardImage: {
      secureUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600'
    },
    sortOrder: 3,
  },
  {
    id: 'cat-hospitality',
    name: 'Hospitality Supplies',
    slug: 'hospitality-supplies',
    shortDescription: 'Disposable packaging, commercial kitchen containers, and hygienic supplies.',
    cardImage: {
      secureUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'
    },
    sortOrder: 4,
  },
];

// স্কেলেটন পালস লোডার (CLS প্রতিরোধ করার জন্য - Part 03, Section 28)
const CategorySkeleton: React.FC = () => (
  <div className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft h-[360px] animate-pulse overflow-hidden flex flex-col justify-between">
    <div className="w-full h-44 bg-brand-neutral-gray" />
    <div className="p-5 flex-grow flex flex-col justify-between">
      <div>
        <div className="h-5 bg-brand-neutral-gray rounded w-2/3 mb-3" />
        <div className="h-4 bg-brand-neutral-gray rounded w-full mb-2" />
        <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
      </div>
      <div className="h-4 bg-brand-neutral-gray rounded w-1/3 mt-4" />
    </div>
  </div>
);

export const ProductCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারস্টোর থেকে ক্যাটাগরি ডেটা লোড করার লাইফ সাইকেল
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        if (data && data.length > 0) {
          // ক্যাটালগ সেকশনের ফ্লো অনুযায়ী ৪টি প্রধান ক্যাটাগরি স্লাইড করা হচ্ছে
          setCategories(data.slice(0, 4));
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error('[ProductCategoriesSection fetch error]:', error);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ডে কাস্টম পান্না সবুজ ফ্লেয়ার */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none" />

      <div className="premium-container">
        
        {/* সেকশন হেডার কন্টেইনার */}
        <div className="max-w-xl mb-12 lg:mb-16">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            Product Catalogue
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            Wide Range of Quality Products
          </h2>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
            Explore our curated B2B categories designed for wholesale supply and commercial trade. Sourced globally to ensure strict UK standards of purity and hygiene.
          </p>
        </div>

        {/* ক্যাটাগরি গ্রিড রেন্ডারার */}
        {loading ? (
          // ১. প্রথম রেন্ডারে ৪-কলামের প্লেসহোল্ডার স্কেলেটন লোড
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
          </div>
        ) : (
          // ২. ডেটা লোড সম্পন্ন হলে মেইন রেসপন্সিভ গ্রিড
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id || category.slug}
                className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group"
                variants={cardVariants}
              >
                {/* ক্যাটাগরি ইমেজ ব্লক (Part 02 - border radius '20px'/'rounded-card' এর সাথে মিল রেখে কাস্টমাইজড ক্রপ) */}
                <div className="w-full h-44 overflow-hidden relative border-b border-brand-neutral-border">
                  <img 
                    src={category.cardImage?.secureUrl || 'https://placehold.co/600x400/024e33/ffffff?text=Product+Category'} 
                    alt={`${category.name} B2B Category`} 
                    className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* কাস্টম ক্যাটাগরি ব্যাজ বা আইকন ফ্ল্যাগ */}
                  <div className="absolute top-3 left-3 bg-brand-secondary/90 backdrop-blur-sm text-brand-accent text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-soft border border-brand-primary-light flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>Wholesale</span>
                  </div>
                </div>

                {/* ক্যাটাগরি ডেসক্রিপশন কন্টেইনার */}
                <div className="p-5 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2 group-hover:text-brand-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-xs text-brand-neutral-muted leading-relaxed">
                      {category.shortDescription}
                    </p>
                  </div>

                  {/* ক্যাটাগরি ভিত্তিক MOQ সতর্কবার্তা */}
                  <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-brand-neutral-charcoal bg-brand-bg-alt/80 px-3 py-1.5 rounded-lg border border-brand-neutral-border">
                    <span>MOQ: Sourcing Specific</span>
                    <span className="text-brand-primary">Clean presentation</span>
                  </div>

                  {/* "View Category" অ্যাকশন বাটন লিঙ্ক (ডায়নামিক স্লাগ দিয়ে লিঙ্কিং - Part 04) */}
                  <div className="mt-5 pt-4 border-t border-brand-neutral-border/50">
                    <Link 
                      to={`/categories/${category.slug}`}
                      className="inline-flex items-center text-xs font-bold text-brand-primary tracking-wider uppercase group-hover:text-brand-accent-dark transition-colors duration-300"
                    >
                      <span>Explore Category</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* গ্লোবাল সিটিএ বাটন ক্যাটালগ ডিরেক্টরির জন্য */}
        <div className="mt-12 text-center">
          <Button to="/products" variant="primary" size="md">
            View All Products
          </Button>
        </div>

      </div>
    </section>
  );
};